"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hashType } from "common";

export default function Graph() {
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [previousHashes, setPreviousHashes] = useState<string[]>([]);
  const router = useRouter();

  // Load previous hashes from local storage on component mount
  useEffect(() => {
    const storedHashes = localStorage.getItem("transactionHashes");
    if (storedHashes) {
      setPreviousHashes(JSON.parse(storedHashes));
    }
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Validate input using hashType schema
    const validationResult = hashType.safeParse({ txHash });
    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }

    setError(null);

    // Store the new hash in local storage
    const updatedHashes = [...previousHashes, txHash];
    setPreviousHashes(updatedHashes);
    localStorage.setItem("transactionHashes", JSON.stringify(updatedHashes));

    // Navigate to the new page with the transaction hash in the URL
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
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Previous Hashes
          </h2>
          <div className="overflow-x-auto">
            <ul className="list-disc pl-5">
              {previousHashes.length > 0 ? (
                previousHashes.map((hash, index) => (
                  <li key={index} className="break-all text-gray-700">
                    {hash}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No previous hashes.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
