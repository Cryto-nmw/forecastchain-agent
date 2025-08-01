"use client";

import { useState } from "react";
import { useMetaMask } from "../hooks/useMetaMask";
import InstallMetaMaskModal from "./InstallMetaMaskModal";
import GameForm from "@/components/GameForm-Grok";

const MetaMaskConnectorGameForm = () => {
  const { isConnected, account, isInstalled, connectMetaMask, disconnect } =
    useMetaMask();

  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!isInstalled) {
      setShowInstallModal(true);
      return;
    }

    setIsConnecting(true);

    try {
      await connectMetaMask();
    } catch (error) {
      if (error.code === 4001) {
        console.log("User rejected the connection request");
      } else {
        console.error("Connection failed:", error);
        alert("Failed to connect MetaMask. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAccount = (account) => {
    return `${account.slice(0, 6)}...${account.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <>
        <div className="flex items-center space-x-4">
          <div className="bg-green-100 text-green-80r0 px-4 py-2 rounded-lg flex items-center">
            <span className="text-xl mr-2">🦊</span>
            <span className="text-sm font-medium">
              MetaMask: {formatAccount(account)}
            </span>
          </div>
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                   transition-colors duration-200"
          >
            Disconnect
          </button>
        </div>

        <GameForm />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 
                 disabled:bg-orange-300 transition-colors duration-200 font-medium
                 flex items-center space-x-2"
      >
        <span className="text-xl">🦊</span>
        <span>{isConnecting ? "Connecting..." : "Connect MetaMask"}</span>
      </button>

      <InstallMetaMaskModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </>
  );
};

export default MetaMaskConnectorGameForm;
