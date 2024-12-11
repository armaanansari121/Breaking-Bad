import { Router } from "express";
import { PrismaClient } from "@repo/db";
import Graph from "graphology";
import { JsonValue, JsonObject } from "@prisma/client/runtime/library";
import AbstractGraph from "graphology-types";
import { Destinations, FrequencyClusters, ValueClusters } from "common";

const cluster = Router();
const prisma = new PrismaClient();

// Type guard to check if the input is a valid graph serialization
function isValidGraphSerialization(data: JsonValue): data is JsonObject {
  // Check if data is a non-null object
  if (data === null || typeof data !== "object") return false;

  const serializedGraph = data as JsonObject;

  // Ensure the object has nodes and edges arrays
  const nodes = serializedGraph["nodes"];
  const edges = serializedGraph["edges"];

  // Validate nodes
  if (!Array.isArray(nodes)) return false;
  const validNodes = nodes.every(
    (node) =>
      typeof node === "object" &&
      node !== null &&
      "key" in node &&
      "attributes" in node
  );

  // Validate edges
  if (!Array.isArray(edges)) return false;
  const validEdges = edges.every(
    (edge) =>
      typeof edge === "object" &&
      edge !== null &&
      "source" in edge &&
      "target" in edge &&
      "attributes" in edge
  );

  return validNodes && validEdges;
}

function deserializeGraph(serializedData: JsonValue): Graph {
  // Create a new graph
  const graph = new Graph();

  // Validate and parse the serialized data
  if (!isValidGraphSerialization(serializedData)) {
    console.warn("Invalid graph serialization");
    return graph;
  }

  // Type assertion after validation
  const graphData = serializedData as JsonObject;

  // Add nodes
  (
    graphData["nodes"] as Array<{
      key: string;
      attributes: Record<string, any>;
    }>
  ).forEach((node) => {
    graph.addNode(node.key, node.attributes);
  });

  // Add edges
  (
    graphData["edges"] as Array<{
      source: string;
      target: string;
      attributes: Record<string, any>;
    }>
  ).forEach((edge) => {
    graph.addEdge(edge.source, edge.target, edge.attributes);
  });

  return graph;
}

cluster.get("/", async (req, res) => {
  try {
    const { txHash } = req.body;

    const traces = await prisma.trace.findMany({
      where: {
        txHash: txHash,
      },
      select: {
        graph: true,
        freqGraph: true,
      },
    });

    // If no traces found, return early
    if (traces.length === 0) {
      return res
        .status(404)
        .json({ error: "No traces found for the given transaction hash" });
    }

    // Deserialize the first trace's graphs (assuming you want the first one)
    const mainGraph = deserializeGraph(traces[0].graph);
    const freqGraph = deserializeGraph(traces[0].freqGraph);

    const clusterAddresses = (
      graph: AbstractGraph,
      threshold: number = 0.1
    ) => {
      const clusters: ValueClusters = {};

      graph.forEachNode((node, attributes) => {
        const connectedEdges = graph.edges(node);
        let totalValue = 0;
        const destinations: Destinations = {};

        connectedEdges.forEach((edge) => {
          const edgeAttributes = graph.getEdgeAttributes(edge);
          const { to, value } = edgeAttributes;

          totalValue += parseFloat(value);

          if (!destinations[to]) {
            destinations[to] = 0;
          }
          destinations[to] += parseFloat(value);
        });

        const meanValue = totalValue / connectedEdges.length;
        let deviationSum = 0;

        connectedEdges.forEach((edge) => {
          const edgeAttributes = graph.getEdgeAttributes(edge);
          deviationSum += Math.pow(
            parseFloat(edgeAttributes.value) - meanValue,
            2
          );
        });

        const standardDeviation = Math.sqrt(
          deviationSum / connectedEdges.length
        );

        if (standardDeviation <= threshold) {
          const clusterKey = Object.keys(destinations).join(",");
          if (!clusters[clusterKey]) {
            clusters[clusterKey] = [];
          }
          clusters[clusterKey].push({
            address: node,
            meanValue,
            standardDeviation,
          });
        }
      });

      return clusters;
    };

    const clusterFrequentAddresses = (
      freqGraph: AbstractGraph,
      threshold = 3
    ) => {
      const clusters: FrequencyClusters = {};

      freqGraph.forEachEdge((edge) => {
        const edgeAttributes = freqGraph.getEdgeAttributes(edge);
        const { from, to, frequency } = edgeAttributes;

        const edgeFrequencies = freqGraph.edges().map((edge) => {
          return freqGraph.getEdgeAttributes(edge).frequency;
        });

        const meanFrequency =
          edgeFrequencies.reduce((sum, freq) => sum + freq, 0) /
          edgeFrequencies.length;

        const deviationSum = edgeFrequencies.reduce(
          (sum, freq) => sum + Math.pow(freq - meanFrequency, 2),
          0
        );

        const standardDeviation = Math.sqrt(
          deviationSum / edgeFrequencies.length
        );

        if (
          Math.abs(frequency - meanFrequency) <=
          threshold * standardDeviation
        ) {
          const clusterKey = `${from}->${to}`;
          if (!clusters[clusterKey]) {
            clusters[clusterKey] = [];
          }
          clusters[clusterKey].push({ from, to, frequency });
        }
      });

      return clusters;
    };

    const createAddressClusters = (
      graph: AbstractGraph,
      freqGraph: AbstractGraph,
      valueThreshold?: number,
      freqThreshold?: number
    ) => {
      console.log("==========================================");
      console.log("Clustering Addresses Based on Value...");
      const valueClusters = clusterAddresses(graph, valueThreshold);

      console.log("==========================================");
      console.log("Clustering Addresses Based on Frequency...");
      const freqClusters = clusterFrequentAddresses(freqGraph, freqThreshold);

      console.log("==========================================");
      console.log("Value-Based Clusters:");
      for (const [key, cluster] of Object.entries(valueClusters)) {
        console.log(`Cluster Key: ${key}`);
        cluster.forEach(({ address, meanValue, standardDeviation }) => {
          console.log(
            `Address: ${address}, Mean Value: ${meanValue}, Standard Deviation: ${standardDeviation}`
          );
        });
      }

      console.log("==========================================");
      console.log("Frequency-Based Clusters:");
      for (const [key, cluster] of Object.entries(freqClusters)) {
        console.log(`Cluster Key: ${key}`);
        cluster.forEach(({ from, to, frequency }) => {
          console.log(`From: ${from}, To: ${to}, Frequency: ${frequency}`);
        });
      }

      return { valueClusters, freqClusters };
    };

    createAddressClusters(mainGraph, freqGraph);
  } catch (error) {
    console.error("Error fetching and deserializing graphs:", error);
    res.status(500).json({ error: "Failed to fetch graphs" });
  }
});

export default cluster;
