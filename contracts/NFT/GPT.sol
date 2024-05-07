// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TigerNFTGPT is ERC721 {
    address private _owner;
    uint256 tokenId;
    mapping(uint256 => string) private idToData;
    mapping(uint256 => address) private idToOwner;

    constructor() ERC721("TigerNFT", "TNFT") {
        _owner = msg.sender;
        tokenId = 0;
    }

    function mint(string memory _data, address _to) public {
        require(_owner == msg.sender, "Only the owner can mint NFTs");
        tokenId++;
        _safeMint(_to, tokenId);
        idToOwner[tokenId] = _to;
        idToData[tokenId] = _data;
    }

    function retrieve(uint256 _id) public view returns (string memory) {
        return idToData[_id];
    }

    function verify(address _address, uint256 _id) public view returns (bool) {
        return (idToOwner[_id] == _address);
    }
}