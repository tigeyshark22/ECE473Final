const fs = require('Chai');
const TIGERAI = artifacts.require('TIGERAI');

contract('TigerAI test', async accounts => {
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
        expect(balance.toNumber()).to.equal(amount);
    });

    it('Non-owner should not be able to mint tokens', async () => {
        await expect(tigeraiInstance.mint(amount, recipient, { from: recipient })).to.be.rejectedWith('Only whitelisted addresses can mint tokens');
    });

    it('Owner should be able to burn tokens', async () => {
        await tigeraiInstance.addToWhitelist(owner);
        await tigeraiInstance.mint(amount, recipient, { from: owner });
        const initialBalance = await tigeraiInstance.balanceOf(recipient);
        await tigeraiInstance.burn(amount, { from: recipient });
        const finalBalance = await tigeraiInstance.balanceOf(recipient);
        expect(finalBalance.toNumber()).to.equal(initialBalance.toNumber() - amount);
    });

    it('Non-owner should not be able to burn tokens', async () => {
        await expect(tigeraiInstance.burn(amount, { from: recipient })).to.be.rejectedWith('Ownable: caller is not the owner');
    });
});