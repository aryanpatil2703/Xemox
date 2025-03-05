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
          className="text-black bg-white/30 backdrop-blur-800 border border-white px-4 py-2 rounded-lg hover:bg-transparent transition duration-300"
        >
          {`${displayedAddress.slice(0, 6)}...${displayedAddress.slice(-4)}`}
        </button>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Connect Wallet
        </button>
      )}

      {/* Dropdown Menu */}
      {isDropdownOpen && user && displayedAddress && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white/30 backdrop-blur-800 border border-gray-300 rounded-lg shadow-lg text-black">
          <button
            onClick={() => navigate("/profile")}
            className="block w-full text-left px-4 py-2 hover:bg-gray-200 cursor-pointer"
          >
            Profile
          </button>
          <button
            onClick={logout}
            className="block w-full text-left px-4 py-2 hover:bg-gray-200 cursor-pointer"
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
}
