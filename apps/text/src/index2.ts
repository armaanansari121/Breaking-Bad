import axios from "axios";
import { backOff } from "exponential-backoff";

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

async function main() {
  try {
    const txHash =
      "0xc2c6f9dcb10f3c26e24ece683f0a73c46b9fcf97f2e3f5a4c1c29766994f99e7";
    const serializedGraphData = await makeRequest(txHash, 10);
    // console.log(serializedGraphData);
  } catch (error) {
    console.error("Failed to fetch data after multiple retries:", error);
  }
}

main();
