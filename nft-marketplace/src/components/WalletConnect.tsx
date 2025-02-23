import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';

export default function WalletConnect() {
  const { login } = usePrivy();
  const { wallets } = useWallets();
  const { address } = useAccount();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Update wallet address based on Privy
  useEffect(() => {
    if (wallets.length > 0) {
      setWalletAddress(wallets[0].address);
    } else {
      setWalletAddress(null);
    }
  }, [wallets]);

  // Determine which address to show (wagmi first, then Privy)
  const displayedAddress = address || walletAddress;

  return (
    <div 
      className="Wallet_Connect" 
      style={{ display: "flex", justifyContent: "flex-end", position: "absolute", top: "20px", right: "20px", margin: "10px" }}
    >
      <button 
        onClick={login} 
        style={{ backgroundColor: "blue", color: "white", border: "none", borderRadius: "10px", padding: "15px" }}
      >
        {displayedAddress ? `${displayedAddress.slice(0, 6)}...${displayedAddress.slice(-4)}` : "Connect Wallet"}
      </button>
    </div>
  );
}
