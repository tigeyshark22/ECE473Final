const LendingProtocol = artifacts.require("LendingProtocol");
const ERC20Mock = artifacts.require("MockERC20"); // Import a mock ERC20 token contract for testing

contract("LendingProtocol", (accounts) => {
    const owner = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];

    let lendingProtocol;
    let collateralToken;

    beforeEach(async () => {
        // Deploy a mock ERC20 token to use as collateral token
        collateralToken = await ERC20Mock.new("CollateralToken", "CT", web3.utils.toWei('1000000', 'ether'), { from: owner });

        // Deploy the LendingProtocol contract with a collateral ratio of 2 and the mock ERC20 token address
        lendingProtocol = await LendingProtocol.new(2, collateralToken.address, { from: owner });
    });

    it("should allow users to add liquidity", async () => {
        const amount = web3.utils.toWei("100", "ether");

        // User1 adds liquidity
        await collateralToken.transfer(user1, amount, { from: owner });
        await collateralToken.approve(lendingProtocol.address, amount, { from: user1 });
        await lendingProtocol.addLiquidity(amount, { from: user1 });

        // Check liquidity in the lending protocol
        const liquidity = await lendingProtocol.getLiquidity();
        assert.strictEqual(liquidity.toString(), amount);

        // Check user1's balance in the lending protocol
        const user1Balance = await lendingProtocol.getBalance(user1);
        assert.strictEqual(user1Balance.toString(), amount);
    });

    it("should allow users to borrow tokens using collateral", async () => {
        const amountToDeposit = web3.utils.toWei("2", "wei");
        const amountToBorrow = web3.utils.toWei("1", "wei");

        // User1 adds liquidity
        await collateralToken.transfer(user1, amountToDeposit, { from: owner });
        await collateralToken.approve(lendingProtocol.address, amountToDeposit, { from: user1 });
        await lendingProtocol.addLiquidity(amountToDeposit, { from: user1 });

        // User2 borrows tokens using collateral
        await lendingProtocol.borrow(amountToBorrow, { from: user2, value: amountToDeposit });

        // Check borrowed amount for user2
        const borrowAmount = await lendingProtocol.getBorrowAmount(user2);
        assert.strictEqual(borrowAmount.toString(), amountToBorrow);
    });

    it("should allow users to repay borrowed tokens and retrieve collateral", async () => {
        const amountToDeposit = web3.utils.toWei("2", "wei");
        const amountToBorrow = web3.utils.toWei("1", "wei");
    
        // User1 adds liquidity
        await collateralToken.transfer(user1, amountToDeposit, { from: owner });
        await collateralToken.approve(lendingProtocol.address, amountToDeposit, { from: user1 });
        await lendingProtocol.addLiquidity(amountToDeposit, { from: user1 });
    
        // User2 approves allowance for LendingProtocol contract to transfer collateral tokens
        await collateralToken.approve(lendingProtocol.address, amountToDeposit, { from: user2 });
    
        // User2 borrows tokens using collateral
        await lendingProtocol.borrow(amountToBorrow, { from: user2, value: amountToDeposit });
    
        // User2 repays borrowed tokens
        await lendingProtocol.repay(amountToBorrow, { from: user2 });
    
        // Check borrow amount for user2 after repayment
        const borrowAmount = await lendingProtocol.getBorrowAmount(user2);
        assert.strictEqual(borrowAmount.toString(), "0");
    });

    it("should allow users to withdraw collateral tokens", async () => {
        const amountToDeposit = web3.utils.toWei("10", "ether");
        const amountToWithdraw = web3.utils.toWei("5", "ether");

        // User1 adds liquidity
        await collateralToken.transfer(user1, amountToDeposit, { from: owner });
        await collateralToken.approve(lendingProtocol.address, amountToDeposit, { from: user1 });
        await lendingProtocol.addLiquidity(amountToDeposit, { from: user1 });

        // User1 withdraws collateral tokens
        await lendingProtocol.withdraw(amountToWithdraw, { from: user1 });

        // Check liquidity in the lending protocol after withdrawal
        const liquidity = await lendingProtocol.getLiquidity();
        assert.strictEqual(liquidity.toString(), (amountToDeposit - amountToWithdraw).toString());

        // Check user1's balance in the lending protocol after withdrawal
        const user1Balance = await lendingProtocol.getBalance(user1);
        assert.strictEqual(user1Balance.toString(), (amountToDeposit - amountToWithdraw).toString());
    });
});