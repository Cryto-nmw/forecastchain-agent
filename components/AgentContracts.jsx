"use client";
import { fetchContracts } from "@/lib/db";
import React, { useState, useEffect } from "react";

const ContractGrid = ({ agentID }) => {
  const [contracts, setContracts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const loadContracts = async () => {
      const { contracts: fetchedContracts, totalPages: fetchedTotalPages } =
        await fetchContracts(agentID, page, itemsPerPage);
      setContracts(fetchedContracts);
      setTotalPages(fetchedTotalPages);
    };
    loadContracts();
  }, [page, agentID]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Mapping network_name or chain_id to Etherscan base URL
  const getEtherscanUrl = (networkName, chainId, address) => {
    const networkMap = {
      mainnet: "https://etherscan.io",
      goerli: "https://goerli.etherscan.io",
      sepolia: "https://sepolia.etherscan.io",
      polygon: "https://polygonscan.com",
      // Add more networks as needed
    };
    const baseUrl =
      networkMap[networkName.toLowerCase()] || "https://etherscan.io"; // Default to mainnet if unknown
    return `${baseUrl}/address/${address}`;
  };

  return (
    <div
      style={{
        background: "linear-gradient(to right, #e6a7c7, #d4a9e0)",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {contracts.map((contract, index) => {
          const globalIndex = index + 1 + (page - 1) * itemsPerPage;
          const etherscanUrl = getEtherscanUrl(
            contract.network_name,
            contract.chain_id,
            contract.contract_address
          );
          return (
            <div
              key={index}
              style={{
                background: "linear-gradient(135deg, #f8e1e7, #e6c3d7)",
                padding: "15px",
                borderRadius: "12px",
                color: "#800080",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 12px rgba(0, 0, 0, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 8px rgba(0, 0, 0, 0.1)";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  background: "#c71585",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "5px",
                }}
              >
                #{globalIndex}
              </div>
              <h3
                style={{
                  margin: "0 0 10px",
                  color: "#c71585",
                  fontFamily: "Arial, sans-serif",
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
                }}
              >
                {contract.network_name}
              </h3>
              <p>
                <strong>Address:</strong>{" "}
                <a
                  href={etherscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#4682b4",
                    textDecoration: "underline",
                    background: "rgba(70, 130, 180, 0.1)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    transition: "background 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.background = "rgba(70, 130, 180, 0.2)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.background = "rgba(70, 130, 180, 0.1)")
                  }
                >
                  View on Etherscan
                </a>
              </p>
              <p>
                <strong>Deployed:</strong>{" "}
                {new Date(contract.deployed_at).toLocaleString()}
              </p>
              <div
                style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  width: "0",
                  height: "0",
                  borderLeft: "10px solid transparent",
                  borderRight: "10px solid transparent",
                  borderBottom: "10px solid #d4a9e0",
                }}
              />
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <button
          style={{
            background: "#4682b4",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            border: "none",
            transition: "transform 0.3s ease",
          }}
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          onMouseDown={(e) => (e.target.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          Previous
        </button>
        <span style={{ color: "#800080", padding: "10px" }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              style={{
                background: page === p ? "#c71585" : "#f8e1e7",
                color: page === p ? "white" : "#800080",
                padding: "5px 10px",
                margin: "0 5px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
                transition: "background 0.3s ease",
              }}
              onClick={() => handlePageChange(p)}
            >
              {p}
            </button>
          ))}
        </span>
        <button
          style={{
            background: "#4682b4",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            border: "none",
            transition: "transform 0.3s ease",
          }}
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          onMouseDown={(e) => (e.target.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ContractGrid;
