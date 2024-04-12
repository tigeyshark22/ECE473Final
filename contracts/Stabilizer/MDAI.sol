// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../AtomicArbitrage/interfaces/Mintable.sol";

contract MiniDAI is ERC20, Mintable {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    address public labUSD;
    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor(
        string memory name,
        string memory symbol,
        address _labUSDAddress
    ) ERC20(name, symbol) {
        labUSD = _labUSDAddress;
    }

    event mintToken(address to, uint256 amount);
    event burnToken(address from, uint256 amount);

    function mint(uint256 amount, address wallet) external override {
        _mint(wallet, amount);
    }

    function actualMint(uint256 amount, address wallet) external {
        require(IERC20(labUSD).transferFrom(msg.sender, address(this), amount), "LabUSD transfer failed");
        _mint(wallet, amount);
        emit mintToken(wallet, amount);
    }

    function burn(address from, uint256 amount) external {
        // require(_balances[from] >= amount, "Insufficient balance");
        Mintable(labUSD).mint(amount, address(this));
        require(IERC20(labUSD).transfer(from, amount), "LabUSD transfer failed");
        _burn(from, amount);
        emit burnToken(from, amount);
    }
}