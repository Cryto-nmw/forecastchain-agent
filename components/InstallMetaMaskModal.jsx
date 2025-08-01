"use client";

const InstallMetaMaskModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleInstallMetaMask = () => {
    window.open("https://metamask.io/download/", "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 min-w-[320px] max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🦊</div>
          <h3 className="text-xl font-semibold mb-4">MetaMask Required</h3>
          <p className="text-gray-600 mb-6">
            You need MetaMask installed to connect to this application.
          </p>

          <button
            onClick={handleInstallMetaMask}
            className="w-full p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 
                     transition-colors duration-200 font-medium mb-3"
          >
            Install MetaMask
          </button>

          <button
            onClick={onClose}
            className="w-full p-3 border border-gray-300 bg-gray-50 rounded-lg 
                     hover:bg-gray-100 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallMetaMaskModal;
