import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount } from "wagmi";

export default function WalletConnect() {
  const { user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { address } = useAccount();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Update wallet address based on Privy
  useEffect(() => {
    setWalletAddress(wallets.length > 0 ? wallets[0]?.address ?? null : null);
  }, [wallets]);

  // Determine which address to show (wagmi first, then Privy)
  const displayedAddress = address || walletAddress;

  return (
    <div className="absolute top-5 right-5 flex justify-end m-2">
      {user ? (
        <button onClick={logout} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
          {displayedAddress ? `${displayedAddress.slice(0, 6)}...${displayedAddress.slice(-4)}` : "Logout"}
        </button>
      ) : (
        <button onClick={login} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
          Connect Wallet
        </button>
      )}
    </div>
  );
}
