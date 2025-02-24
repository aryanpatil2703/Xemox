export default function Hero() {
    return (
        <section className="pt-20 bg-gray-100 min-h-screen w-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-full max-w-7xl mx-auto">
                <h1 className="text-5xl font-bold text-gray-900 mb-6">Welcome to NFT Marketplace</h1>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">
                    Discover, collect, and sell extraordinary NFTs on the leading marketplace. Join the community and explore digital ownership.
                </p>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md text-lg">
                    Get Started
                </button>
            </div>
        </section>
    );
}
