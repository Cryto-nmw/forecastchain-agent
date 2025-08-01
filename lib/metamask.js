import { CHAIN_ID } from "@/lib/config";

export const retrieveMetaMaskProver = () => {
  if (typeof window === "undefined") return null;

  // If window.ethereum is MetaMask, use it directly
  if (window.ethereum?.isMetaMask) {
    //   console.log("is metamask provider!");
    return window.ethereum;
  }

  // If multiple providers exist, find MetaMask specifically
  if (window.ethereum?.providers) {
    console.log("multiple provider!");
    const metaMaskProvider = window.ethereum.providers.find((provider) => {
      console.log(
        `check is metamask ${provider.isMetaMask ? "yes" : "No !"} ${
          provider.keys
        }`
      );
      return provider.isMetaMask;
    });
    return metaMaskProvider || null;
  } else {
    console.log("one provider!");
  }

  return null;
};
export async function isConnectedToDedicatedNetwork() {
  if (typeof window.ethereum === "undefined") {
    console.log("MetaMask is not installed.");
    return false;
  }

  try {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    if (chainId === CHAIN_ID) {
      console.log("Connected to Sepolia.");
      return true;
    } else {
      console.log(`Not Sepolia. Current chainId: ${chainId}`);
      return false;
    }
  } catch (error) {
    console.error("Error checking network:", error);
    return false;
  }
}

const dedicatedChainId = CHAIN_ID;

export async function isUsingDedicatedChain() {
  if (window.ethereum && window.ethereum.isMetaMask) {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    return chainId === dedicatedChainId; // Sepolia chainId in hex
  }
  return false;
}

export async function switchToSepolia() {
  if (window.ethereum && window.ethereum.isMetaMask) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: dedicatedChainId }],
      });

      console.log("Successfully switched to Sepolia");
      return true;
    } catch (switchError) {
      // If the chain is not added to MetaMask, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: dedicatedChainId,
                // chainName: "Sepolia Test Network",
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.sepolia.org"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
          console.log("Sepolia network added and switched");
        } catch (addError) {
          console.error(`Failed to add Sepolia: ${dedicatedChainId}`, addError);
        }
      } else {
        console.error(
          `Failed to switch to Sepolia: ${dedicatedChainId}`,
          switchError
        );
      }
    }
  } else {
    console.error("MetaMask is not detected");
  }
  return false;
}
