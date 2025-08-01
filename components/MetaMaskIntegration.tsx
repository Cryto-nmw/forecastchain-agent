"use client";

import MetaMaskConnectorGameForm from "@/components/MetaMaskConnectorGameForm";
// import { useMetaMask } from "@/hooks/useMetaMask";
// import GameForm from "@/components/GameForm";

// import AgentContracts from "@/components/AgentContractsServerWrap";

const MetaMaskIntegration = () => {
  // const { isConnected, account, provider } = useMetaMask();

  // const

  //   const handleTransaction = async () => {
  //     if (!provider) return;

  //     try {
  //       // Example transaction
  //       const txHash = await provider.request({
  //         method: "eth_sendTransaction",
  //         params: [
  //           {
  //             from: account,
  //             to: "0x...",
  //             value: "0x0", // 0 ETH
  //             gas: "0x5208", // 21000
  //           },
  //         ],
  //       });
  //       console.log("Transaction hash:", txHash);
  //     } catch (error) {
  //       console.error("Transaction failed:", error);
  //     }
  //   };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">代理</h1>
        <MetaMaskConnectorGameForm />
        {/* <AgentContracts /> */}
      </div>
    </div>
  );

  //   return ;
};

export default MetaMaskIntegration;
