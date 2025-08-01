import { Interface, ethers } from "ethers";
import { retrieveMetaMaskProver } from "@/lib/metamask";
import { CHAIN_ID, FACTORY_CONTRACT_ADDRESS, AGENT_ID } from "@/lib/config";
import { getForecastGameAbiByAddress } from "@/lib/db";
import {
  saveDeployedContract,
  logDeploymentEvent,
} from "@/lib/agent-deploy-game-server-actions";

const FORECAST_GAME_FACTORY_ADDRESS = FACTORY_CONTRACT_ADDRESS;

/**
 * The expected chain ID where your ForecastGameFactory contract is deployed.
 * For example:
 * 1 for Ethereum Mainnet
 * 11155111 for Sepolia Testnet
 * 5 for Goerli Testnet (deprecated)
 * IMPORTANT: You MUST replace this with the actual chain ID of your deployment network.
 */
const EXPECTED_CHAIN_ID = CHAIN_ID; // <<< REPLACE THIS (e.g., Sepolia)

/**
 * Creates a new Forecast Game by interacting with the deployed ForecastGameFactory contract.
 * This function assumes that `window.ethereum` (MetaMask) and `window.ethers` are available in the global scope.
 *
 * @param {string} question - The question for the forecast game (e.g., "Will BTC hit $100k by end of 2025?").
 * @param {string[]} options - An array of string options for the game (e.g., ["Yes", "No", "Maybe"]).
 * @param {number[]} odds - An array of numbers representing the odds for each option (e.g., [5000, 5000]).
 * These should correspond to the `uint256[]` type in your contract.
 * @param {Function} progressCallback - Callback to update progress modal (status: "pending" | "success" | "error", message: string).
 * @returns {Promise<string|null>} A promise that resolves to the address of the newly created ForecastGame contract,
 * or null if the creation fails or the address cannot be retrieved from events.
 */
