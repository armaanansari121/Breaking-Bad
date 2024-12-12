import { z } from "zod";

// User type schema
export const userType = z.object({
  name: z.string(),
  agentId: z.string(),
  phoneNo: z.string().regex(/^\d{10}$/, {
    message: "Phone number must be a 10-digit number",
  }),
  password: z.string().min(8, {
    message: "Password must be minimum 8 characters.",
  }),
});

export declare type Signuptype = z.infer<typeof userType>;

export const loginType = z.object({
  agentId: z.string(),
  password: z.string().min(8, {
    message: "Invalid password, must be minimum of 8 characters!",
  }),
});

export declare type Signintype = z.infer<typeof loginType>;

// Hash type schema for Ethereum transaction hash
export const hashType = z.object({
  txHash: z.string(),
  Depth: z.number().optional(),
});

export declare type Hashtype = z.infer<typeof hashType>;
// End reciver type from trace backend server
export type receiverType = {
  txhash: string;
  payload?: BalanceInfo[];
};

export interface mappedData {
  from: string;
  to: string;
  value: string;
  txHash: string;
  blockNumber: number;
}

export interface BalanceInfo {
  address: string;
  balance: number;
}

export type FrequencyEdgeAttributes = {
  from: string;
  to: string;
  frequency: number;
};

export type NodeAttributes = {
  balance: string;
  cluster: number;
};

export type EdgeAttributes = {
  from: string;
  to: string;
  value: string;
  txHash: string;
  blockNumber: number;
};

export type PreTrans = {
  from: string;
  to: string;
  predictedBlock: number;
};

// Type for destinations object
export type Destinations = {
  [key: string]: number; // Key is the address, and value is the accumulated transaction value
};

// Type for a single cluster item in value-based clusters
export interface ValueClusterItem {
  address: string; // The address being clustered
  meanValue: number; // The mean transaction value for this address
  standardDeviation: number; // The standard deviation of transaction values
}

// Type for value-based clusters
export type ValueClusters = {
  [key: string]: ValueClusterItem[]; // Key is the cluster identifier, value is an array of clustered addresses
};

// Type for a single cluster item in frequency-based clusters
export interface FrequencyClusterItem {
  from: string; // Sender address
  to: string; // Receiver address
  frequency: number; // Frequency of transactions
}

// Type for frequency-based clusters
export type FrequencyClusters = {
  [key: string]: FrequencyClusterItem[]; // Key is the cluster identifier, value is an array of clustered edges
};

// Inferred types from the schemas
export type userClientType = z.infer<typeof userType>;
export type hashClientType = z.infer<typeof hashType>;
export type loginClientType = z.infer<typeof loginType>;
