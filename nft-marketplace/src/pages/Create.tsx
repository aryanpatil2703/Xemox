import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Web3Storage } from "web3.storage";
import contractABI from "../abi/NFTContract.json";
import { useWalletClient } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";

export default function CreateNFT() {
  const { data: walletClient } = useWalletClient(); // ✅ Get signer from wagmi
  const { ready, authenticated } = usePrivy(); // Optional, to guard against early interaction
  // Define the contract address constant
  const CONTRACT_ADDRESS = "0xCc6E8d51dE1DCBDD9bcd1341403e7152828C262e";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [metadataURI, setMetadataURI] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAddress() {
      if (walletClient) {
        const address = await walletClient.account.address;
        setWalletAddress(address);
      }
    }

    fetchAddress();
  }, [walletClient]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadToIPFS = async () => {
    if (!imageFile) return null;

    const client = new Web3Storage({
      token: import.meta.env.VITE_WEB3STORAGE_TOKEN as string,
    });

    const metadata = {
      name,
      description,
      image: imageFile.name,
    };

    const metadataFile = new File(
      [JSON.stringify(metadata)],
      "metadata.json",
      { type: "application/json" }
    );

    const files = [imageFile, metadataFile];

    const cid = await client.put(files);
    return `https://${cid}.ipfs.dweb.link/metadata.json`;
  };

  const mintNFT = async () => {
    if (!walletClient || !walletAddress || !metadataURI) return;

    try {
      setMinting(true);

      const provider = new ethers.BrowserProvider(walletClient); // ✅ Use wagmi's signer
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
      const tx = await contract.mint(walletAddress, metadataURI);

      await tx.wait();
      setTxHash(tx.hash);
      console.log("NFT Minted:", tx.hash);
    } catch (error) {
      console.error("Minting failed:", error);
      alert("Minting failed. See console for details.");
    } finally {
      setMinting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uri = await uploadToIPFS();
    setMetadataURI(uri);
  };

  useEffect(() => {
    if (metadataURI) {
      mintNFT();
    }
  }, [metadataURI]);

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-900 rounded-xl shadow-lg text-white">
      <h1 className="text-2xl font-bold mb-4">Create Your NFT</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700"
          required
        />
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="w-full"
          required
        />
        <button
          type="submit"
          disabled={!ready || !authenticated || !walletClient || minting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition duration-300"
        >
          {minting ? "Minting..." : "Upload & Mint NFT"}
        </button>
      </form>

      {txHash && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-green-400 font-semibold">NFT Minted Successfully!</p>
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            View on Etherscan
          </a>
        </div>
      )}
    </div>
  );
}
