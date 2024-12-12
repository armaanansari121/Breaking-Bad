"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { hashType } from "common";
import axios from "axios";
import { backOff } from "exponential-backoff";

export default function Graph() {
  const [txHash, setTxHash] = useState("");
  const [depth, setDepth] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const MAX_RETRIES = 3;
  const INITIAL_TIMEOUT = 60000; // 60 seconds
  const MAX_TIMEOUT = 300000; // 5 minutes

  async function makeRequest(txHash: string, Depth: number) {
    return backOff(
      async () => {
        try {
          const response = await axios.post(
            `http://localhost:5000/trace`,
            { txHash, Depth },
            { timeout: MAX_TIMEOUT }
          );
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
            console.log("Request timed out. Retrying...");
            throw error; // This will trigger a retry
          }
          throw error; // For other errors, throw and stop retrying
        }
      },
      {
        numOfAttempts: MAX_RETRIES,
        startingDelay: INITIAL_TIMEOUT,
        timeMultiple: 2,
        maxDelay: MAX_TIMEOUT,
      }
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationResult = hashType.safeParse({ txHash, depth });
    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }
    await makeRequest(txHash, Number(depth));

    setError(null);
    router.push(`/view/${txHash}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Track Transaction
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="txHash"
              className="block text-sm font-medium text-gray-700"
            >
              Ethereum Transaction Hash
            </label>
            <input
              type="text"
              id="txHash"
              name="txHash"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter transaction hash"
            />
            <label
              htmlFor="txHash"
              className="block text-sm font-medium text-gray-700"
            >
              Depth
            </label>
            <input
              type="text"
              id="depth"
              name="depth"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter Depth"
            />

            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-4 rounded-md hover:from-indigo-600 hover:to-purple-700"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
