"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { useRouter } from "next/navigation";

interface IWeb3AuthContext {
  web3auth: Web3Auth | null;
}

const Web3AuthContext = createContext<IWeb3AuthContext | null>(null);

export const Web3AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [web3auth, setWeb3Auth] = useState<Web3Auth | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Access localStorage after component has mounted
    const storedClientId = localStorage.getItem("clientId");
    setClientId(storedClientId);
  }, []);

  useEffect(() => {
    if (!clientId) return; // Don't initialize if clientId is empty

    const chainConfig = {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0x1", // Ethereum Mainnet
      rpcTarget: "https://sapphire.rpc.web3auth.io", // Replace with the correct RPC URL
    };

    const privateKeyProvider = new EthereumPrivateKeyProvider({
      config: { chainConfig },
    });

    const web3authInstance = new Web3Auth({
      clientId,
      web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // Adjust to Mainnet or Devnet
      privateKeyProvider,
    });

    const initWeb3Auth = async () => {
      try {
        await web3authInstance.init();
        console.log("Web3Auth initialized successfully");
        setWeb3Auth(web3authInstance);
        router.push("/hello");
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("An unknown error occurred. Please try again.");
        }
        console.error("Failed to initialize Web3Auth:", error);
      }
    };

    initWeb3Auth();
  }, [clientId, router]);

  return (
    <Web3AuthContext.Provider value={{ web3auth }}>
      <div>
        {errorMessage && (
          <div
            style={{
              color: "red",
              padding: "10px",
              border: "1px solid red",
              backgroundColor: "#ffe6e6",
            }}
          >
            <strong>Error:</strong> {errorMessage}
          </div>
        )}
        {children}
      </div>
    </Web3AuthContext.Provider>
  );
};

export const useWeb3Auth = () => {
  const context = useContext(Web3AuthContext);
  if (!context) {
    throw new Error("useWeb3Auth must be used within a Web3AuthProvider");
  }
  return context;
};
