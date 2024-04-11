const LETH = artifacts.require("LETH");
const ERC20Wrapper = artifacts.require("ERC20Wrapper");

contract("ERC20Wrapper", (accounts) => {
    let lethInstance;
    let wrapperInstance;
    const initialLETHSupply = web3.utils.toBN(web3.utils.toWei('1000', 'ether'));

    before(async () => {
        wrapperInstance = await ERC20Wrapper.new(lethInstance.address);
        lethInstance = await LETH.new({ from: owner });
        await lethInstance.transfer(user, depositAmount, { from: owner });
    });

    it("Test 1: Test Deposit", async () => {
        const depositAmount = web3.utils.toWei('10', 'ether');
        
        await wrapperInstance.deposit(depositAmount, {from: accounts[1]});

        const finalLETHBalance = await lethInstance.balanceOf(accounts[1]);
        const finalWLETHBalance = await wrapperInstance.balanceOf(accounts[1]);

        assert.equal(finalLETHBalance.toString(), initialLETHSupply.sub(web3.utils.toBN(depositAmount)).toString(), "LETH balance should decrease by deposit amount");
        assert.equal(finalWLETHBalance.toString(), depositAmount, "WLETH balance should be equal to deposit amount");
    });

    it("Test 2: Test Withdraw", async () => {
        const withdrawAmount = web3.utils.toWei('5', 'ether');

        await wrapperInstance.withdraw(withdrawAmount, {from: accounts[1]});

        const finalLETHBalanceAfterWithdraw = await lethInstance.balanceOf(accounts[1]);
        const finalWLETHBalanceAfterWithdraw = await wrapperInstance.balanceOf(accounts[1]);

        assert.equal(finalLETHBalanceAfterWithdraw.toString(), initialLETHSupply.sub(web3.utils.toBN(withdrawAmount)).toString(), "LETH balance should increase by withdraw amount after withdrawal");
        assert.equal(finalWLETHBalanceAfterWithdraw.toString(), web3.utils.toWei('5', 'ether'), "WLETH balance should decrease by withdraw amount");
    });
});
