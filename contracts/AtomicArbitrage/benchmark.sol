//SPDX-License-Identifier: Unlicense
pragma solidity >=0.7.5;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/lib/contracts/libraries/TransferHelper.sol";
import "@uniswap/swap-router-contracts/contracts/interfaces/IV3SwapRouter.sol";

contract Arbitrage {

    uint256 constant MAX_UINT = 2**256 - 1;

    address private constant SWAP_ROUTER = 0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E;

    IV3SwapRouter public immutable swapRouter = IV3SwapRouter(SWAP_ROUTER);

    function doArbitrage(uint256 amountIn, address lusdAddr, address tigerAddr)
        external
        returns (uint256 amountOut)
    {
        // Use TransferHelper to transfer LUSD from your wallet to the smart contract
        // Make sure that you approve this contract to spend LUSD through the LUSD contract
        TransferHelper.safeTransferFrom(
            lusdAddr, // Token 
            msg.sender, // Sender
            address(this), // Recipient
            amountIn // Amount
        );

        // Approve the SwapRouter to transfer our LUSD
        TransferHelper.safeApprove(lusdAddr, address(swapRouter), amountIn);

        // Create transaction for swapping LUSD to TIGER 
        // Using Pool 1 or Pool 2??
        IV3SwapRouter.ExactInputSingleParams memory params = IV3SwapRouter
            .ExactInputSingleParams({
                tokenIn: lusdAddr,
                tokenOut: tigerAddr,
                fee: 500, // Set to 500 if pool 1 and 3000 if pool 2
                recipient: address(this),// Who is receiving the TIGER //
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        
        // Execute transaction and store amount of TIGER received
        // Remember: in the intermediary steps, LUSD/TIGER is stored 
        // directly in the smart contract
        uint256 amountOut1 = swapRouter.exactInputSingle(params);

        // Approve the SwapRouter to transfer our new TIGER
        TransferHelper.safeApprove(tigerAddr, address(swapRouter), MAX_UINT);

        // Create transaction for swapping TIGER to LUSD 
        // Using Pool 1 or Pool 2 ?? 
        IV3SwapRouter.ExactInputSingleParams memory params2 = IV3SwapRouter
            .ExactInputSingleParams({
                tokenIn: tigerAddr,
                tokenOut: lusdAddr,
                fee: 500, // Set to 500 if pool 1 and 3000 if pool 2
                recipient: msg.sender, // Who is receiving the LUSD? This is the last step of the arbitrage. // 
                amountIn: amountOut1, // Think about what value we would like to send 
                // (hint: there are various reasons why the estimated amount  
                // of LUSD does not align with the amount of LUSD received)
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // Execute transaction and store amount of TIGER received
        amountOut = swapRouter.exactInputSingle(params2);
    }
}