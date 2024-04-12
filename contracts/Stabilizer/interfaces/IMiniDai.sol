//SPDX-License-Identifier: Unlicense
pragma solidity >=0.7.5;

interface IMiniDAI {
    function balanceOf(address account) external view returns (uint256);
    function mint(uint256 amount, address to) external;
    function burn(address from, uint256 amount) external;
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}