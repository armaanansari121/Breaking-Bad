import { Router } from "express";
import { createClient, RedisClientType } from "redis";
import { hashType, receiverType } from "common";
import dotenv from "dotenv";

dotenv.config();

const trace = Router();

const client: RedisClientType = createClient({
  url: `redis://localhost:${process.env.REDIS_QUEUE_PORT}`,
});
const client2: RedisClientType = createClient({
  url: `redis://localhost:${process.env.REDIS_PUBSUB_PORT}`,
});

(async () => {
  try {
    await client.connect();
    console.log("Redis client 1 connected");
    await client2.connect();
    console.log("Redis client 2 connected");
  } catch (error) {
    console.error("Redis connection error:", error);
  }
})();

trace.post("/", async (req, res) => {
  let unsubscribe: (() => void) | null = null;
  // console.log(1);
  try {
    const response = hashType.safeParse(req.body);
    if (!response.success) {
      return res
        .status(400)
        .send({ payload: response.error.errors[0].message });
    }

    const hash = response.data?.txHash;
    const depth = (response.data.Depth ?? 10).toString();
    // console.log(depth);
    if (!hash) {
      return res.status(400).send({ payload: "Invalid transaction hash" });
    }

    await client.lPush("hash", hash);
    await client.lPush("depth", depth);

    await client2.subscribe(hash, (message) => {
      try {
        const result = JSON.parse(message);
        console.log(result.payload);
        res.status(200).send(result.payload);
      } catch (error) {
        console.error("Error parsing trace result:", error);
        if (!res.headersSent) {
          res.status(500).send({ payload: "Invalid trace result format" });
        }
      }
    });

    // Set a timeout to handle cases where no message is received
    setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).send({ payload: "Timeout waiting for trace result" });
      }
      client2.unsubscribe(hash);
    }, 30000); // 30 second timeout
  } catch (error) {
    console.error("Error in trace route:", error);
    if (!res.headersSent) {
      res.status(500).send({ payload: "Internal server error" });
    }
  }
});

export default trace;
