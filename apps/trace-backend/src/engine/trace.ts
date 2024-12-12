import { Network, Alchemy, TransactionResponse } from "alchemy-sdk";
import dotenv from "dotenv";
import { AssetTransfersCategory } from "alchemy-sdk";
import {
  BalanceInfo,
  mappedData,
  NodeAttributes,
  EdgeAttributes,
  FrequencyEdgeAttributes,
  ValueClusters,
  Destinations,
  FrequencyClusters,
  PreTrans,
} from "common";
import Graph from "graphology";
import { PrismaClient } from "@repo/db";
import AbstractGraph from "graphology-types";
dotenv.config();

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const prisma = new PrismaClient();
const alchemy = new Alchemy(config);

let INITIAL_BLOCK_NUMBER = 0;

const CEX: string[] = [
  "0xccfa6f3b01c7bf07b033a9d496fdf22f0cdf5293",
  "0x06051836ac6c5112b890f8b6ec78e33d1afeae7c",
  "0x2407b9b9662d970ece2224a0403d3b15c7e4d1fe",
  "0x3698cc7f524bade1a05e02910538f436a3e94384",
  "0x4d24eececb86041f47bca41265319e9f06ae2fcb",
  "0x763104507945b6b7f21ee68b92048a53f7debf18",
  "0x78bba2389c2ceeb6f94c70ed133712e3b3e2c4d0",
  "0x881f982575a3ecbea6fe133ddb0951303215d130",
  "0x8c7efd5b04331efc618e8006f19019a3dc88973e",
  "0xa4fe2f90a8991a410c825c983cbb6a92d03607fc",
  "0xa916a54af7553bae6172e510d067826bd204d0dd",
  "0xaa8bc1fc0fcfdca5b7e5d35e5ac13800850d90c7",
  "0x17f1a51da68d27c94d2a51d92b27b5bd4718b986",
  "0x7a20527ba5a749b3b054a821950bfcc2c01b959f",
  "0x777d4627e31863b2a49e2985af46525f21a9846c",
  "0xd996035db82cae33ba1f16fdf23b816e5e9faabb",
  "0xd0808da05cc71a9f308d330bc9c5c81bbc26fc59",
];

const graph: Graph<NodeAttributes, EdgeAttributes> = new Graph({ multi: true });
const freqGraph: Graph<{}, FrequencyEdgeAttributes> = new Graph();

let cexAddresses: EdgeAttributes[] = [];
let cexId = 0;
let edgeId = 0;

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

