import { NFTStorage } from "nft.storage";
import { useState } from "react";

// ✅ Replace with your actual NFT.Storage API Key
const API_KEY = "3c3b08c3.56eabba789744594923c74840f24b7b1";

export default function UploadNFT() {
  const [ipfsURL, setIpfsURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function uploadToIPFS(file: File) {
    const client = new NFTStorage({ token: API_KEY });
    setLoading(true);

    try {
      const metadata = await client.store({
        name: "My NFT",
        description: "This is my NFT",
        image: file, // Accepts File object directly
      });

      console.log("✅ Metadata URL:", metadata.url);
      setIpfsURL(metadata.url); // Stores the IPFS URL
    } catch (error) {
      console.error("❌ Error uploading to IPFS:", error);
    }

    setLoading(false);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      uploadToIPFS(file);
    }
  }

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-xl font-bold mb-4">Upload NFT to IPFS</h1>
      <input type="file" onChange={handleFileChange} className="border p-2 rounded" />
      {loading && <p>Uploading...</p>}
      {ipfsURL && (
        <p>
          <a href={ipfsURL.replace("ipfs://", "https://ipfs.io/ipfs/")} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            View NFT Metadata
          </a>
        </p>
      )}
    </div>
  );
}
