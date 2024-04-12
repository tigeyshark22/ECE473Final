const fs = require('fs').promises;

const BENCHMARK = artifacts.require('Stabilizer');
const LUSD = artifacts.require('LUSD');
const MDAI = artifacts.require('MiniDAI');
const SWAP = artifacts.require('BasicSwapRouter');
const POOL = "0x8087a0A024D0dD6Ff66B671c0496FbDd067cA3dF";
const GPT = artifacts.require('StabilizerGPT');

contract('Arbitrage', async accounts => {
    let lusd, mdai, stab;
    const owner = accounts[0];

    beforeEach(async function () {
        lusd = await LUSD.new({ from: owner });
        mdai = await MDAI.new("MiniDAI", "MDAI", lusd.address, { from: owner });

        swap = await SWAP.new({ from: owner });
        bench_stab = await BENCHMARK.new(POOL, mdai.address, lusd.address, swap.address, { from: owner });
        test_stab = await GPT.new(POOL, mdai.address, lusd.address, swap.address, { from: owner });
    });

    it('stabilizes successfully', async function () {
        // Perform arbitrage
        try {
            await lusd.approve(test_stab.address, "10000000000000000", { from: owner });
            await test_stab.stabilize({ from: owner });
        } catch (error) {
            console.log("Error: ", error)
            assert.fail("Failed to arbitrage");
        }
    });

    it('gets current price', async function () {
        const price = await bench_stab.getCurrentPrice({ from: owner });
        const readable_price = price.toString();
        const gptPrice = await test_stab.getCurrentPrice({ from: owner });
        const gpt_readable_price = gptPrice.toString();
        assert.strictEqual(readable_price, gpt_readable_price);
    });

    it('arbitrage above peg works', async function () {
        try {
            await lusd.approve(test_stab.address, "10000000000000000", { from: owner });
            await test_stab.arbitrageAbovePeg("10000000000000000", { from: owner });
        } catch (error) {
            console.log("Above peg arbitrage failed: ", error);
            assert.fail();
        }
    });

    it('arbitrage below peg works', async function () {
        try {
            await lusd.approve(test_stab.address, "10000000000000000", { from: owner });
            await test_stab.arbitrageBelowPeg("10000000000000000", { from: owner });
        } catch (error) {
            console.log("Below peg arbitrage failed: ", error)
            assert.fail();
        }
    });

    // Add more test cases as needed
});
