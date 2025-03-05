import { useState } from "react";
import { PinataSDK } from "pinata-web3";

export default function Create() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState<{ IpfsHash: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const pinata = new PinataSDK({
    pinataJwt: import.meta.env.VITE_PINATA_JWT, // Ensure VITE_ prefix for env variables in Vite
    pinataGateway: "aqua-magnetic-wallaby-170.mypinata.cloud",
  });

  // Handle file selection
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  }

  // Upload file to Pinata IPFS
  async function uploadFile() {
    if (!file) {
      alert("Please select an image first!");
      return;
    }

    setLoading(true);
    try {
      const upload = await pinata.upload.file(file);
      setUploadData(upload);
      console.log("Uploaded:", upload);
    } catch (error) {
      console.error("Error uploading:", error);
    }
    setLoading(false);
  }

  return (
    <div className="container mx-auto text-center mt-20">
      <h1 className="text-3xl">Upload Image to IPFS</h1>

      {/* File Input */}
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        className="mt-4"
      />

      {/* Upload Button */}
      <button 
        onClick={uploadFile} 
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {/* Show Uploaded File Link */}
      {uploadData && (
        <div className="mt-4">
          <p>File Uploaded Successfully!</p>
          <a 
            href={`https://gateway.pinata.cloud/ipfs/${uploadData.IpfsHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            View on IPFS
          </a>
        </div>
      )}
    </div>
  );
}
