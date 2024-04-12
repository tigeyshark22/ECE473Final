//SPDX-License-Identifier: Unlicense
pragma solidity >=0.7.5;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/lib/contracts/libraries/TransferHelper.sol";
import "@uniswap/swap-router-contracts/contracts/interfaces/IV3SwapRouter.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../CustomSwapRouter.sol";
import "./interfaces/IMiniDai.sol";

contract Stabilizer {
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
            // MiniDAI is above peg, mint MiniDAI and sell on Uniswap, uses 0.01 lusd
            arbitrageAbovePeg(1e16);
        } else if (price > PEG) {
            // MiniDAI is below peg, buy MiniDAI from Uniswap and burn it, uses 0.01 lusd
            arbitrageBelowPeg(1e16);
        }
    }

    function getCurrentPrice() public view returns (uint256 price) {
        (uint160 sqrtPriceX96,,,,,,) = uniswapPool.slot0();
        // Adjust for 18 decimal places - the square of the price in X96 format, then adjusting for decimals
        price = uint256(sqrtPriceX96)**2 * 1e18 >> (96 * 2);
        return price;
    }

    function arbitrageAbovePeg(uint256 lusd_amount) public {
        labUSD.transferFrom(msg.sender, address(this), lusd_amount); // Transfer lab usd from your account to this contract
        TransferHelper.safeApprove(labUSD_addr, miniDAI_addr, lusd_amount); // approve the miniDAI contract to use this contract's labUSD
        miniDAI.mint(lusd_amount, address(this)); // mint DAI tokens by posting labUSD as collateral
        TransferHelper.safeApprove(miniDAI_addr, swap_addr, lusd_amount); // Approve uniswap router to use your DAI
        IBasicSwapRouter(swap_addr).swapTokens(miniDAI_addr, labUSD_addr, lusd_amount); // send the swap
    }

    function arbitrageBelowPeg(uint256 lusd_amount) public {
        labUSD.transferFrom(msg.sender, address(this), lusd_amount); // Transfer LabUSD from the caller's account to this contract to prepare for the swap.
        TransferHelper.safeApprove(labUSD_addr, swap_addr, lusd_amount); // Approve the Uniswap router to spend LabUSD from this contract.
        IBasicSwapRouter(swap_addr).swapTokens(labUSD_addr, miniDAI_addr, lusd_amount);
        uint256 mdai_amount = miniDAI.balanceOf(address(this)); // Check the amount of MiniDAI received by this contract.
        miniDAI.burn(address(this), mdai_amount); 
        labUSD.transfer(msg.sender, labUSD.balanceOf(address(this))); // Return any remaining LabUSD back to the caller.
        
        // Note: Real-world implementations would need to manage ERC20 token approvals,
        // handle transaction slippage, calculate optimal trade sizes, and ensure economic viability of arbitrage (including gas costs).
    }
}