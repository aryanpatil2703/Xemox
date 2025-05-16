import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface NFTAsset {
  id: number;
  name: string;
  image_url: string | null;
  permalink: string;
  collection: {
    name: string;
  };
}

const Explore: React.FC = () => {
  const [nfts, setNfts] = useState<NFTAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNFTs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://api.opensea.io/api/v1/assets', {
        params: {
          order_direction: 'desc',
          limit: 20,
          include_orders: false,
        },
        headers: {
          Accept: 'application/json',
          'X-API-KEY': process.env.NEXT_PUBLIC_OPENSEA_API_KEY || '',
        },
      });

      console.log('OpenSea API response:', response.data);
      if (Array.isArray(response.data.assets)) {
        setNfts(response.data.assets);
      } else {
        setError('API returned unexpected data format');
      }
    } catch (err) {
      setError('Failed to fetch NFTs from OpenSea.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center py-10 text-lg font-semibold">
        Loading NFTs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center py-10 text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center py-10">
        No NFTs found.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Explore NFTs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {nfts.map((nft) => (
          <a
            key={nft.id}
            href={nft.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition duration-300"
          >
            {nft.image_url ? (
              <img
                src={nft.image_url}
                alt={nft.name || 'NFT Image'}
                className="w-full h-60 object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-60 bg-gray-200 flex items-center justify-center text-sm text-gray-600">
                No Image
              </div>
            )}
            <div className="p-4">
              <h2 className="font-semibold text-lg truncate">{nft.name || 'Unnamed NFT'}</h2>
              <p className="text-sm text-gray-600 truncate">Collection: {nft.collection.name}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Explore;