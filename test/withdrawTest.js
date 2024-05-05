const withdraw = artifacts.require("withdraw");

contract("withdrawTest", (accounts) => {
    let contractInstance;
    const owner = accounts[0];
    const nonOwner = accounts[1];

    beforeEach(async () => {
        contractInstance = await withdraw.new(owner);
    });

    it("should allow the owner to withdraw all Ether", async () => {
        // First, let's send some Ether to the contract
        const amountToSend = web3.utils.toWei("1", "ether");
        await web3.eth.sendTransaction({ from: nonOwner, to: contractInstance.address, value: amountToSend });

        // Check contract balance before withdrawal
        const balanceBefore = await web3.eth.getBalance(contractInstance.address);
        assert.equal(balanceBefore, amountToSend, "Contract did not receive the Ether");

        // Now let the owner withdraw
        await contractInstance.withdrawEther({ from: owner });

        // Check contract balance after withdrawal
        const balanceAfter = await web3.eth.getBalance(contractInstance.address);
        assert.equal(balanceAfter, 0, "Contract still contains Ether after withdrawal");

        // Check owner's balance increase (not exact because of gas costs)
        const ownerBalanceAfter = await web3.eth.getBalance(owner);
        assert.isTrue(new web3.utils.BN(ownerBalanceAfter).gt(new web3.utils.BN(balanceBefore)), "Owner did not receive the Ether or gas costs were too high");
    });

    it("should prevent non-owners from withdrawing Ether", async () => {
        // Send some Ether to the contract
        const amountToSend = web3.utils.toWei("1", "ether");
        await web3.eth.sendTransaction({ from: nonOwner, to: contractInstance.address, value: amountToSend });

        // Attempt to withdraw with a non-owner account
        try {
            await contractInstance.withdrawEther({ from: nonOwner });
            assert.fail("The withdrawal did not fail as expected");
        } catch (error) {
            assert.include(error.message, "Not the Owner", "Error message should contain 'Not the Owner'");
        }

        // Check contract balance remains the same
        const balanceAfter = await web3.eth.getBalance(contractInstance.address);
        assert.equal(balanceAfter, amountToSend, "Contract Ether was withdrawn by non-owner");
    });
});