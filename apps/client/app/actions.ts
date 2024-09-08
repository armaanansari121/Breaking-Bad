"use server";

import { PrismaClient } from "@repo/db";
import Graph from "graphology";
import { NodeAttributes, EdgeAttributes } from "common";

const prisma = new PrismaClient();
export async function getTraceGraph(Hash: string) {
  const trace = await prisma.trace.findUnique({
    where: {
      txHash: Hash,
    },
  });

  if (trace) {
    const graph = trace.result;
    const jsonString: string = JSON.stringify(graph);

    const newGraph: Graph<NodeAttributes, EdgeAttributes> = new Graph({
      multi: true,
    });

    const serializedValue = JSON.parse(jsonString);
    newGraph.import(serializedValue);

    const serializedGraphData = newGraph.export();

    console.log(serializedGraphData);
    return serializedGraphData;
  } else {
    throw new Error("Trace not found");
  }
}
