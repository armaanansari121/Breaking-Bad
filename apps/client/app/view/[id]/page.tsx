/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import MermaidDiagram from "@/components/Mermaid";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import "../../styles.css";
//import { getTraceGraph } from "@/app/actions";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

interface EdgeAttribute {
  id: number;
  from: string;
  to: string;
  value: string;
  txHash: string;
  blockNumber: number;
}

function convertToMermaid(data: { nodes: any[]; edges: any[] }) {
  let mermaidString = "graph LR\n";

  // Convert nodes
  data.nodes.forEach((node: { key: any; attributes: { balance: any } }) => {
    const key = node.key;
    const balance = node.attributes.balance;
    mermaidString += `    ${key}["${key}<br>Balance: ${balance}"]\n`;
  });

  // Convert edges
  data.edges.forEach(
    (edge: { source: any; target: any; attributes: { value: any } }) => {
      const source = edge.source;
      const target = edge.target;
      const value = edge.attributes.value;
      mermaidString += `    ${source} -->|${value}| ${target}\n`;
    }
  );

  return mermaidString;
}

export default function TransactionGraph() {
  const params = useParams();
  const tHash = params.id as string;
  const [generatedGraph, setGeneratedGraph] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cexAddresses, setCexAddresses] = useState<EdgeAttribute[]>([]);
  const [endReceivers, setEndReceivers] = useState<
    { address: string; balance: number }[]
  >([]);

  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(true); 
      try {
        const serializedGraphData = await axios.post(
          `${BACKEND_URL}/user/graph`,
          { txHash: tHash }
        );

        const endReceiversData = await axios.post(`${BACKEND_URL}/trace`, {
          txHash: tHash,
        });

        console.log(serializedGraphData.data.addresses);

        if (serializedGraphData.data) {
          try {
            const exgraph = convertToMermaid(serializedGraphData.data.graph);
            setGeneratedGraph(exgraph);
            setCexAddresses(Array.isArray(serializedGraphData.data.addresses) ? serializedGraphData.data.addresses : []);
            setEndReceivers(endReceiversData.data);
          } catch (conversionError) {
            console.error("Error generating Mermaid diagram:", conversionError);
          }
        } else {
          console.error("No data received from the backend");
        }
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
    <>
      <div>
        {endReceivers.length > 0 && (
          <div className="mt-10 px-4">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
              Top 5 End Receivers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {endReceivers.map((receiver, index) => (
                <div
                  key={index}
                  className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-300"
                >
                  <p className="text-lg font-semibold text-gray-800">
                    {`Receiver ${index + 1}`}
                  </p>
                  <p className="mt-2 text-gray-600 break-all">
                    Address: {receiver.address}
                  </p>
                  <p className="text-gray-600">Balance: {receiver.balance}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-20">
          <MermaidDiagram chart={generatedGraph} />
        </div>

        
        {cexAddresses && cexAddresses.length > 0 && (
          <div className="mt-10 px-4">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
              CEX Transactions
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2">From</th>
                    <th className="px-4 py-2">To</th>
                    <th className="px-4 py-2">Value</th>
                    <th className="px-4 py-2">Transaction Hash</th>
                    <th className="px-4 py-2">Block Number</th>
                  </tr>
                </thead>
                <tbody>
                  {cexAddresses.map((edge, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-2 break-all">{edge.from}</td>
                      <td className="px-4 py-2 break-all">{edge.to}</td>
                      <td className="px-4 py-2">{edge.value}</td>
                      <td className="px-4 py-2 break-all">{edge.txHash}</td>
                      <td className="px-4 py-2">{edge.blockNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}