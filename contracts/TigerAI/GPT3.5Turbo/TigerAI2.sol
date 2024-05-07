// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TIGERAI2 is ERC20, Ownable {
    
    mapping(address => bool) public whitelist;

    constructor() ERC20("TIGERAI", "TAI") {
        
    }

    function mint(uint256 amount, address wallet) public {
        require(whitelist[msg.sender], "Only whitelisted addresses can mint tokens");
        _mint(wallet, amount);
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