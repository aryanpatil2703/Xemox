import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

export default function Profile() {
    const { user, logout } = usePrivy();
    const [email, setEmail] = useState<string | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    // Debugging and setting state safely
    useEffect(() => {
        console.log("Privy User Data:", user);
        if (user) {
            setEmail(typeof user.email === "string" ? user.email : "Not provided");
            setWalletAddress(user.wallet?.address || "Not connected");
        }
    }, [user]);

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

                {/* Profile Picture
                {user.picture && (
                    <img 
                        src={user.picture} 
                        alt="User Avatar" 
                        className="w-24 h-24 rounded-full mx-auto mb-4 shadow-md border-2 border-gray-300"
                    />
                )} */}

                {/* Email */}
                <p className="text-lg font-semibold text-gray-800 mb-2">
                    <strong>Email:</strong> {email}
                </p>

                {/* Wallet Address */}
                <p className="text-lg font-semibold text-gray-800 mb-4 break-all">
                    <strong>Wallet Address:</strong> {walletAddress}
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
