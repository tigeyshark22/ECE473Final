const fs = require('fs').promises;

const LETH = artifacts.require("LETH");
const ERC20Wrapper = artifacts.require("ERC20Wrapper");

contract("ERC20Wrapper", async accounts => {
    let lethInstance;
    let wrapperInstance;

    const owner = accounts[0];
    const user = accounts[1];

    const depositAmount = web3.utils.toBN(web3.utils.toWei('100', 'ether'));
    //const amount = web3.utils.toBN(web3.utils.toWei('20', 'ether'));
    const initialSupply = web3.utils.toWei('1000', 'ether');

    beforeEach(async () => {
        lethInstance = await LETH.new({ from: owner });

        // Mint an initial supply of LETH tokens to the owner
        await lethInstance.mint(initialSupply, owner);

        wrapperInstance = await ERC20Wrapper.new(lethInstance.address, { from: owner });

        // Transfer depositAmount from owner to user
        await lethInstance.transfer(user, initialSupply, { from: owner });
    });

    it("Test 1: Test Deposit", async () => {
        const initialWLETH = await wrapperInstance.balanceOf(user);
        const initialLETH = await lethInstance.balanceOf(user);
        await lethInstance.approve(wrapperInstance.address, depositAmount, { from: user });
        await wrapperInstance.deposit(depositAmount, { from: user });
        const finalLETHBalance = await lethInstance.balanceOf(user);
        const finalWLETHBalance = await wrapperInstance.balanceOf(user);
        
        assert.isTrue(finalWLETHBalance.gt(initialWLETH), 'Wrapped token balance should increase after deposit');
        assert.equal(initialWLETH, 0, "Should have no WLETH in the beginning")
        assert.equal(finalLETHBalance, initialLETH.sub(web3.utils.toBN(depositAmount)).toString(), "LETH balance should decrease by deposit amount");
        assert.equal(finalWLETHBalance.toString(), depositAmount, "WLETH balance should be equal to deposit amount");
    });

    it("Test 2: Test Withdraw", async () => {
        await lethInstance.approve(wrapperInstance.address, depositAmount, { from: user });
        await wrapperInstance.deposit(depositAmount, { from: user });
        const initialWLETH = await wrapperInstance.balanceOf(user);
        const initialLETH = await lethInstance.balanceOf(user);
        await wrapperInstance.withdraw(depositAmount, { from: user });
        const finalWLETH = await wrapperInstance.balanceOf(user);
        const finalLETH = await lethInstance.balanceOf(user);

        assert.isTrue(finalLETH.gt(initialLETH))
        assert.equal(initialLETH.toString(), finalLETH.sub(web3.utils.toBN(depositAmount)).toString(), "LETH balance should increase by withdraw amount after withdrawal");
        assert.equal(finalWLETH.toString(), initialWLETH.sub(web3.utils.toBN(depositAmount)), "WLETH balance should decrease by withdraw amount");
    });
});
