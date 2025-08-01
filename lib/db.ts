// app/actions/contractActions.ts
"use server"; // This directive marks the file as a Server Action

import mysql from "mysql2/promise"; // Import the promise-based MySQL client

export const connectToDB = async () => {
  // Database connection configuration.
  // It's crucial to use environment variables for sensitive information.
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || "3306", 10), // Default to 3306 if not set
  };

  const connection = await mysql.createConnection(dbConfig);
  return connection;
};

/**
 * Retrieves the forecast_game_abi for a deployed contract by its blockchain address
 * using a direct SQL query.
 * This is a server-side action, meaning it runs exclusively on the server.
 *
 * @param address The blockchain address of the deployed contract.
 * @returns A Promise that resolves to the forecast_game_abi (string) if found,
 * or null if the contract is not found or an error occurs.
 */
export async function getForecastGameAbiByAddress(
  address: string
): Promise<string | null> {
  if (!address) {
    console.error("getForecastGameAbiByAddress: Address cannot be empty.");
    return null;
  }
  let connection;

  try {
    connection = await connectToDB();

    // SQL query to select forecast_game_abi where the address matches
    const query = `SELECT abi FROM deployed_contracts WHERE address = ? LIMIT 1`;
    const [rows] = await connection.execute(query, [address]);

    // Type assertion for rows to be an array of objects
    const contracts = rows as { abi: string | null }[];

    // If a contract is found, return its forecast_game_abi.
    // Otherwise, return null.
    if (contracts.length > 0) {
      return contracts[0].abi;
    } else {
      console.warn(`Contract with address ${address} not found.`);
      return null;
    }
  } catch (error) {
    console.error(
      `Error retrieving forecast_game_abi for address ${address}:`,
      error
    );
    // In a production application, you might want to throw a more specific error
    // or handle it differently based on your error reporting strategy.
    return null;
  } finally {
    // Ensure the database connection is closed, if it was successfully opened.
    if (connection) {
      await connection.end();
    }
  }
}
