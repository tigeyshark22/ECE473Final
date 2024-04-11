// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/Mintable.sol";

contract LUSD is ERC20, Ownable, Mintable {
    mapping(address => bool) public whitelist; // modified for testing purposes

    constructor() ERC20("LUSD", "LUSD") {
        _mint(msg.sender, 1000000 * 10 ** uint(decimals()));
        whitelist[msg.sender] = true;
    }

    function mint(uint256 amount, address wallet) external override {
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