import { PrismaClient } from "@repo/db";
import Graph from "graphology";
import { NodeAttributes, EdgeAttributes } from "common";


const prisma = new PrismaClient();

const createDummyGraph = (): Graph<NodeAttributes, EdgeAttributes> => {
  const graph = new Graph<NodeAttributes, EdgeAttributes>({ multi: true });

  // Add some nodes and edges to the graph
  graph.addNode("0x123", { balance: "100" });
  graph.addNode("0x456", { balance: "50" });
  graph.addEdge("0x123", "0x456", {
    from: "0x123",
    to: "0x456",
    value: "20",
    txHash: "0xabc",
    blockNumber: 12345,
  });

  return graph;
};

const insertDummyData = async () => {
  const dummyGraph = createDummyGraph();
  const serializedGraph = dummyGraph.export();

  try {
    await prisma.trace.create({
      data: {
        txHash: "0x6c56b5d5193c9b6d285b3e7b96726b6a99b49f83738b4f1458d6d7a8b6d7b6d1",
        result: serializedGraph,
      },
    });
    console.log("Dummy data inserted successfully");
  } catch (error) {
    console.error("Error inserting dummy data:", error);
  } finally {
    await prisma.$disconnect();
  }
};

insertDummyData();
