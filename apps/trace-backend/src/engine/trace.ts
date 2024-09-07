import { Network, Alchemy, TransactionResponse } from "alchemy-sdk";
import dotenv from "dotenv";
import { AssetTransfersCategory } from "alchemy-sdk";
import { BalanceInfo } from "common";
import { mappedData } from "common";
dotenv.config();

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
};

const alchemy = new Alchemy(config);

const balances: Map<string, string> = new Map();
const visited: Map<string, boolean> = new Map();

async function getTransactions(fromAddress: string) {
  let response = await alchemy.core.getAssetTransfers({
    fromAddress: fromAddress,
    category: [
      AssetTransfersCategory.EXTERNAL,
      AssetTransfersCategory.INTERNAL,
      AssetTransfersCategory.ERC20
    ],
  });
  return response["transfers"];
}

function checkBalances(): BalanceInfo[] {
  const sortedBalances: BalanceInfo[] = [];

  for (const [address, value] of balances) {
    const balance = parseFloat(value);
    if (!isNaN(balance)) {
      sortedBalances.push({ address, balance });
    }
  }

  sortedBalances.sort((a, b) => b.balance - a.balance);

  return sortedBalances.slice(0, 3);
}

const traceTransaction = async (
  tx: mappedData,
  retries = 3
): Promise<BalanceInfo[] | undefined> => {
  try {
    const initialAddress = tx.to ?? "";

    const resto = parseFloat(balances.get(tx.to ?? "") ?? "0");
    balances.set(tx.to ?? "", (resto + parseFloat(tx.value)).toString());
    const resfrom = parseFloat(balances.get(tx.from ?? "") ?? "0");
    balances.set(tx.from ?? "", (resfrom - parseFloat(tx.value)).toString());

    if (visited.get(initialAddress) === true) return;
    console.log(initialAddress);
    visited.set(initialAddress, true);

    const transactions = await getTransactions(initialAddress);

    for (const tx of transactions) {
      const txn: mappedData = {
        from: tx.from,
        to: tx.to as string,
        value: tx.value?.toString() as string,
        txHash: tx.hash,
        blockNumber: parseInt(tx.blockNum, 16),
      };

      if (txn.blockNumber < INITIAL_BLOCK_NUMBER) {
        continue;
      }
      await traceTransaction(txn);
    }

    const endReceiver = checkBalances();
    return endReceiver;
  } catch (error) {
    console.error("Error:", error);
    if (retries > 0) {
      console.log(`Retrying... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      console.error("Max retries reached. Unable to process transaction:");
      return undefined;
    }
  }
};

let INITIAL_BLOCK_NUMBER = 0;

export const startTrace = async (Hash: string) => {

  const tx = (await alchemy.transact.getTransaction(
    Hash
  )) as TransactionResponse;

  const weiValue = tx.value.toString(); 
  const weiLength = weiValue.length;

  // If the length of the string is greater than 18, insert the decimal point
  let ethValue;
  if (weiLength > 18) {
    ethValue =
      weiValue.slice(0, weiLength - 18) + "." + weiValue.slice(weiLength - 18);
  } else {
    // If it's less than or equal to 18, prepend zeros to the start and then add the decimal
    const paddedWeiValue = weiValue.padStart(18, "0");
    ethValue = "0." + paddedWeiValue;
  }

  INITIAL_BLOCK_NUMBER = tx.blockNumber as number;
  const txObj: mappedData = {
    from: tx.from.toLowerCase(),
    to: tx.to?.toLowerCase() as string,
    value: ethValue,
    txHash: tx.hash,
    blockNumber: Number(tx.blockNumber),
  };
  console.log("==========================================");
  console.log("Starting Transaction Trace...");
  console.log("==========================================");
  const endReceivers = await traceTransaction(txObj);
  console.log("==========================================");
  console.log("Top 3 End Receivers:");
  console.log("==========================================");
  for (const endReceiver of endReceivers ?? []) {
    console.log(`${endReceiver.address}: ${endReceiver.balance}`);
  }
  return endReceivers;
};
