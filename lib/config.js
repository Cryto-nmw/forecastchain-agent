export const AGENT_ID =
  process.env.NEXT_PUBLIC_AGENT_ID ||
  "agent_100_0000000000000000000000000000000000000000000000000000000000000000";
export const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || "000000000";

export const FACTORY_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS ||
  "0xE2ef7CF304F49A698Cbfa4459912197Cd373eB35";

export const COINGECKO_URL =
  process.env.NEXT_PUBLIC_COINGECKO_API_URL ||
  "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";
