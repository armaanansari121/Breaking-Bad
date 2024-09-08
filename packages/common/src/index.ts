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

export type NodeAttributes = {
  balance: string;
};

export type EdgeAttributes = {
  from: string;
  to: string;
  value: string;
  txHash: string;
  blockNumber: number;
};

// Inferred types from the schemas
export type userClientType = z.infer<typeof userType>;
export type hashClientType = z.infer<typeof hashType>;
export type loginClientType = z.infer<typeof loginType>;
