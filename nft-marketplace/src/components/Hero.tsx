export default function Hero() {
    return (
        <section className="pt-20 bg-gray-100 pt-16 min-h-[calc(100vh-6rem)] w-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-full max-w-7xl mx-auto">
                <h1 className="text-5xl font-bold text-gray-900 mb-6">Welcome to NFT Marketplace</h1>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">
                    Discover, collect, and sell extraordinary NFTs on the leading marketplace. Join the community and explore digital ownership.
                </p>
                <button className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold px-4 py-2 rounded-lg transition duration-300 shadow-md">
                Get Started
                </button>

            </div>
        </section>
    );
}