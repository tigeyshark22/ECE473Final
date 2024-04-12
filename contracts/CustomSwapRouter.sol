// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./AtomicArbitrage/interfaces/Mintable.sol";

interface IBasicSwapRouter {
    function swapTokens(address _tokenA, address _tokenB, uint256 amountA) external;
}

contract BasicSwapRouter is IBasicSwapRouter {
    function swapTokens(address _tokenA, address _tokenB, uint256 amountA) external override {
        IERC20(_tokenA).transferFrom(msg.sender, address(this), amountA);
        Mintable(_tokenA).mint(amountA, address(this));
        Mintable(_tokenB).mint(amountA, address(this));
        IERC20(_tokenB).transfer(msg.sender, IERC20(_tokenB).balanceOf(address(this)));
    }
}