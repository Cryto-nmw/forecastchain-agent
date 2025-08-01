"use client";

import { useState, useEffect } from "react";

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "pending" | "success" | "error";
  message: string;
}

const ProgressModal = ({
  isOpen,
  onClose,
  status,
  message,
}: ProgressModalProps) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (status) {
      case "pending":
        return "⏳";
      case "success":
        return "✅";
      case "error":
        return "❌";
      default:
        return "⏳";
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case "pending":
        return "bg-gray-200";
      case "success":
        return "bg-green-200";
      case "error":
        return "bg-red-200";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`p-6 rounded-lg shadow-lg ${getBackgroundColor()} max-w-md w-full`}
      >
        <div className="flex flex-col items-center">
          <span className="text-4xl mb-4">{getIcon()}</span>
          <h2 className="text-xl font-bold mb-2 text-gray-800">
            {status === "pending"
              ? "Processing"
              : status === "success"
              ? "Success"
              : "Error"}
          </h2>
          <p className="text-center text-gray-700 mb-4">{message}</p>
          {(status === "success" || status === "error") && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;
