"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

const Hello: React.FC = () => {
  const router = useRouter();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("web3auth_client_id");
    router.push("/");
  }, [router]);

  const handleGetStarted = useCallback(() => {
    router.push("/graph");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-300 via-pink-400 to-red-400">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Hello, Welcome!
        </h1>
        <p className="text-center text-gray-600 mb-6">Welcome</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleGetStarted}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Get Started
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hello;
