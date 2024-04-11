const fs = require('fs').promises;

const LETH = artifacts.require("LETH");
const ERC20Wrapper = artifacts.require("ERC20Wrapper");

contract("ERC20Wrapper", (accounts) => {
    let lethInstance;
    let wrapperInstance;
    const initialLETHSupply = web3.utils.toBN(web3.utils.toWei('1000', 'ether'));
    const depositAmount = web3.utils.toBN(web3.utils.toWei('100', 'ether'));

    before(async () => {
        wrapperInstance = await ERC20Wrapper.new(lethInstance.address);
        lethInstance = await LETH.new({ from: owner });
        await lethInstance.transfer(user, depositAmount, { from: owner });
    });

    it("Test 1: Test Deposit", async () => {
        const initialBalance = await wrapperInstance.balanceOf(user);
        await lethInstance.approve(wrapperInstance.address, depositAmount, { from: user });
        await wrapperInstance.deposit(depositAmount, { from: user });
        const finalLETHBalance = await lethInstance.balanceOf(user);
        const finalWLETHBalance = await wrapperInstance.balanceOf(user);
        
        assert.isTrue(finalWLETHBalance.gt(initialBalance), 'Wrapped token balance should increase after deposit');
        assert.equal(finalLETHBalance.toString(), initialLETHSupply.sub(web3.utils.toBN(depositAmount)).toString(), "LETH balance should decrease by deposit amount");
        assert.equal(finalWLETHBalance.toString(), depositAmount, "WLETH balance should be equal to deposit amount");
    });

    it("Test 2: Test Withdraw", async () => {
        await lethInstance.approve(wrapperInstance.address, depositAmount, { from: user });
        await wrapperInstance.deposit(depositAmount, { from: user });
        const initialBalance = await wrapperInstance.balanceOf(user);
        await wrapperInstance.withdraw(depositAmount, { from: user });
        const finalBalance = await wrapperInstance.balanceOf(user);

        const finalLETHBalanceAfterWithdraw = await lethInstance.balanceOf(user);
        const finalWLETHBalanceAfterWithdraw = await wrapperInstance.balanceOf(user);

        assert.equal(finalLETHBalanceAfterWithdraw.toString(), initialLETHSupply.sub(web3.utils.toBN(withdrawAmount)).toString(), "LETH balance should increase by withdraw amount after withdrawal");
        assert.equal(finalWLETHBalanceAfterWithdraw.toString(), web3.utils.toWei('5', 'ether'), "WLETH balance should decrease by withdraw amount");
    });
});
