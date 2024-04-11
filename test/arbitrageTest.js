const fs = require('fs').promises;

const BENCHMARK = artifacts.require('Arbitrage');
const HELPER = artifacts.require('TransferHelper');
const LUSD = artifacts.require('LUSD');
const TIGER = artifacts.require('TIGER');

contract('Arbitrage', async accounts => {
    let arbitrage;
    let lusd;
    const owner = accounts[0];
    const SWAP_ROUTER = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E';

    beforeEach(async function () {
        lusd = await LUSD.new({ from: owner });
        tiger = await TIGER.new({ from: owner });
        arbitrage = await BENCHMARK.new({ from: owner });
    });

    it('should do arbitrage successfully', async function () {
        const amountIn = 100;
        // Perform arbitrage
        await lusd.approve.sendTransaction(arbitrage.address, amountIn, { from: owner });
        const amountOut = await arbitrage.doArbitrage(amountIn, lusd.address, tiger.address, { from: owner });

        // Check final balances if necessary
        console.log('Arbitrage successful. Amount out:', amountOut);
        // Add more assertions as needed
    });

    // Add more test cases as needed
});
