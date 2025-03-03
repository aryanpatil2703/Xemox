import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { BrowserProvider, JsonRpcProvider, formatEther } from "ethers";


export default function Profile() {
    const { user, logout } = usePrivy();
    const [email, setEmail] = useState<string | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [walletBalance, setWalletBalance] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setEmail(typeof user.email === "string" ? user.email : "Not provided");
            const address = user.wallet?.address || null;
            setWalletAddress(address);
            
            if (address) {
                fetchBalance(address);
            }
        }
    }, [user]);
    async function fetchBalance(address: string) {
        try {
            const provider = new JsonRpcProvider("https://mainnet.infura.io/v3/76a64d202adf48a5be935673f13574c0");
            const balanceWei = await provider.getBalance(address);
            setWalletBalance(formatEther(balanceWei)); 
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
    }
    

    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl text-red-500">No user logged in</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-300 p-6">
            <div className="p-8 w-full max-w-lg text-center">
                <h1 className="text-3xl font-bold mb-6">User Profile</h1>

                {/* Email */}
                <p className="text-lg font-semibold text-gray-800 mb-2">
                    <strong>Email:</strong> {email}
                </p>

                {/* Wallet Address */}
                <p className="text-lg font-semibold text-gray-800 mb-2 break-all">
                    <strong>Wallet Address:</strong> {walletAddress || "Not connected"}
                </p>

                {/* Wallet Balance */}
                <p className="text-lg font-semibold text-gray-800 mb-4">
                    <strong>Balance:</strong> {walletBalance !== null ? `${walletBalance} ETH` : "Fetching..."}
                </p>

                {/* Logout Button */}
                <button 
                    onClick={logout} 
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
