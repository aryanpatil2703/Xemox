import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../abi/NFTContract.json";
import { useWalletClient } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";

export default function CreateNFT() {
  const { data: walletClient } = useWalletClient();
  const { ready, authenticated } = usePrivy();

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

  const uploadToPinata = async () => {
    if (!imageFile) return null;

    const PINATA_JWT = import.meta.env.VITE_PINATA_JWT as string;

    try {
      // Step 1: Upload image file
      const formData = new FormData();
      formData.append("file", imageFile);

      const imageRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      });

      const imageData = await imageRes.json();
      const imageCID = imageData.IpfsHash;
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageCID}`;

      // Step 2: Upload metadata JSON
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

      const metadataData = await metadataRes.json();
      return `https://gateway.pinata.cloud/ipfs/${metadataData.IpfsHash}`;
    } catch (error) {
      console.error("Pinata upload failed:", error);
      return null;
    }
  };

  const mintNFT = async () => {
    if (!walletClient || !walletAddress || !metadataURI) return;

    try {
      setMinting(true);
      const provider = new ethers.BrowserProvider(walletClient);
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
    const uri = await uploadToPinata();
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
