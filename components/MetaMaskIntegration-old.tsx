// // components/MetaMaskIntegration.jsx
// "use client";

// import { useState, useEffect } from "react";
// import { ethers } from "ethers";
// import GameForm from "./GameForm";

// // Extend the Window interface to include ethereum
// declare global {
//   interface Window {
//     ethereum?: any;
//   }
// }

// const MetaMaskIntegration = () => {
//   const [hasMetaMask, setHasMetaMask] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   useEffect(() => {
//     if (window.ethereum) {
//       setHasMetaMask(true);
//       checkLoginStatus();
//     }
//   }, []);

//   const checkLoginStatus = async () => {
//     try {
//       const provider = new ethers.BrowserProvider(window.ethereum);
//       const accounts = await provider.listAccounts();
//       if (accounts.length > 0) {
//         setIsLoggedIn(true);
//       }
//     } catch (error) {
//       console.error("Error checking login status:", error);
//     }
//   };

//   //   const connectMetaMask = async () => {
//   //     try {
//   //       if (!window.ethereum) {
//   //         alert("Please install MetaMask to continue.");
//   //         window.open("https://metamask.io/download/", "_blank");
//   //         return;
//   //       }

//   //       const accounts = await window.ethereum.request({
//   //         method: "eth_requestAccounts",
//   //       });
//   //       if (accounts.length > 0) {
//   //         setIsLoggedIn(true);
//   //       }
//   //     } catch (error) {
//   //       console.error("Error connecting to MetaMask:", error);
//   //     }
//   //   };

//   const connectMetaMask = async () => {
//     if (!window.ethereum) {
//       alert("Please install MetaMask to continue.");
//       window.open("https://metamask.io/download/", "_blank");
//       return;
//     }

//     try {
//       // Request account access
//       const accounts = await window.ethereum.request({
//         method: "eth_requestAccounts",
//       });
//       if (accounts.length > 0) {
//         console.log("Connected to MetaMask with account:", accounts[0]);
//         // Proceed with your logic for a logged-in user
//       }
//     } catch (error) {
//       console.error("Error connecting to MetaMask:", error);
//     }
//   };

//   if (!hasMetaMask) {
//     return (
//       <div className="container mx-auto p-4 text-center">
//         <p className="text-lg mb-4">
//           Please install MetaMask to use this form.
//         </p>
//         <button
//           onClick={() => window.open("https://metamask.io/download/", "_blank")}
//           className="bg-blue-500 text-white p-2 rounded"
//         >
//           Install MetaMask
//         </button>
//       </div>
//     );
//   }

//   if (!isLoggedIn) {
//     return (
//       <div className="container mx-auto p-4 text-center">
//         <p className="text-lg mb-4">
//           Please log in with MetaMask to use this form.
//         </p>
//         <button
//           onClick={connectMetaMask}
//           className="bg-blue-500 text-white p-2 rounded"
//         >
//           Login with MetaMask
//         </button>
//       </div>
//     );
//   }

//   return <GameForm />;
// };

// export default MetaMaskIntegration;
