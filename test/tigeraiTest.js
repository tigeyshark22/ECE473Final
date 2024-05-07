const fs = require('fs').promises;

const BENCHMARK = artifacts.require('TIGERAI');
const TIGERAI = artifacts.require('TIGERAI1');
const TIGERAIEVAL = artifacts.require('TIGERAI2');

const RUN = TIGERAI;

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
        let err = null;
        try {
            await tigeraiInstance.mint(amount, recipient, { from: recipient });
        } catch (error) {
            err = error;
            // assert.include(error.message, 'Only whitelisted addresses can mint tokens', 'Incorrect revert message');
        }
        assert.ok(err instanceof Error);
    });

    it('Owner should be able to add address to whitelist', async () => {
        await tigeraiInstance.addToWhitelist(nonOwner, { from: owner });
        const isWhitelisted = await tigeraiInstance.whitelist.call(nonOwner);
        assert.isTrue(isWhitelisted);
    });

    it('Non-owner should not be able to add address to whitelist', async () => {
        let err = null;
        try {
            await tigeraiInstance.addToWhitelist(nonOwner, { from: nonOwner });
        } catch (error) {
            err = error;
            // assert.include(error.message, 'Ownable: caller is not the owner', 'Incorrect revert message');
        }
        assert.ok(err instanceof Error);
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

        let err = null;

        try {
            await tigeraiInstance.removeFromWhitelist(nonOwner, { from: nonOwner });
        } catch (error) {
            err = error;
            // assert.include(error.message, 'Ownable: caller is not the owner', 'Incorrect revert message');
        }

        assert.ok(err instanceof Error);
    });

    it('Recipient should be able to burn tokens', async () => {
        await tigeraiInstance.addToWhitelist(owner);
        await tigeraiInstance.mint(amount, recipient, { from: owner });
        const initialBalance = await tigeraiInstance.balanceOf(recipient);
        await tigeraiInstance.burn(amount, { from: recipient });
        const finalBalance = await tigeraiInstance.balanceOf(recipient);
        const expectedFinalBalance = initialBalance.sub(web3.utils.toBN(amount));
        assert.strictEqual(finalBalance.toString(), expectedFinalBalance.toString());
    });

    it('People with not enough balance cannot burn', async () => {
        let err = null;
        try {
            await tigeraiInstance.addToWhitelist(owner);
            await tigeraiInstance.mint(amount, recipient, { from: owner });
            await tigeraiInstance.burn(2 * amount, { from: recipient });
        } catch (error) {
            err = error;
        }

        assert.ok(err instanceof Error);
    });
});
