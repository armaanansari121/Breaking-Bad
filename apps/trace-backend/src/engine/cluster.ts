import { Destinations, FrequencyClusters, ValueClusters } from "common";
import AbstractGraph from "graphology-types";

const clusterAddresses = (graph: AbstractGraph, threshold: number = 0.1) => {
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
      deviationSum += Math.pow(parseFloat(edgeAttributes.value) - meanValue, 2);
    });

    const standardDeviation = Math.sqrt(deviationSum / connectedEdges.length);

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

const clusterFrequentAddresses = (freqGraph: AbstractGraph, threshold = 3) => {
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

    const standardDeviation = Math.sqrt(deviationSum / edgeFrequencies.length);

    if (Math.abs(frequency - meanFrequency) <= threshold * standardDeviation) {
      const clusterKey = `${from}->${to}`;
      if (!clusters[clusterKey]) {
        clusters[clusterKey] = [];
      }
      clusters[clusterKey].push({ from, to, frequency });
    }
  });

  return clusters;
};

export const createAddressClusters = (
  graph: AbstractGraph,
  freqGraph: AbstractGraph,
  valueThreshold: number,
  freqThreshold: number
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
