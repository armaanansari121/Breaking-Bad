"use client";

import React, { useState, useEffect } from "react";
import { useWeb3Auth } from "./webauthprovider";

const Home: React.FC = () => {
  const [clientId, setClientId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { web3auth } = useWeb3Auth();

  useEffect(() => {
    const storedClientId = localStorage.getItem("clientId");
    if (storedClientId) {
      setClientId(storedClientId);
    }
  }, []);

  const handleClientIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClientId(event.target.value);
  };

  const handleVerifyClientId = async () => {
    try {
      if (!clientId) {
        setErrorMessage("Client ID cannot be empty.");
        return;
      }

      localStorage.setItem("clientId", clientId);

      await web3auth?.init();

      console.log("Web3Auth initialized successfully with clientId:", clientId);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        "Failed to initialize Web3Auth with the provided Client ID."
      );
      console.error("Error initializing Web3Auth:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Welcome to the NCB eagle. Please enter your client ID obtained from
          Web3Auth
        </h1>
        <div className="space-y-4">
          <input
            type="text"
            value={clientId}
            onChange={handleClientIdChange}
            placeholder="Enter Web3Auth Client ID"
            className="w-full px-4 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleVerifyClientId}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Verify Client ID
          </button>
        </div>
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <strong>Error: </strong> {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
