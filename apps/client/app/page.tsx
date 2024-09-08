"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    router.replace("/signup");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-purple-500">
      <button
        className="px-4 py-2 font-bold text-white bg-slate-500 rounded-full hover:bg-slate-700 focus:outline-none focus:shadow-outline"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg
              className="w-5 h-5 mr-3 -ml-1 text-white animate-spin inline-block"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Entering...
          </>
        ) : (
          "Go to Signup"
        )}
      </button>
    </div>
  );
}
