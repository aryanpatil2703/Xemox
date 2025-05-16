// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract XemoxMarketplace is ReentrancyGuard, Ownable, IERC721Receiver {
    constructor() Ownable(msg.sender) {}

    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool isActive;
    }

    uint256 private _listingId;
    uint256 public feePercent = 250; // 2.5% (in basis points)
    mapping(uint256 => Listing) public listings;
    mapping(address => uint256[]) public listingsBySeller;
    mapping(address => mapping(uint256 => bool)) public isTokenListed;

    mapping(address => uint256) public pendingWithdrawals;

    event ItemListed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price
    );
    event ItemSold(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price
    );
    event ListingCancelled(uint256 indexed listingId);
    event Withdrawn(address indexed seller, uint256 amount);
    event FeeUpdated(uint256 newFee);

    // Fallback for receiving NFTs
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    // --- MAIN FUNCTIONS ---

    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(price > 0, "Price must be greater than zero");
        require(!isTokenListed[nftContract][tokenId], "Already listed");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "You must own the NFT");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) ||
                nft.getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );

        _listingId++;
        listings[_listingId] = Listing(
            msg.sender,
            nftContract,
            tokenId,
            price,
            true
        );
        listingsBySeller[msg.sender].push(_listingId);
        isTokenListed[nftContract][tokenId] = true;

        emit ItemListed(_listingId, msg.sender, nftContract, tokenId, price);
    }

    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage item = listings[listingId];
        require(item.seller == msg.sender, "Not your listing");
        require(item.isActive, "Already inactive");

        item.isActive = false;
        isTokenListed[item.nftContract][item.tokenId] = false;

        emit ListingCancelled(listingId);
    }

    function buyItem(uint256 listingId) external payable nonReentrant {
        Listing storage item = listings[listingId];
        require(item.isActive, "Listing not active");
        require(msg.value == item.price, "Incorrect payment");

        item.isActive = false;
        isTokenListed[item.nftContract][item.tokenId] = false;

        // Transfer NFT to buyer
        IERC721(item.nftContract).safeTransferFrom(
            item.seller,
            msg.sender,
            item.tokenId
        );

        // Calculate fee and credit seller
        uint256 fee = (msg.value * feePercent) / 10000;
        uint256 sellerProceeds = msg.value - fee;

        pendingWithdrawals[item.seller] += sellerProceeds;
        pendingWithdrawals[owner()] += fee;

        emit ItemSold(
            listingId,
            msg.sender,
            item.nftContract,
            item.tokenId,
            item.price
        );
    }

    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No balance");

        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit Withdrawn(msg.sender, amount);
    }

    // --- ADMIN ---

    function setFeePercent(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Max fee 10%");
        feePercent = newFee;
        emit FeeUpdated(newFee);
    }

    // --- VIEW FUNCTIONS ---

    function getAllListings() external view returns (Listing[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= _listingId; i++) {
            if (listings[i].isActive) count++;
        }

        Listing[] memory active = new Listing[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= _listingId; i++) {
            if (listings[i].isActive) {
                active[index++] = listings[i];
            }
        }
        return active;
    }

    function getListingsBySeller(
        address seller
    ) external view returns (Listing[] memory) {
        uint256[] storage ids = listingsBySeller[seller];
        uint256 count = 0;

        for (uint256 i = 0; i < ids.length; i++) {
            if (listings[ids[i]].isActive) count++;
        }

        Listing[] memory active = new Listing[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (listings[ids[i]].isActive) {
                active[index++] = listings[ids[i]];
            }
        }
        return active;
    }
}
