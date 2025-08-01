import { ethers } from "ethers";
import { CHAIN_ID } from "@/lib/config";

// Assuming CHAIN_ID is defined, e.g., const CHAIN_ID = "0x1" for Ethereum Mainnet
// and provider is already set to window.ethereum
export const checkChainIdWithEthers = async (provider) => {
  try {
    // Ensure provider exists
    if (!provider) {
      throw new Error("MetaMask provider is not available");
    }

    // Create an ethers provider using the provided window.ethereum
    const ethersProvider = new ethers.BrowserProvider(provider);

    // Get the network
    const network = await ethersProvider.getNetwork();
    const chainId = network.chainId.toString(16); // Convert to hex string (e.g., "1" -> "0x1")
    const chainName = network.name;

    // Compare with desired CHAIN_ID
    if (`0x${chainId}` === CHAIN_ID) {
      console.log(`Connected to the correct chain: ${CHAIN_ID}`);
      return {
        isCorrectChain: true,
        chainID: `0x${chainId}`,
        chainName: chainName,
      };
    } else {
      console.log(`Wrong chain! Expected: ${CHAIN_ID}, Got: 0x${chainId}`);
      // Prompt to switch chains
      // await switchChainWithEthers(ethersProvider);
      return {
        isCorrectChain: false,
        chainName: chainName,
        chainID: `0x${chainId}`,
      };
    }
  } catch (error) {
    console.error("Error checking chain ID:", error);
    return { isCorrectChain: false, chainName: undefined };
  }
};

// Function to switch chains using ethers.js
export const switchChainWithEthers = async (ethersProvider) => {
  // const ethersProvider = new ethers.BrowserProvider(provider);
  try {
    await ethersProvider.send("wallet_switchEthereumChain", [
      { chainId: CHAIN_ID },
    ]);
    console.log(`Switched to chain: ${CHAIN_ID}`);
  } catch (switchError) {
    if (switchError.code === 4902) {
      console.error(
        `Chain ${CHAIN_ID} not added to MetaMask. Please add it manually.`
      );
      // Optionally, add the chain using wallet_addEthereumChain (example below)
    } else {
      console.error("Error switching chain:", switchError);
    }
  }
};
