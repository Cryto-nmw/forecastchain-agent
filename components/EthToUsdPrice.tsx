// components/EthToUsdPrice.tsx

import React from "react";

interface EthToUsdPriceProps {
  usd: number; // the current price of 1 ETH in USD
}

export const EthToUsdPrice: React.FC<EthToUsdPriceProps> = ({ usd }) => {
  return (
    <div className="p-4 border rounded shadow-md bg-white w-fit">
      <h2 className="text-lg font-semibold text-gray-800">ETH → USD</h2>
      <p className="text-2xl font-bold text-green-600">${usd.toFixed(2)}</p>
      <p className="text-sm text-gray-500">Price per 1 ETH</p>
    </div>
  );
};
