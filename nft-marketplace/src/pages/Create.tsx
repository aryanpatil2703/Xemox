import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../abi/NFTContract.json";
import { useWalletClient } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";

export default function CreateNFT() {
  const { data: walletClient } = useWalletClient();
  const { ready, authenticated } = usePrivy();

  const CONTRACT_ADDRESS = "0xCc6E8d51dE1DCBDD9bcd1341403e7152828C262e";
  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "minting">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (walletClient?.account?.address && mounted) {
      setWalletAddress(walletClient.account.address);
    }
    return () => {
      mounted = false;
    };
  }, [walletClient]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadToPinata = async () => {
    if (!imageFile) {
      setError("Please upload an image.");
      return null;
    }

    setStatus("uploading");

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const imageRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      });

      if (!imageRes.ok) throw new Error("Image upload failed.");
      const imageData = await imageRes.json();
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`;

      const metadata = {
        name,
        description,
        image: imageUrl,
      };

      const metadataRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify(metadata),
      });

      if (!metadataRes.ok) throw new Error("Metadata upload failed.");
      const metadataData = await metadataRes.json();
      return `https://gateway.pinata.cloud/ipfs/${metadataData.IpfsHash}`;
    } catch (err) {
      console.error("Pinata upload failed:", err);
      setError("Failed to upload to Pinata.");
      return null;
    } finally {
      setStatus("idle");
    }
  };

  const mintNFT = async (uri: string) => {
    if (!walletClient || !walletAddress) {
      setError("Wallet not connected.");
      return;
    }

    try {
      setStatus("minting");
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
      const tx = await contract.mint(walletAddress, uri);
      await tx.wait();
      setTxHash(tx.hash);
    } catch (err) {
      console.error("Minting failed:", err);
      setError("Minting failed. See console for details.");
    } finally {
      setStatus("idle");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;

    setError(null);

    if (!name.trim() || !description.trim()) {
      setError("Name and description are required.");
      return;
    }

    const uri = await uploadToPinata();
    if (!uri) return;

    await mintNFT(uri);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setImageFile(null);
    setImagePreview(null);
    setTxHash(null);
    setError(null);
    setStatus("idle");
  };

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
          disabled={status !== "idle"}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700"
          required
          disabled={status !== "idle"}
        />
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="w-full"
          disabled={status !== "idle"}
        />
        {imagePreview && (
          <img src={imagePreview} alt="Preview" className="w-full h-64 object-contain mt-2 rounded-md" />
        )}
        <button
          type="submit"
          disabled={!ready || !authenticated || !walletClient || status !== "idle"}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition duration-300 w-full"
        >
          {status === "uploading"
            ? "Uploading..."
            : status === "minting"
            ? "Minting..."
            : "Upload & Mint NFT"}
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
          <button
            onClick={resetForm}
            className="mt-2 text-sm text-gray-300 underline hover:text-white"
          >
            Mint Another
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-800 rounded-lg border border-red-500">
          <p className="text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}
