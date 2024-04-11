// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TIGERAI1 is ERC20, Ownable {
    mapping(address => bool) public whitelist; // modified for testing purposes

    constructor() ERC20("TIGERAI1", "TAI") {
        _mint(msg.sender, 1000000 * 10 ** uint(decimals()));
        whitelist[msg.sender] = true;
    }

    function mint(uint256 amount, address wallet) public {
        require(whitelist[msg.sender], "You are not whitelisted to mint tokens");
        _mint(wallet, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    function addToWhitelist(address account) public onlyOwner {
        whitelist[account] = true;
    }

    function removeFromWhitelist(address account) public onlyOwner {
        whitelist[account] = false;
    }
}
