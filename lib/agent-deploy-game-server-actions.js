"use server";
import { connectToDB } from "@/lib/db";
export async function logDeploymentEvent(
  deployTxHash,
  logLevel,
  step,
  message,
  details = {}
) {
  let connection;
  try {
    connection = await connectToDB();

    const query = `
      INSERT INTO agent_deployment_logs
      (deploy_tx_hash, log_level, step, message, details_json)
      VALUES (?, ?, ?, ?, ?);
    `;

    const detailsJsonString = JSON.stringify(details);

    const [rows] = await connection.execute(query, [
      deployTxHash,
      logLevel,
      step,
      message,
      detailsJsonString,
    ]);

    console.log(`Server Action Logged: [${logLevel}] ${step}: ${message}`);
    return { success: true, insertId: rows.insertId };
  } catch (error) {
    console.error(
      `Server Action Error logging deployment event: [${logLevel}] ${step}: ${message}`,
      error
    );
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      await connection.end(); // Close the connection
    }
  }
}

export async function saveDeployedContract(_contractDetails) {
  const connection = await connectToDB();
  try {
    // connection = await createConnection(dbConfig);
    // console.log(`contract details: ${_contractDetails}`);
    const contractDetails = await JSON.parse(_contractDetails);
    contractDetails.abi_json = JSON.stringify(contractDetails.abi_json);
    contractDetails.constructor_args_json = JSON.stringify(
      contractDetails.constructor_args_json
    );

    const {
      agent_id,
      contract_name,
      contract_address,
      chain_id,
      network_name,
      deploy_tx_hash,
      abi_json,
      bytecode_hash = null, // Default to null if not provided
      constructor_args_json = null, // Default to null if not provided
      description = null, // Default to null if not provided
    } = contractDetails;

    const query = `
      INSERT INTO agent_deployed_contracts
      (agent_id, contract_name, contract_address, chain_id, network_name, deploy_tx_hash, deployed_at, abi_json, bytecode_hash, constructor_args_json, description)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?);
    `;

    const [result] = await connection.execute(query, [
      agent_id,
      contract_name,
      contract_address,
      chain_id,
      network_name,
      deploy_tx_hash,
      abi_json,
      bytecode_hash,
      constructor_args_json,
      description,
    ]);

    // console.log(`Server Action: Deployed contract saved: ${contract_address}`);
    return {
      success: true,
      message: "Contract saved successfully.",
      insertId: result.insertId,
    };
  } catch (error) {
    console.error(
      `Server Action Error saving deployed contract: ${error.message}`,
      error
    );
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      await connection.end(); // Close the connection
    }
  }
}
