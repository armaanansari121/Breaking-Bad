import { createClient, RedisClientType } from 'redis';
import { startTrace } from "./engine/trace";
import { receiverType } from "common";

const client: RedisClientType = createClient({
  url: `redis://localhost:${process.env.REDIS_QUEUE_PORT}`
});
const client2: RedisClientType = createClient({
  url: `redis://localhost:${process.env.REDIS_PUBSUB_PORT}`
});

function isValidHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

async function main() {
  try {
    await client.connect();
    await client2.connect();

    while (true) {
      const txHash = await client.brPop("hash", 0);
      if (!txHash || !txHash.element) {
        console.error("Invalid or missing hash from queue");
        continue;
      }
      const hash = txHash.element;
      if (!isValidHash(hash)) {
        console.error("Invalid hash format:", hash);
        continue;
      }
      try {
        const result = await startTrace(hash);
        const response: receiverType = {
          txhash: hash,
          payload: result
        };
        const publishResult = await client2.publish(hash, JSON.stringify(response));
      } catch (error) {
        console.error("Error during trace or publish:", error);
        // Publish an error message to the channel
        await client2.publish(hash, JSON.stringify({ error: "Trace failed" }));
      }
    }
  } catch (error) {
    console.error("Fatal error in trace-backend:", error);
  } finally {
    console.log("Closing Redis connections...");
    await client.quit();
    await client2.quit();
    console.log("Redis connections closed");
  }
}

main().catch(console.error);