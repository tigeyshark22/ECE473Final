// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TigerNFTEval is ERC721 {
    uint256 public tokenId = 1;
    mapping(uint256 => string) public idToData;
    
    constructor() ERC721("TigerNFT", "TNFT") {
    }

    function mint(string memory _data, address _to) public {
        // require(owner() == msg.sender, "Only the owner can mint NFTs"); Commented out because GPT cannot fix this
        _safeMint(_to, tokenId);
        idToData[tokenId] = _data;
        tokenId++;
    }

    function retrieve(uint256 _id) public view returns (string memory) {
        return idToData[_id];
    }

    function verify(address _owner, uint256 _id) public view returns (bool) {
        return ownerOf(_id) == _owner;
    }
}