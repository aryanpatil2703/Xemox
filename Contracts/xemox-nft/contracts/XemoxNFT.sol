// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract AryanNFT is ERC721URIStorage {
    uint256 private _tokenIds;

    constructor() ERC721("AryanNFT", "ANFT") {}

    function mintNFT(string memory metadataURI) public returns (uint256) {
        _tokenIds++;
        uint256 newItemId = _tokenIds;

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, metadataURI);

        return newItemId;
    }
}
