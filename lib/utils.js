import { COINGECKO_URL } from "@/lib/config";

export const etherToUSD = async () => {
  const etherVsUSDRate = await fetch(COINGECKO_URL);
  const data = await etherVsUSDRate.json();
  console.log(`Rate : ${data.ethereum.usd}`);
  return data.ethereum.usd; //
};
