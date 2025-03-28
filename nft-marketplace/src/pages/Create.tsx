import { useState } from "react";
import { PinataSDK } from "pinata-web3";

export default function Create() {
  const [file, setFile] = useState<File | null>(null);
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [attributes, setAttributes] = useState<{ trait_type: string; value: string }[]>([]);
  const [traitType, setTraitType] = useState("");
  const [traitValue, setTraitValue] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [metadataUrl, setMetadataUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const pinata = new PinataSDK({
    pinataJwt: import.meta.env.VITE_PINATA_JWT,
    pinataGateway: "aqua-magnetic-wallaby-170.mypinata.cloud",
  });

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  }

  function addAttribute() {
    if (traitType && traitValue) {
      setAttributes([...attributes, { trait_type: traitType, value: traitValue }]);
      setTraitType("");
      setTraitValue("");
    }
  }

  async function uploadFile() {
    if (!file || !nftName || !nftDescription) {
      alert("Please provide all NFT details!");
      return;
    }

    setLoading(true);
    try {
      // Upload image to IPFS
      const upload = await pinata.upload.file(file);
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`;
      setImageUrl(imageUrl);
      console.log("Image Uploaded:", imageUrl);

      // Create metadata JSON
      const metadata = {
        name: nftName,
        description: nftDescription,
        image: imageUrl,
        attributes: attributes,
        external_url: "https://yourmarketplace.com/nft/123"
      };

      // Convert metadata to Blob and upload to IPFS
      const metadataFile = new File([JSON.stringify(metadata)], "metadata.json", {
        type: "application/json",
      });

      const metadataUpload = await pinata.upload.file(metadataFile);
      const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataUpload.IpfsHash}`;
      setMetadataUrl(metadataUrl);
      console.log("Metadata Uploaded:", metadataUrl);
    } catch (error) {
      console.error("Error uploading:", error);
    }
    setLoading(false);
  }

  return (
    <div className="container mx-auto text-center mt-20">
      <h1 className="text-3xl">Upload NFT to IPFS</h1>

      <input
        type="text"
        placeholder="NFT Name"
        value={nftName}
        onChange={(e) => setNftName(e.target.value)}
        className="mt-2 px-4 py-2 border"
      />
      <input
        type="text"
        placeholder="NFT Description"
        value={nftDescription}
        onChange={(e) => setNftDescription(e.target.value)}
        className="mt-2 px-4 py-2 border"
      />

      <div className="mt-4">
        <input
          type="text"
          placeholder="Trait Type (e.g., Background)"
          value={traitType}
          onChange={(e) => setTraitType(e.target.value)}
          className="px-4 py-2 border"
        />
        <input
          type="text"
          placeholder="Trait Value (e.g., Blue)"
          value={traitValue}
          onChange={(e) => setTraitValue(e.target.value)}
          className="ml-2 px-4 py-2 border"
        />
        <button onClick={addAttribute} className="ml-2 px-4 py-2 bg-green-600 text-white rounded">Add Trait</button>
      </div>

      <ul className="mt-2">
        {attributes.map((attr, index) => (
          <li key={index}>{attr.trait_type}: {attr.value}</li>
        ))}
      </ul>

      <input type="file" accept="image/*" onChange={handleFileChange} className="mt-4" />
      <button onClick={uploadFile} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>

      {imageUrl && (
        <p className="mt-4">
          Image Uploaded:
          <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500"> View </a>
        </p>
      )}

      {metadataUrl && (
        <p className="mt-4">
          Metadata Uploaded:
          <a href={metadataUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500"> View </a>
        </p>
      )}
    </div>
  );
}
