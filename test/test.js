const fs = require('fs').promises;

const TIGERAI = artifacts.require('TIGERAI');

contract('TIGERAI', async accounts => {
    let tigeraiInstance;
    const owner = accounts[0];
    const recipient = accounts[1];
    const amount = 1000;

    beforeEach(async () => {
        tigeraiInstance = await TIGERAI.new({ from: owner });
    });

    it('Owner should be able to mint tokens', async () => {
        await tigeraiInstance.addToWhitelist(owner);
        await tigeraiInstance.mint(amount, recipient, { from: owner });
        const balance = await tigeraiInstance.balanceOf(recipient);
        const expectedBalance = web3.utils.toBN(amount);
        assert.strictEqual(balance.toString(), expectedBalance.toString());
    });

    it('Non-owner should not be able to mint tokens', async () => {
        try {
            await tigeraiInstance.mint(amount, recipient, { from: recipient });
            assert.fail('Expected mint function to revert');
        } catch (error) {
            assert.include(error.message, 'Only whitelisted addresses can mint tokens', 'Incorrect revert message');
        }
    });

    it('Owner should be able to burn tokens', async () => {
        await tigeraiInstance.addToWhitelist(owner);
        await tigeraiInstance.mint(amount, recipient, { from: owner });
        const initialBalance = await tigeraiInstance.balanceOf(recipient);
        await tigeraiInstance.burn(amount, { from: recipient });
        const finalBalance = await tigeraiInstance.balanceOf(recipient);
        const expectedFinalBalance = initialBalance.sub(web3.utils.toBN(amount));
        assert.strictEqual(finalBalance.toString(), expectedFinalBalance.toString());
    });
});
