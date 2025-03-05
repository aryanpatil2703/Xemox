import { useState, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";

export default function WalletConnect() {
  const { user, login, logout, connectWallet } = usePrivy();
  const { wallets } = useWallets();
  const { address } = useAccount();
  const navigate = useNavigate();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setWalletAddress(wallets.length > 0 ? wallets[0]?.address ?? null : null);
  }, [wallets]);

  const displayedAddress = address || walletAddress;

  const handleMouseEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    if (user && displayedAddress) {
      setIsDropdownOpen(true);
    }
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150);
    setCloseTimeout(timeout);
  };

  const handleConnect = () => {
    connectWallet();
    login();
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {user && displayedAddress ? (
        <button
          onClick={() => navigate("/profile")}
          className="text-white bg-gray-900 border border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-800 transition duration-300"
        >
          {`${displayedAddress.slice(0, 6)}...${displayedAddress.slice(-4)}`}
        </button>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold px-4 py-2 rounded-lg transition duration-300 shadow-md"
        >
          Connect Wallet
        </button>
      )}

      {/* Dropdown Menu */}
      {isDropdownOpen && user && displayedAddress && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg text-white">
          <button
            onClick={() => navigate("/profile")}
            className="block w-full text-left px-4 py-2 hover:bg-gray-800 transition duration-300"
          >
            Profile
          </button>
          <button
            onClick={logout}
            className="block w-full text-left px-4 py-2 hover:bg-gray-800 transition duration-300"
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
}
