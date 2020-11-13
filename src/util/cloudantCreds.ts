import { CloudantCredentials } from "../types/CloudantCredentials";

export function getCredentials(): CloudantCredentials {
  if (!process.env.CLOUDANT_CREDENTIALS!) {
    throw new Error("CLOUDANT_CREDENTIALS missing");
  }
  const cloudantCredentials = JSON.parse(process.env.CLOUDANT_CREDENTIALS!);

  return {
    username: cloudantCredentials.username,
    password: cloudantCredentials.password,
    url: `https://${cloudantCredentials.host}`,
  };
}
