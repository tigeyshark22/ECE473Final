// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Mintable {
    function mint(uint256 amount, address wallet) external;
}