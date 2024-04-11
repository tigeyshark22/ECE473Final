const fs = require('fs').promises;

const BENCHMARK = artifacts.require('Stabilizer');
const LUSD = artifacts.require('LUSD');
const MDAI = artifacts.require('MiniDAI');
const SWAP = artifacts.require('BasicSwapRouter');
const POOL = "0x8087a0A024D0dD6Ff66B671c0496FbDd067cA3dF";

contract('Arbitrage', async accounts => {
    let lusd, mdai, stab;
    const owner = accounts[0];

    beforeEach(async function () {
        lusd = await LUSD.new({ from: owner });
        mdai = await MDAI.new("MiniDAI", "MDAI", lusd.address, { from: owner });
        // let pool = setup(lusd, mdai);
        swap = await SWAP.new({ from: owner });
        stab = await BENCHMARK.new(POOL, mdai.address, lusd.address, swap.address, { from: owner });
    });

    it('stabilizes successfully', async function () {
        // Perform arbitrage
        try {
            await lusd.approve(stab.address, "10000000000000000", { from: owner });
            await stab.stabilize({ from: owner });
        } catch (error) {
            console.log("Error: ", error)
        }
    });

    it('gets current price', async function () {
        const price = await stab.getCurrentPrice({ from: owner });
        const readable_price = price.toString();
        console.log(readable_price);
    });

    // Add more test cases as needed
});
