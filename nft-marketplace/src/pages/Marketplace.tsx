import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import contractABI from "../abi/NFTContract.json";
import marketplaceABI from "../abi/Marketplace.json";
import { formatEther, parseEther } from "ethers";
import axios from "axios";
import WalletConnect from "../components/WalletConnect"; // adjust path if needed

const MARKETPLACE_ADDRESS = "0xbb9602669CDD35a619Ae6B34A726dbc366e74ad9";
const NFT_CONTRACT_ADDRESS = "0xD94186784d56d3a96842Cff086DA36c623194ccB";
const MARKETPLACE_ABI = marketplaceABI;
const NFT_ABI = contractABI;

interface NFTListing {
  listingId: bigint;
  price: string;
  tokenId: bigint;
  image: string;
  name: string;
  seller: string;
}

interface UserNFT {
  tokenId: bigint;
  image: string;
  name: string;
}

export default function Marketplace() {
  const { address: wagmiAddress, isConnected } = useAccount();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [listings, setListings] = useState<NFTListing[]>([]);
  const [userNFTs, setUserNFTs] = useState<UserNFT[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFTListing | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<boolean>(false);
  const [txStatus, setTxStatus] = useState<
    "idle" | "approving" | "buying" | "listing" | "success" | "error"
  >("idle");

  // For listing modal
  const [showListModal, setShowListModal] = useState(false);
  const [nftToList, setNftToList] = useState<UserNFT | null>(null);
  const [listPrice, setListPrice] = useState("");

  const connectedAddress = wagmiAddress || walletAddress;

  const handleWalletUpdate = (addr: string | null) => setWalletAddress(addr);

  useEffect(() => {
    if (connectedAddress) {
      loadListings();
      loadUserNFTs();
    }
    // eslint-disable-next-line
  }, [connectedAddress]);

  // Load all marketplace listings
  const loadListings = async () => {
    setTxStatus("idle");
    try {
      const { Contract } = await import("ethers");
      const provider = new (await import("ethers")).JsonRpcProvider(
        process.env.VITE_PUBLIC_RPC_URL
      );
      const contract = new Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
      const allListings = await contract.getAllListings();

      const formattedListings = await Promise.all(
        allListings.map(async (listing: any) => {
          const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
          const tokenURI = await nftContract.tokenURI(listing.tokenId);
          const metadata = await axios.get(tokenURI);
          return {
            listingId: listing.listingId ?? listing.id,
            price: formatEther(listing.price),
            tokenId: listing.tokenId,
            image: metadata.data.image,
            name: metadata.data.name,
            seller: listing.seller,
          };
        })
      );
      setListings(formattedListings);
    } catch (error) {
      console.error("Error loading listings:", error);
    }
  };

  // Load user's NFTs that are NOT listed
  const loadUserNFTs = async () => {
  if (!connectedAddress) return;
  try {
    const { Contract } = await import("ethers");
    // Use a provider that can sign (for ownerOf)
    // @ts-ignore
    const provider = new (await import("ethers")).BrowserProvider(window.ethereum);
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);

    // Try to get the highest minted tokenId (if contract has totalSupply)
    let maxTokenId = 0;
    try {
      maxTokenId = await nftContract.totalSupply();
      maxTokenId = Number(maxTokenId);
    } catch {
      // fallback: set a reasonable upper bound
      maxTokenId = 50;
    }

    const userTokens: UserNFT[] = [];
    for (let tokenId = 0; tokenId < maxTokenId; tokenId++) {
      try {
        const owner = await nftContract.ownerOf(tokenId);
        if (owner.toLowerCase() !== connectedAddress.toLowerCase()) continue;
        // Check if already listed
        const isListed = await checkIfListed(BigInt(tokenId));
        if (!isListed) {
          const tokenURI = await nftContract.tokenURI(tokenId);
          const metadata = await axios.get(tokenURI);
          userTokens.push({
            tokenId: BigInt(tokenId),
            image: metadata.data.image,
            name: metadata.data.name,
          });
        }
      } catch (err) {
        // tokenId might not exist, just skip
        continue;
      }
    }
    setUserNFTs(userTokens);
  } catch (error) {
    console.error("Error loading user NFTs:", error);
  }
};

  // Check if a token is already listed
  const checkIfListed = async (tokenId: bigint) => {
    try {
      const { Contract } = await import("ethers");
      const provider = new (await import("ethers")).JsonRpcProvider(
        process.env.VITE_PUBLIC_RPC_URL
      );
      const contract = new Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
      // Find if token is listed and active
      const allListings = await contract.getAllListings();
      return allListings.some(
        (listing: any) =>
          listing.nftContract.toLowerCase() === NFT_CONTRACT_ADDRESS.toLowerCase() &&
          listing.tokenId.toString() === tokenId.toString() &&
          listing.isActive
      );
    } catch (error) {
      return false;
    }
  };

  // Check if NFT is approved for marketplace
  const checkApproval = async (tokenId: bigint) => {
    if (!connectedAddress) return false;
    const { Contract } = await import("ethers");
    // @ts-ignore
    const provider = new (await import("ethers")).BrowserProvider(window.ethereum);
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
    const approvedAddress = await nftContract.getApproved(tokenId);
    return approvedAddress.toLowerCase() === MARKETPLACE_ADDRESS.toLowerCase();
  };

  // Buy NFT
  const handleBuy = async (listing: NFTListing) => {
    if (!connectedAddress) return;
    try {
      setTxStatus("approving");
      const isApproved = await checkApproval(listing.tokenId);

      if (!isApproved) {
        setSelectedNFT(listing);
        return;
      }

      setTxStatus("buying");
      const { Contract } = await import("ethers");
      // @ts-ignore
      const provider = new (await import("ethers")).BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
      const tx = await contract.buyItem(listing.listingId, {
        value: parseEther(listing.price),
      });
      await tx.wait();
      setTxStatus("success");
      loadListings();
      loadUserNFTs();
    } catch (error) {
      console.error("Purchase failed:", error);
      setTxStatus("error");
    }
  };

  // Approve NFT for marketplace
  const handleApprove = async () => {
    if (!connectedAddress || !selectedNFT) return;
    try {
      setTxStatus("approving");
      const { Contract } = await import("ethers");
      // @ts-ignore
      const provider = new (await import("ethers")).BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);
      const tx = await nftContract.approve(
        MARKETPLACE_ADDRESS,
        selectedNFT.tokenId
      );
      await tx.wait();
      setApprovalStatus(true);
      handleBuy(selectedNFT);
    } catch (error) {
      console.error("Approval failed:", error);
      setTxStatus("error");
    }
  };

  // List NFT for sale
  const handleListNFT = async () => {
    if (!connectedAddress || !nftToList || !listPrice) return;
    try {
      setTxStatus("listing");
      const { Contract, parseEther } = await import("ethers");
      // @ts-ignore
      const provider = new (await import("ethers")).BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

      // Approve marketplace if not already approved
      const approvedAddress = await nftContract.Approval(nftToList.tokenId);
      if (approvedAddress.toLowerCase() !== MARKETPLACE_ADDRESS.toLowerCase()) {
        const approveTx = await nftContract.approve(
          MARKETPLACE_ADDRESS,
          nftToList.tokenId
        );
        await approveTx.wait();
      }

      // List NFT
      const marketplaceContract = new Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
      const tx = await marketplaceContract.listItem(
        NFT_CONTRACT_ADDRESS,
        nftToList.tokenId,
        parseEther(listPrice)
      );
      await tx.wait();

      setShowListModal(false);
      setListPrice("");
      setNftToList(null);
      setTxStatus("success");
      loadListings();
      loadUserNFTs();
    } catch (error) {
      console.error("Listing failed:", error);
      setTxStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">NFT Marketplace</h1>
          <WalletConnect onWalletUpdate={handleWalletUpdate} />
        </div>

        {/* Your Unlisted NFTs */}
        {connectedAddress && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Your Unlisted NFTs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userNFTs.length === 0 && (
                <div className="col-span-full text-gray-500">
                  You have no unlisted NFTs.
                </div>
              )}
              {userNFTs.map((nft) => (
                <div
                  key={nft.tokenId.toString()}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{nft.name}</h3>
                    <p className="text-gray-600 mb-4">
                      Token ID: {nft.tokenId.toString()}
                    </p>
                    <button
                      onClick={() => {
                        setNftToList(nft);
                        setShowListModal(true);
                      }}
                      className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      List for Sale
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Marketplace Listings */}
        <h2 className="text-2xl font-bold mb-4">Marketplace Listings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.length === 0 && (
            <div className="col-span-full text-gray-500">
              No NFTs listed yet.
            </div>
          )}
          {listings.map((listing) => (
            <div
              key={listing.listingId.toString()}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <img
                src={listing.image}
                alt={listing.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{listing.name}</h3>
                <p className="text-gray-600 mb-4">
                  Price: {listing.price} ETH
                </p>
                <button
                  onClick={() => handleBuy(listing)}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                  disabled={txStatus === "buying" || !connectedAddress}
                >
                  {txStatus === "buying" ? "Processing..." : "Buy Now"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Approval Modal */}
        {selectedNFT && !approvalStatus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md">
              <h2 className="text-2xl font-bold mb-4">Approve NFT Transfer</h2>
              <p className="mb-4">
                You need to approve the marketplace to transfer this NFT before
                purchasing.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 text-white py-2 rounded"
                >
                  Approve & Buy
                </button>
                <button
                  onClick={() => {
                    setSelectedNFT(null);
                    setTxStatus("idle");
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List NFT Modal */}
        {showListModal && nftToList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md">
              <h2 className="text-2xl font-bold mb-4">List NFT for Sale</h2>
              <p className="mb-4">
                Set a price (in ETH) for <span className="font-semibold">{nftToList.name}</span>
              </p>
              <input
                type="number"
                className="w-full mb-4 p-2 border rounded"
                placeholder="Price in ETH"
                value={listPrice}
                min="0"
                onChange={(e) => setListPrice(e.target.value)}
              />
              <div className="flex gap-4">
                <button
                  onClick={handleListNFT}
                  className="flex-1 bg-blue-600 text-white py-2 rounded"
                  disabled={txStatus === "listing"}
                >
                  {txStatus === "listing" ? "Listing..." : "List NFT"}
                </button>
                <button
                  onClick={() => {
                    setShowListModal(false);
                    setListPrice("");
                    setNftToList(null);
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Status Modal */}
        {txStatus !== "idle" && ["success", "error"].includes(txStatus) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md text-center">
              {txStatus === "success" ? (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-green-600">
                    Success!
                  </h2>
                  <p>Transaction completed successfully.</p>
                  <button
                    onClick={() => setTxStatus("idle")}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-red-600">
                    Error Occurred
                  </h2>
                  <p>Please try again.</p>
                  <button
                    onClick={() => setTxStatus("idle")}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
