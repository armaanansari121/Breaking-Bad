import { Network, Alchemy, TransactionResponse } from "alchemy-sdk";
import dotenv from "dotenv";
import { AssetTransfersCategory } from "alchemy-sdk";
import {
  BalanceInfo,
  mappedData,
  NodeAttributes,
  EdgeAttributes,
} from "common";
import Graph from "graphology";
import { PrismaClient } from '@repo/db';
dotenv.config();

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
};

const prisma = new PrismaClient();
const alchemy = new Alchemy(config);

const CEX: string[] = [
  "0x90Ddd895BC208B6F58009cdac20AcD94EcCf6f70".toLowerCase(),
  "0x0719cA187937b3D73C6EBab7179502CDbdE3bd69".toLowerCase(),
];

const graph: Graph<NodeAttributes, EdgeAttributes> = new Graph({ multi: true });

const cexAddresses: string[] = [];

function convertWeiToEth(val: number) {
  const weiValue = val.toString();
  const weiLength = weiValue.length;
  let ethValue;
  if (weiLength > 18) {
    ethValue =
      weiValue.slice(0, weiLength - 18) + "." + weiValue.slice(weiLength - 18);
  } else {
    const paddedWeiValue = weiValue.padStart(18, "0");
    ethValue = "0." + paddedWeiValue;
  }
  return ethValue;
}

function checkBalances(): BalanceInfo[] {
  let sortedBalances: BalanceInfo[] = [];

  graph.forEachNode((node, attributes) => {
    const balance = parseFloat(attributes.balance);
    if (!isNaN(balance)) {
      sortedBalances.push({ address: node, balance });
    }
  });

  sortedBalances.sort((a, b) => b.balance - a.balance);
  sortedBalances = sortedBalances.filter(
    (balInfo) => !CEX.includes(balInfo.address)
  );

  return sortedBalances.slice(0, 5);
}

async function getTransactions(fromAddress: string) {
  let response = await alchemy.core.getAssetTransfers({
    fromAddress: fromAddress,
    category: [
      AssetTransfersCategory.EXTERNAL,
      AssetTransfersCategory.INTERNAL,
      AssetTransfersCategory.ERC20,
    ],
  });
  return response["transfers"];
}

const traceTransaction = async (
  tx: mappedData,
  retries = 3
): Promise<BalanceInfo[] | undefined> => {
  try {
    if (!tx.to || tx.to.trim() === "") {
      const receipt = await alchemy.core.getTransactionReceipt(tx.txHash);
      if (receipt && receipt.contractAddress) {
        tx.to = receipt.contractAddress.toLowerCase();
      } else {
        return undefined;
      }
    }

    const existedTo = graph.hasNode(tx.to);
    const existedFrom = graph.hasNode(tx.from);

    if (!existedTo) {
      graph.addNode(tx.to, { balance: "0" });
    }
    if (!existedFrom) {
      graph.addNode(tx.from, { balance: "0" });
    }

    graph.addEdge(tx.from, tx.to, {
      from: tx.from,
      to: tx.to,
      value: tx.value,
      txHash: tx.txHash,
      blockNumber: tx.blockNumber,
    });

    graph.updateNodeAttribute(tx.to ?? "", "balance", (bal) => {
      if (bal) return (parseFloat(bal) + parseFloat(tx.value)).toString();
      return parseFloat(tx.value).toString();
    });
    graph.updateNodeAttribute(tx.from ?? "", "balance", (bal) => {
      if (bal) return (parseFloat(bal) - parseFloat(tx.value)).toString();
      return parseFloat(tx.value).toString();
    });

    if (CEX.includes(tx.to)) {
      cexAddresses.push(tx.from);
    }

    if (existedTo) return;
    console.log(tx.to);

    const transactions = await getTransactions(tx.to);

    for (const tx of transactions) {
      const txn: mappedData = {
        from: tx.from,
        to: tx.to as string,
        value: tx.value?.toString() as string,
        txHash: tx.hash,
        blockNumber: parseInt(tx.blockNum, 16),
      };
      if (!txn.value) {
        txn.value = convertWeiToEth(Number(tx.rawContract.value));
      }
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


  const ethValue = convertWeiToEth(Number(tx.value));


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
  console.log("Top 5 End Receivers:");
  console.log("==========================================");
  for (const endReceiver of endReceivers ?? []) {
    console.log(`${endReceiver.address}: ${endReceiver.balance}`);
  }
  const serializedGraph = graph.export();
  console.log(serializedGraph);
  
  await prisma.trace.create({
    data: {
      txHash: Hash,
      result: serializedGraph,
      cexAddresses: cexAddresses
    }
  })
  return endReceivers;
};
