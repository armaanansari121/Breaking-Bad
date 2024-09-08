/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import MermaidDiagram from "@/components/Mermaid";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import "../../styles.css";
import { getTraceGraph } from "@/app/actions";
import axios from "axios";
import Graph from "graphology";
import { NodeAttributes, EdgeAttributes } from "common";
import { Hashtype } from "common";

const BACKEND_URL = "http://localhost:5000";

const newGraph = new Graph<NodeAttributes, EdgeAttributes>();
newGraph.addNode("InitialHash", { balance: "0" });
newGraph.addNode("Tumbler1", { balance: "1.5" });
newGraph.addNode("Tumbler2", { balance: "2.3" });
newGraph.addNode("Node1", { balance: "0.5" });
newGraph.addNode("Node2", { balance: "0.3" });
newGraph.addNode("Receiver1", { balance: "0" });

newGraph.addEdge("InitialHash", "Tumbler1", {
  from: "InitialHash",
  to: "Tumbler1",
  value: "1.5",
  txHash: "0x123",
  blockNumber: 10,
});
newGraph.addEdge("InitialHash", "Tumbler2", {
  from: "InitialHash",
  to: "Tumbler2",
  value: "2.3",
  txHash: "0x124",
  blockNumber: 11,
});
newGraph.addEdge("Tumbler1", "Node1", {
  from: "Tumbler1",
  to: "Node1",
  value: "0.5",
  txHash: "0x125",
  blockNumber: 12,
});
newGraph.addEdge("Tumbler2", "Node2", {
  from: "Tumbler2",
  to: "Node2",
  value: "0.3",
  txHash: "0x126",
  blockNumber: 13,
});
newGraph.addEdge("Node1", "Receiver1", {
  from: "Node1",
  to: "Receiver1",
  value: "0.5",
  txHash: "0x127",
  blockNumber: 14,
});

function graphToMermaid(graph: Graph<NodeAttributes, EdgeAttributes>): string {
  let mermaidCode = "graph LR\n";

  graph.forEachNode((node, attributes) => {
    const label = `${node} (${attributes.balance} ETH)`;
    mermaidCode += `    ${node}["${label}"]\n`;
  });

  graph.forEachEdge((edge, attributes, source, target) => {
    const label = `${attributes.value} ETH\nTxHash: ${attributes.txHash}\nBlock: ${attributes.blockNumber}`;
    mermaidCode += `    ${source} -->|${label}| ${target}\n`;
  });

  return mermaidCode;
}

export default function TransactionGraph() {
  const params = useParams();
  const txHash = params.id as string;
  const [generatedGraph, setGeneratedGraph] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hashInputs, setHashInputs] = useState<Hashtype>({
    txHash: "",
  });

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setHashInputs({
          ...hashInputs,
          txHash: txHash,
        });
        const serializedGraphData = await axios.post(
          `${BACKEND_URL}/trace}`,
          hashInputs
        );
        console.log(serializedGraphData);
        /*if (serializedGraphData) {
          const newGraph: Graph<NodeAttributes, EdgeAttributes> = new Graph({
            multi: true,
          });
          const exgraph = graphToMermaid(newGraph);
          setGeneratedGraph(exgraph);
        } else {
          console.error("Failed to deserialize graph data");
        }*/
      } catch (error) {
        console.error("Error fetching graph data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGraphData();
  }, [transactionHash]);

  if (loading) {
    return <div>Loading the graph...</div>;
  }

  if (!generatedGraph) {
    return <div>No graph data </div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-full h-full p-4 max-w-screen-xl mt-8">
        <div>
          <MermaidDiagram chart={generatedGraph} />
        </div>
      </div>
    </div>
  );
}
