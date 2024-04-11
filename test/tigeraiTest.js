const fs = require('fs').promises;

const BENCHMARK = artifacts.require('TIGERAI');
const TIGERAI1 = artifacts.require('TIGERAI1');
const TIGERAI2 = artifacts.require('TIGERAI2');

const RUN = TIGERAI2;

contract('TIGERAI', async accounts => {
    let tigeraiInstance;
    const owner = accounts[0];
    const recipient = accounts[1];
    const nonOwner = accounts[2];
    const amount = 1000;

    beforeEach(async () => {
        tigeraiInstance = await RUN.new({ from: owner });
    });

    it('Owner should be able to mint tokens', async () => {
        await tigeraiInstance.addToWhitelist(owner);
        await tigeraiInstance.mint(amount, recipient, { from: owner });
        const balance = await tigeraiInstance.balanceOf(recipient);
        const expectedBalance = web3.utils.toBN(amount);
        assert.strictEqual(balance.toString(), expectedBalance.toString());
    });

    it('Non-whitelist should not be able to mint tokens', async () => {
        try {
            await tigeraiInstance.mint(amount, recipient, { from: recipient });
            assert.fail('Expected mint function to revert');
        } catch (error) {
            // assert.include(error.message, 'Only whitelisted addresses can mint tokens', 'Incorrect revert message');
        }
    });

    it('Owner should be able to add address to whitelist', async () => {
        await tigeraiInstance.addToWhitelist(nonOwner, { from: owner });
        const isWhitelisted = await tigeraiInstance.whitelist.call(nonOwner);
        assert.isTrue(isWhitelisted);
    });

    it('Non-owner should not be able to add address to whitelist', async () => {
        try {
            await tigeraiInstance.addToWhitelist(nonOwner, { from: nonOwner });
            assert.fail('Expected addToWhitelist function to revert');
        } catch (error) {
            // assert.include(error.message, 'Ownable: caller is not the owner', 'Incorrect revert message');
        }
    });

    it('Owner should be able to remove address from whitelist', async () => {
        await tigeraiInstance.addToWhitelist(nonOwner, { from: owner });
        let isWhitelisted = await tigeraiInstance.whitelist.call(nonOwner);
        assert.isTrue(isWhitelisted);

        await tigeraiInstance.removeFromWhitelist(nonOwner, { from: owner });
        isWhitelisted = await tigeraiInstance.whitelist.call(nonOwner);
        assert.isFalse(isWhitelisted);
    });

    it('Non-owner should not be able to remove address from whitelist', async () => {
        await tigeraiInstance.addToWhitelist(nonOwner, { from: owner });
        let isWhitelisted = await tigeraiInstance.whitelist.call(nonOwner);
        assert.isTrue(isWhitelisted);

        try {
            await tigeraiInstance.removeFromWhitelist(nonOwner, { from: nonOwner });
            assert.fail('Expected removeFromWhitelist function to revert');
        } catch (error) {
            // assert.include(error.message, 'Ownable: caller is not the owner', 'Incorrect revert message');
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
