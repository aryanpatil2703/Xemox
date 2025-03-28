// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract XemoxNFT is ERC721URIStorage {
    uint256 private _tokenIdCounter;

    constructor() ERC721("XemoxNFT", "XEM") {}

    function mintNFT(string memory metadataURI) public returns (uint256) {
        _tokenIdCounter++;
        uint256 newItemId = _tokenIdCounter;

        _mint(msg.sender, newItemId); // Mint to the sender's wallet
        _setTokenURI(newItemId, metadataURI);

        return newItemId;
    }
}