function checkFrequencies(): FrequencyEdgeAttributes[] {
  let sortedBalances: FrequencyEdgeAttributes[] = [];

  freqGraph.forEachEdge((edge, attributes) => {
    const frequency = attributes.frequency;
    sortedBalances.push({
      from: attributes.from,
      to: attributes.to,
      frequency,
    });
  });

  sortedBalances.sort((a, b) => b.frequency - a.frequency);
  sortedBalances = sortedBalances.filter(
    (balInfo) => !CEX.includes(balInfo.to)
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

function computeJaccardSimilarityMatrix(graph: Graph): number[][] {
  const nodes = graph.nodes();
  const similarityMatrix: number[][] = [];

  nodes.forEach((nodeA, indexA) => {
    similarityMatrix[indexA] = [];
    const neighborsA = new Set(graph.neighbors(nodeA));

    nodes.forEach((nodeB, indexB) => {
      if (indexA === indexB) {
        similarityMatrix[indexA][indexB] = 1; // Self-similarity
      } else {
        const neighborsB = new Set(graph.neighbors(nodeB));
        const intersectionSize = [...neighborsA].filter((n) =>
          neighborsB.has(n)
        ).length;
        const unionSize = new Set([...neighborsA, ...neighborsB]).size;
        similarityMatrix[indexA][indexB] =
          unionSize === 0 ? 0 : intersectionSize / unionSize;
      }
    });
  });

  return similarityMatrix;
}

function performThresholdClustering(
  similarityMatrix: number[][],
  threshold = 0.5
): number[] {
  const clusters: number[] = [];
  const clusterCount = similarityMatrix.length;

  // Initialize cluster assignments (-1 means unclustered)
  for (let i = 0; i < clusterCount; i++) {
    clusters[i] = -1;
  }

  let currentClusterId = 0;

  for (let i = 0; i < clusterCount; i++) {
    if (clusters[i] === -1) {
      // Start a new cluster
      clusters[i] = currentClusterId;

      for (let j = 0; j < clusterCount; j++) {
        if (
          i !== j &&
          clusters[j] === -1 &&
          similarityMatrix[i][j] >= threshold
        ) {
          clusters[j] = currentClusterId;
        }
      }

      currentClusterId++;
    }
  }

  return clusters;
}

function updateGraphWithClusters(graph: Graph, clusters: number[]) {
  const nodes = graph.nodes();

  nodes.forEach((node, index) => {
    graph.updateNodeAttribute(node, "cluster", () => clusters[index]);
  });
}

interface TransactionTime {
  blockNumbers: number[];
  intervals: number[];
  meanInterval?: number;
  stdDeviation?: number;
}
const transactionTimes: Map<string, TransactionTime> = new Map();

const predictedTransactions: PreTrans[] = [];

function storePrediction(from: string, to: string, predictedBlock: number) {
  predictedTransactions.push({ from, to, predictedBlock });
}

function updateTransactionTimes(from: string, to: string, blockNumber: number) {
  const key = `${from}-${to}`;
  let transactionTime = transactionTimes.get(key);

  if (!transactionTime) {
    transactionTime = { blockNumbers: [], intervals: [] };
    transactionTimes.set(key, transactionTime);
  }

  const lastBlock =
    transactionTime.blockNumbers[transactionTime.blockNumbers.length - 1];
  if (lastBlock !== undefined) {
    // Calculate the interval
    const interval = blockNumber - lastBlock;
    transactionTime.intervals.push(interval);
  }

  transactionTime.blockNumbers.push(blockNumber);
}

function calculateMeanAndStdDeviation(intervals: number[]): {
  mean: number;
  stdDeviation: number;
} {
  const mean =
    intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

  const variance =
    intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) /
    intervals.length;
  const stdDeviation = Math.sqrt(variance);

  return { mean, stdDeviation };
}

function predictNextTransactionBlock(
  from: string,
  to: string
): number | undefined {
  const key = `${from}-${to}`;
  const transactionTime = transactionTimes.get(key);

  if (!transactionTime || transactionTime.intervals.length < 2) {
    // Not enough data to make a prediction
    return undefined;
  }

  const { mean, stdDeviation } = calculateMeanAndStdDeviation(
    transactionTime.intervals
  );

  // If the standard deviation is low, predict the next block number
  if (stdDeviation < mean * 0.2) {
    // Adjust threshold as necessary
    const nextBlockPrediction =
      transactionTime.blockNumbers[transactionTime.blockNumbers.length - 1] +
      mean;
    predictedTransactions.push({
      from,
      to,
      predictedBlock: Math.round(nextBlockPrediction),
    }); // Store the prediction
    return Math.round(nextBlockPrediction);
  }

  return undefined; // No prediction if the intervals are too irregular
}

const traceTransaction = async (
  tx: mappedData,
  Depth: number,
  retries = 3
): Promise<[BalanceInfo[], FrequencyEdgeAttributes[]] | undefined> => {
  console.log(Depth);
  if (Depth === 0) return undefined;
  try {
    if (!tx.to || tx.to.trim() === "") {
      const receipt = await alchemy.core.getTransactionReceipt(tx.txHash);
      // console.log(receipt);
      if (receipt && receipt.contractAddress) {
        tx.to = receipt.contractAddress.toLowerCase();
      } else {
        return undefined;
      }
    }
    // console.log(tx.txHash, tx.value);

    const existedTo = graph.hasNode(tx.to);
    const existedFrom = graph.hasNode(tx.from);

    if (!existedTo) {
      graph.addNode(tx.to, { balance: "0", cluster: -1 });
      freqGraph.addNode(tx.to);
    }
    if (!existedFrom) {
      graph.addNode(tx.from, { balance: "0", cluster: -1 });
      freqGraph.addNode(tx.from);
    }

    graph.addEdge(tx.from, tx.to, {
      from: tx.from,
      to: tx.to,
      value: tx.value,
      txHash: tx.txHash,
      blockNumber: tx.blockNumber,
    });

    if (freqGraph.hasEdge(tx.from, tx.to)) {
      freqGraph.updateEdgeAttribute(
        tx.from,
        tx.to,
        "frequency",
        (n: number | undefined) => (n as number) + 1
      );
    } else {
      freqGraph.addEdge(tx.from, tx.to, {
        from: tx.from,
        to: tx.to,
        frequency: 1,
      });
    }

    // Update transaction times and predict next block
    updateTransactionTimes(tx.from, tx.to, tx.blockNumber);

    const predictedBlock = predictNextTransactionBlock(tx.from, tx.to);
    if (predictedBlock !== undefined) {
      console.log(
        `Predicted next transaction block for ${tx.from} -> ${tx.to}: ${predictedBlock}`
      );
    }

    graph.updateNodeAttribute(tx.to ?? "", "balance", (bal) => {
      if (bal) return (parseFloat(bal) + parseFloat(tx.value)).toString();
      return parseFloat(tx.value).toString();
    });
    graph.updateNodeAttribute(tx.from ?? "", "balance", (bal) => {
      if (bal) return (parseFloat(bal) - parseFloat(tx.value)).toString();
      return parseFloat(tx.value).toString();
    });

    if (CEX.includes(tx.to)) {
      cexAddresses.push({
        from: tx.from,
        to: tx.to,
        value: tx.value,
        txHash: tx.txHash,
        blockNumber: tx.blockNumber,
      });
    }

    if (existedTo) return;
    console.log(tx.to);

    const transactions = await getTransactions(tx.to);
    // console.log(transactions);

    for (const tx of transactions) {
      // console.log(tx.category);
      const txn: mappedData = {
        from: tx.from,
        to: tx.to as string,
        value: tx.value?.toString() as string,
        txHash: tx.hash,
        blockNumber: parseInt(tx.blockNum, 16),
      };
      if (tx.category === "erc20") {
        // console.log(tx);
        txn.value = (Number(txn.value) / 1000).toString();
      }
      if (!txn.value) {
        txn.value = convertWeiToEth(Number(tx.rawContract.value));
      }
      if (txn.blockNumber < INITIAL_BLOCK_NUMBER) {
        continue;
      }
      await traceTransaction(txn, Depth - 1);
    }

    const endReceiver = checkBalances();
    const freqPairs = checkFrequencies();
    return [endReceiver, freqPairs];
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

export const startTrace = async (
  Hash: string,
  Depth: number = 10,
  similarityThreshold = 0.5
) => {
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
  const res = await traceTransaction(txObj, Depth);
  const endReceivers = res?.[0] || [];
  const freqPairs = res?.[1] ?? [
    {
      from: "",
      to: "",
      frequency: 0,
    },
  ];
  console.log("==========================================");
  console.log("Top 5 End Receivers:");
  console.log("==========================================");
  for (const endReceiver of endReceivers ?? []) {
    console.log(`${endReceiver.address}: ${endReceiver.balance}`);
  }
  console.log("==========================================");
  console.log("Top 5 Frequent Transactions:");
  console.log("==========================================");
  for (const txn of freqPairs ?? []) {
    console.log(`${txn.from} -> ${txn.to} : ${txn.frequency}`);
  }

  console.log("Computing Jaccard Similarity Matrix...");
  const similarityMatrix = computeJaccardSimilarityMatrix(graph);

  console.log("Performing Threshold-Based Clustering...");
  const clusters = performThresholdClustering(
    similarityMatrix,
    similarityThreshold
  );

  console.log("Updating Graph with Clusters...");
  console.log("clusters");
  updateGraphWithClusters(graph, clusters);

  console.log("Clustering Complete!");

  // --------------------------------
  // Log all the predicted transactions
  console.log("==========================================");
  console.log("Predicted Transactions:");
  console.log("==========================================");
  predictedTransactions.forEach((prediction) => {
    console.log(
      `${prediction.from} -> ${prediction.to} : Predicted Block - ${prediction.predictedBlock}`
    );
  });
  // --------------------------------

  const serializedGraph = graph.export();
  const frequencyGraph = freqGraph.export();

  const edgeAttributesData = cexAddresses.map(
    ({ from, to, value, txHash, blockNumber }) => ({
      from,
      to,
      value,
      txHash,
      blockNumber,
    })
  );

  // Create Trace record with cexAddresses
  await prisma.trace.create({
    data: {
      txHash: Hash,
      graph: serializedGraph,
      freqGraph: frequencyGraph,
      endReceivers: {
        createMany: {
          data: endReceivers, // Pass the array directly
        },
      },
      freqedgeattributes: {
        createMany: {
          data: freqPairs, // Pass the array directly
        },
      },
      predictedTxs: {
        createMany: {
          data: predictedTransactions, // Pass the array directly
        },
      },
      cexAddresses: {
        createMany: {
          data: edgeAttributesData, // Pass the array directly
        },
      },
    },
  });
  cexAddresses = [];
  // console.log(endReceivers);
  return endReceivers;
};
