// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TigerAI is ERC20, Ownable {
    address private constant DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    mapping(address => bool) public whitelist; // for unit testing purposes, this is made public

    constructor() ERC20("TIGERAI", "TAI") {
        _mint(msg.sender, 1000000 * 10 ** uint(decimals()));
        whitelist[msg.sender] = true;
    }

    function addToWhitelist(address _address) public onlyOwner {
        whitelist[_address] = true;
    }

    function removeFromWhitelist(address _address) public onlyOwner {
        whitelist[_address] = false;
    }

    function mint(uint256 amount, address wallet) public {
        require(whitelist[msg.sender], "Only whitelisted addresses can mint tokens");
        _mint(wallet, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
        _transfer(msg.sender, DEAD_ADDRESS, amount);
    }
}