export const createForecastGame = async (
  question,
  options,
  odds,
  progressCallback
) => {
  // Initialize an array to store all internal log messages
  const internalLogs = [];

  // Helper function to add logs to the internal array
  const addLog = (level, message, details = {}) => {
    internalLogs.push({ [level]: message, details });
    // Keep console.log for immediate debugging during development
    console.log(`[${level}] ${message}`, details);
  };

  let currentDeployTxHash = "N/A"; // Placeholder until tx hash is available
  addLog("INFO", "Attempting to create Forecast Game...", {
    question,
    options,
    odds,
  });

  // Notify modal of process start
  progressCallback?.("pending", "Initializing game creation...");

  const FORECAST_GAME_FACTORY_ABI_str = await getForecastGameAbiByAddress(
    FORECAST_GAME_FACTORY_ADDRESS
  );
  const FORECAST_GAME_FACTORY_ABI = JSON.parse(FORECAST_GAME_FACTORY_ABI_str);

  // 1. Check for Web3 provider (MetaMask)
  const _provider = await retrieveMetaMaskProver();
  if (typeof _provider === "undefined") {
    addLog(
      "ERROR",
      "MetaMask or another Web3 wallet is not detected. Please install one.",
      { error: "MetaMask not found" }
    );
    // Log final error to backend
    await logDeploymentEvent(
      currentDeployTxHash,
      "ERROR",
      "Deployment Failed",
      "MetaMask not detected, deployment aborted.",
      { internalLogs }
    );
    progressCallback?.("error", "MetaMask not detected.");
    return null;
  }
  addLog("INFO", "MetaMask provider detected.");

  try {
    // 3. Initialize Ethers provider and signer
    addLog("INFO", "Requesting account access from MetaMask.");
    await _provider.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(_provider);
    const signer = await provider.getSigner();
    const accountAddress = await signer.getAddress();
    addLog("INFO", `Wallet Connected: ${accountAddress}`, { accountAddress });

    // 4. Check if the current network matches the expected chain ID
    const network = await provider.getNetwork();
    const chainId = network.chainId.toString(16);
    const currentChainId = `0x${chainId}`;
    if (currentChainId !== EXPECTED_CHAIN_ID) {
      addLog(
        "ERROR",
        `Incorrect Network! Please switch MetaMask to the network with Chain ID: ${EXPECTED_CHAIN_ID} (Current: ${currentChainId} - ${network.name})`,
        {
          expectedChainId: EXPECTED_CHAIN_ID,
          currentChainId,
          networkName: network.name,
        }
      );
      // Log final error to backend
      await logDeploymentEvent(
        currentDeployTxHash,
        "ERROR",
        "Deployment Failed",
        "Incorrect network detected, deployment aborted.",
        { internalLogs }
      );
      progressCallback?.(
        "error",
        `Incorrect network. Switch to ${EXPECTED_CHAIN_ID}.`
      );
      return null;
    }
    addLog(
      "INFO",
      `Connected to correct network: ${network.name} (Chain ID: ${currentChainId})`,
      {
        currentChainId,
        networkName: network.name,
      }
    );

    // 5. Create a contract instance for the ForecastGameFactory
    const factoryContract = new ethers.Contract(
      FORECAST_GAME_FACTORY_ADDRESS,
      FORECAST_GAME_FACTORY_ABI,
      signer
    );
    addLog(
      "INFO",
      `Interacting with Factory Contract at: ${FORECAST_GAME_FACTORY_ADDRESS}`,
      {
        factoryAddress: FORECAST_GAME_FACTORY_ADDRESS,
      }
    );

    // 6. Call the createGame method
    addLog(
      "INFO",
      "Sending transaction to create game. Please confirm in MetaMask."
    );
    progressCallback?.(
      "pending",
      "Sending transaction, please confirm in MetaMask..."
    );
    const valueInWeiV6 = ethers.parseEther("0.001");
    const tx = await factoryContract.createGame(question, options, odds, {
      value: valueInWeiV6,
    });
    currentDeployTxHash = tx.hash; // Update the hash as soon as it's available
    addLog(
      "INFO",
      `Transaction sent! Hash: ${tx.hash}. Waiting for confirmation...`,
      {
        txHash: tx.hash,
        etherscanLink: `https://etherscan.io/tx/${tx.hash}`,
      }
    );
    progressCallback?.(
      "pending",
      `Transaction sent! Waiting for confirmation... (Hash: ${tx.hash})`
    );

    // 7. Wait for the transaction to be mined
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      addLog("INFO", `Transaction successful! Block: ${receipt.blockNumber}`, {
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      });
      // 8. Attempt to find the new game address from events
      let newGameAddress = null;
      // console.log(`contract: ${JSON.stringify(receipt)}`);
      // Find the GameCreated log in the receipt
      const iface = new Interface(FORECAST_GAME_FACTORY_ABI);
      const log = receipt.logs.find((log) => {
        if (
          log.address.toLowerCase() ===
          FORECAST_GAME_FACTORY_ADDRESS.toLowerCase()
        ) {
          const parsed = iface.parseLog(log);
          return parsed.name === "GameCreated" ? true : false;
        }
        return false;
        // log.topics[0] === iface.getEventTopic("GameCreated");
      });
      if (!log) {
        throw new Error("GameCreated event not found in logs");
      }
      const parsed = iface.parseLog(log);
      const gameAddress = parsed.args.addr;
      newGameAddress = gameAddress; //parsed.args.addr;
      const agent_id = AGENT_ID;
      const contract_name = "ForecastGame";
      const contract_address = newGameAddress;
      const chain_id = CHAIN_ID;
      const network_name = network.name;
      const deploy_tx_hash = tx.hash;
      const abi_json = JSON.stringify(FORECAST_GAME_FACTORY_ABI);
      const constructor_args_json = {
        question: question,
        options: options,
        odds: odds,
      };
      const contractDetails = JSON.stringify({
        agent_id,
        contract_name,
        contract_address,
        chain_id,
        network_name,
        deploy_tx_hash,
        abi_json,
        bytecode_hash: null,
        constructor_args_json,
        description: null,
      });
      await saveDeployedContract(contractDetails);
      if (!newGameAddress) {
        addLog(
          "WARN",
          "Could not find new game address from 'GameCreated' event logs. Ensure your ABI is correct and the event is emitted.",
          {
            warning: "GameCreated event not found or parsed",
          }
        );
      }
      addLog("INFO", "Forecast Game creation process completed.");
      progressCallback?.(
        "success",
        `Game deployed successfully! Address: ${newGameAddress}`
      );
      // Log final success to backend
      await logDeploymentEvent(
        currentDeployTxHash,
        "INFO",
        "Deployment Completed",
        "Forecast Game deployed successfully.",
        { finalGameAddress: newGameAddress, internalLogs }
      );
      return newGameAddress;
    } else {
      addLog("ERROR", "Transaction failed on chain. Receipt status was 0.", {
        receiptStatus: receipt.status,
      });
      progressCallback?.("error", "Transaction failed on the blockchain.");
      // Log final failure to backend
      await logDeploymentEvent(
        currentDeployTxHash,
        "ERROR",
        "Deployment Failed",
        "Transaction failed on chain.",
        { internalLogs }
      );
      return null;
    }
  } catch (error) {
    let errorMessage = "An unknown error occurred during game creation.";
    let errorDetails = { errorName: error.name, errorMessage: error.message };
    if (error.code === 4001) {
      errorMessage = "Transaction rejected by the user in MetaMask.";
      errorDetails.errorCode = 4001;
    } else if (error.message) {
      errorMessage = `Detailed error: ${error.message}`;
    }
    addLog("ERROR", errorMessage, errorDetails);
    progressCallback?.("error", errorMessage);
    // Log final error to backend
    await logDeploymentEvent(
      currentDeployTxHash,
      "ERROR",
      "Deployment Failed",
      errorMessage,
      { internalLogs, originalError: error.message } // Include original error for more context
    );
    return null;
  }
};
