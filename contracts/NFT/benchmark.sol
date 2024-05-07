// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TigerNFT is ERC721, Ownable {

    uint256 public tokenID; // ID for the NFTs
    mapping(uint256 => string) public tokenData; // Mapping to store the string associated with each NFT

    constructor() ERC721("TigerNFT", "TNFT") {
        tokenID = 1;
    }

    function mint(string memory _input, address _to) public onlyOwner {
        tokenData[tokenID] = _input; // Associate the input string with the new token ID
        _safeMint(_to, tokenID);
        tokenID++;
    }

    // Function to retrieve the string associated with a given NFT ID
    function retrieve(uint256 _id) public view returns (string memory) {
        return tokenData[_id]; // Return the string associated with the given NFT ID
    }

    function verify(address _address, uint _id) public view returns (bool) {
        return ownerOf(_id) == _address; // Check if the address is the owner of the given NFT ID
    }
}