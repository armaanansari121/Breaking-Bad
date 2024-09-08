/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import MermaidDiagram from "@/components/Mermaid";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import "../../styles.css";
//import { getTraceGraph } from "@/app/actions";
import axios from "axios";
import Graph from "graphology";
import { NodeAttributes, EdgeAttributes } from "common";

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

function dataToMermaid(
  data: Array<{ address: string; balance: number }>
): string {
  let mermaidCode = "graph LR\n";

  // Create nodes with labels
  data.forEach((node) => {
    const label = `${node.address} (${node.balance} ETH)`;
    mermaidCode += `    ${node.address}["${label}"]\n`;
  });

  // Connect nodes sequentially
  for (let i = 0; i < data.length - 1; i++) {
    mermaidCode += `    ${data[i].address} --> ${data[i + 1].address}\n`;
  }
  return mermaidCode;
}

export default function TransactionGraph() {
  const params = useParams();
  const tHash = params.id as string;
  const [generatedGraph, setGeneratedGraph] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const serializedGraphData = await axios.post(`${BACKEND_URL}/trace`, {
          txHash: tHash,
        });
        console.log(serializedGraphData.data);
        const mermaidDiagram = dataToMermaid(serializedGraphData.data);
        setGeneratedGraph(mermaidDiagram);
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">
            Loading the graph...
          </p>
        </div>
      </div>
    );
  }

  if (!generatedGraph) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">
          No graph data available
        </p>
      </div>
    );
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
