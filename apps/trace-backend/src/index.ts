import { createClient } from "redis";
import { startTrace } from "./engine/trace";
import { receiverType } from "common";

const client = createClient();
const client2 = createClient();


async function main() {

  await client.connect();
  await client2.connect();

  const txHash = await client.brPop("hash", 0);
  const hash = txHash?.element;
  const result = await startTrace(hash ?? "0x41b612c807de079526f542f507dc1b24b69f426084df2861f0826766259d520d");
  const response: receiverType = {
    txhash: hash ?? '',
    payload: result
  }
  client2.publish(hash ?? '', JSON.stringify(result));
}

main();