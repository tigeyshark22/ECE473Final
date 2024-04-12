//SPDX-License-Identifier: Unlicense
pragma solidity >=0.7.5;
pragma abicoder v2;

import "@uniswap/lib/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../CustomSwapRouter.sol";
import "../interfaces/IMiniDai.sol";

contract StabilizerGPT {
   IUniswapV3Pool public uniswapPool;
   IMiniDAI public miniDAI;
   IERC20 public labUSD;
   address public labUSD_addr;
   address public miniDAI_addr;
   address public swap_addr;

   uint256 constant MAX_UINT = 2**256 - 1;
   uint256 public constant PEG = 1e18; // 1 MiniDAI = 1 LabUSD, assuming 18 decimals for simplicity

   constructor(address _uniswapPool, address _miniDAI, address _labUSD, address _router) {
      uniswapPool = IUniswapV3Pool(_uniswapPool);
      miniDAI = IMiniDAI(_miniDAI);
      labUSD = IERC20(_labUSD);
      labUSD_addr = _labUSD;
      miniDAI_addr = _miniDAI;
      swap_addr = _router;
   }

   function stabilize() external {
       uint256 price = getCurrentPrice();

       if (price < PEG) {
           arbitrageAbovePeg(0.01 ether);
       } else if (price > PEG) {
           arbitrageBelowPeg(0.01 ether);
       }
   }

   function getCurrentPrice() public view returns (uint256 price) {
       (uint160 sqrtPriceX96,,,,,,) = uniswapPool.slot0();
       // Incorrect: should divide by 2 ** 96 twice; .mul and .div fixed after two different GPT queries
       uint256 priceX96 = uint256(sqrtPriceX96) * uint256(sqrtPriceX96) * (1e18) / (2**96);
       return priceX96;
   }

   function arbitrageAbovePeg(uint256 lusd_amount) public {
       TransferHelper.safeTransferFrom(labUSD_addr, msg.sender, address(this), lusd_amount);
       labUSD.approve(miniDAI_addr, MAX_UINT);
       miniDAI.mint(lusd_amount, address(this));
       // should be miniDAI.approve
       labUSD.approve(swap_addr, MAX_UINT);
       // AI Output: CustomSwapRouter(swap_addr).swapTokens(miniDAI_addr, labUSD_addr, miniDAI.balanceOf(address(this)));
       IBasicSwapRouter(swap_addr).swapTokens(miniDAI_addr, labUSD_addr, miniDAI.balanceOf(address(this)));
   }

   function arbitrageBelowPeg(uint256 lusd_amount) public {
       TransferHelper.safeTransferFrom(labUSD_addr, msg.sender, address(this), lusd_amount);
       labUSD.approve(swap_addr, MAX_UINT);
       // AI Output: CustomSwapRouter(swap_addr).swapTokens(labUSD_addr, miniDAI_addr, lusd_amount);
       IBasicSwapRouter(swap_addr).swapTokens(labUSD_addr, miniDAI_addr, lusd_amount);
       /*
       uint256 dai_received = miniDAI.balanceOf(address(this));
       miniDAI.burn(address(this), dai_received);
       labUSD.transfer(msg.sender, labUSD.balanceOf(address(this)));
       */
   }
}