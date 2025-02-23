import { usePrivy } from "@privy-io/react-auth";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";

export default function Header() {
    const { user, login, logout } = usePrivy();

    return (
        <header className="bg-gray-900 text-white py-4 shadow-md fixed top-0 left-0 w-full z-50">
            <div className="container mx-auto flex justify-between items-center px-6">
                
                {/* Logo Section */}
                <Link to="/" className="flex items-center space-x-3">
                    <img src= {Logo} alt="logo" className="h-10" />
                    <h1 className="text-xl font-bold">XEMOX</h1>
                </Link>

                {/* Navigation Links */}
                <nav className="hidden md:flex space-x-6">
                    <Link to="/" className="hover:text-gray-400">Home</Link>
                    <Link to="/explore" className="hover:text-gray-400">Explore</Link>
                    <Link to="/create" className="hover:text-gray-400">Create</Link>
                    {user && <Link to="/profile" className="hover:text-gray-400">Profile</Link>}
                </nav>

                {/* Wallet Button */}
                <div>
                    {user ? (
                        <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                            Logout
                        </button>
                    ) : (
                        <button onClick={login} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                            Connect Wallet
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
