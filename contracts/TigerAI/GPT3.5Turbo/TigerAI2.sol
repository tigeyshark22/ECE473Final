// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TIGERAI2 is ERC20, Ownable {
    mapping(address => bool) public whitelist;

    constructor() ERC20("TIGERAI2", "TGR") {
        _mint(msg.sender, 1000000000000000000000); // Mint 1000 tokens initially
    }

    function mint(uint256 amount, address recipient) public {
        require(whitelist[msg.sender], "Address not whitelisted");
        _mint(recipient, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    function addToWhitelist(address _address) public onlyOwner {
        whitelist[_address] = true;
    }

    function removeFromWhitelist(address _address) public onlyOwner {
        whitelist[_address] = false;
    }
}