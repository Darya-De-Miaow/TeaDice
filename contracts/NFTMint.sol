// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// This contract handles NFT minting and follows the ERC-721 standard for non-fungible tokens (which proof ownership etc of specific item).
contract NFTMint is ERC721, Ownable {
    // This tracks how many NFTs have been minted so each token gets a unique ID.
    uint256 public tokenCounter;

    constructor() ERC721("TeaDice", "tDice") {
        tokenCounter = 1;
    }

    // This mints a new NFT to a given address - only the contract owner can call this.
    function mintNFT(
        address to,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        uint256 newTokenId = tokenCounter;
        _safeMint(to, newTokenId);
        tokenCounter += 1;
        return newTokenId;
    }
}