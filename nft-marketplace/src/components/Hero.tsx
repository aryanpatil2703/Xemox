export default function Hero() {
    return (
        <section className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-100 text-center px-6">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Welcome to NFT Marketplace</h1>
            <p className="text-lg text-gray-700 max-w-2xl mb-6">
                Discover, collect, and sell extraordinary NFTs on the leading marketplace.
            </p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md text-lg">
                Get Started
            </button>
        </section>
    );
}
