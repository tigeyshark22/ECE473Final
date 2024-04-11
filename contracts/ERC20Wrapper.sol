pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Wrapper is ERC20 {
    address _underlying;

    constructor(address underlyingToken) ERC20("Wrapped LETH", "WLETH") {
        require(underlyingToken != address(this), "ERC20Wrapper: cannot self wrap");
        _underlying = underlyingToken;
    }

    function deposit(uint256 amount) public virtual  {
        address sender = _msgSender();
        ERC20(_underlying).transferFrom(sender, address(this), amount); // 1: _underlying, 2: sender, 3: address(this), 4: amount
        _mint(sender, amount); // 5: sender, 6: amount
    }

    function withdraw(uint256 amount) public virtual  {
        address sender = _msgSender();
        _burn(sender, amount); // 7: sender, 8: amount
        ERC20(_underlying).transfer(sender, amount); // 1: _underlying, 9: sender, 10: amount
    }
}