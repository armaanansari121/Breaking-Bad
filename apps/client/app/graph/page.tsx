"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { hashType } from "common";

export default function Graph() {
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();


    const validationResult = hashType.safeParse({ txHash });
    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }

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
