"use client";

import { useState, useEffect, useCallback } from "react";
import { retrieveMetaMaskProver } from "@/lib/metamask";

export const useMetaMask = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  // const [isDedicatedChain, setIsDedicatedChain] = useState(false);

  // Check if MetaMask is installed
  const checkMetaMaskInstalled = useCallback(() => {
    if (typeof window === "undefined") return false;
    return !!window.ethereum?.isMetaMask;
  }, []);

  // Get MetaMask provider (handles multiple wallet conflict)
  const getMetaMaskProvider = useCallback(retrieveMetaMaskProver, []);

  // Connect to MetaMask
  const connectMetaMask = useCallback(async () => {
    const metaMaskProvider = getMetaMaskProvider();

    if (!metaMaskProvider) {
      throw new Error("MetaMask is not installed");
    }

    try {
      const accounts = await metaMaskProvider.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setIsConnected(true);
        setAccount(accounts[0]);
        setProvider(metaMaskProvider);

        console.log("Connected to MetaMask with account:", accounts[0]);

        return {
          success: true,
          account: accounts[0],
          provider: metaMaskProvider,
        };
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      throw error;
    }
  }, [getMetaMaskProvider]);

  // Disconnect
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAccount(null);
    setProvider(null);
  }, []);

  // Check installation and existing connection on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const installed = checkMetaMaskInstalled();
    setIsInstalled(installed);

    if (installed) {
      const checkConnection = async () => {
        const metaMaskProvider = getMetaMaskProvider();
        if (metaMaskProvider) {
          try {
            const accounts = await metaMaskProvider.request({
              method: "eth_accounts",
            });
            if (accounts.length > 0) {
              setIsConnected(true);
              setAccount(accounts[0]);
              setProvider(metaMaskProvider);
            }
          } catch (error) {
            console.log("No existing MetaMask connection");
          }
        }
      };

      checkConnection();
    }
  }, [checkMetaMaskInstalled, getMetaMaskProvider]);

  // Listen for account changes
  useEffect(() => {
    if (provider) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
          console.log("Account changed to:", accounts[0]);
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);

      return () => {
        provider.removeListener("accountsChanged", handleAccountsChanged);
        provider.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [provider, disconnect]);

  return {
    isConnected,
    account,
    provider,
    isInstalled,
    connectMetaMask,
    disconnect,
  };
};
