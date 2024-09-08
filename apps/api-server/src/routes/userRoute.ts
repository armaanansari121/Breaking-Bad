import { Router } from "express";
import { PrismaClient } from "@repo/db";
import Graph from "graphology";
import {
  userType,
  loginType,
  hashType,
  NodeAttributes,
  EdgeAttributes,
} from "common";

const user = Router();
const prisma = new PrismaClient();

user.post("/signup", async (req, res) => {
  const response = userType.safeParse(req.body);
  if (!response.success) {
    return res.send({ payload: response.error.errors[0].message });
  }
  if (response.data === undefined) {
    return res.send({ payload: "Empty fields" });
  }

  try {
    const response2 = await prisma.user.create({
      data: {
        name: response.data?.name,
        agentId: response.data?.agentId,
        phoneNo: response.data?.phoneNo,
        password: response.data.password,
      },
    });
    return res
      .status(201)
      .send({ payload: `User created successfully with id ${response2.id}` });
  } catch (error) {
    return res.status(500).send({ payload: "Internal server error" });
  }
});

user.post("/signin", async (req, res) => {
  const response = loginType.safeParse(req.body);
  if (!response.success) {
    return res.status(400).send({ payload: response.error.errors[0].message });
  }
  if (response.data === undefined) {
    return res.send({ payload: "Empty fields" });
  }
  try {
    const response2 = await prisma.user.findFirst({
      where: {
        agentId: response.data.agentId,
        password: response.data.password,
      },
    });
    if (response2 != null) {
      return res.status(200).json({ result: true, payload: user });
    } else {
      return res
        .status(401)
        .send({ result: false, payload: "Invalid credentials" });
    }
  } catch (err) {
    return res.status(500).send({ payload: "Internal server error" });
  }
});

user.post("/graph", async (req, res) => {
  try {
    const response = hashType.safeParse(req.body);
    const hash = response.data?.txHash as string;
    // Fetch the trace from the database
    const trace = await prisma.trace.findFirst({
      where: {
        txHash: hash,
      },
      include:{
        cexAddresses: true
      }
    });

    if (trace) {
      const graph = trace.result;
      //const cexaddress = trace.cexAddresses;
      const jsonString: string = JSON.stringify(graph);

      const newGraph: Graph<NodeAttributes, EdgeAttributes> = new Graph({
        multi: true,
      });

      const serializedValue = JSON.parse(jsonString);
      newGraph.import(serializedValue);

      const serializedGraphData = newGraph.export();
      console.log({ graph: serializedGraphData, addresses: trace.cexAddresses});
      res.status(200).json({ graph: serializedGraphData, addresses: trace.cexAddresses});
    } else {
      res.status(404).json({ error: "Trace not found" });
    }
  } catch (error) {
    console.error("Error fetching trace graph:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default user;
