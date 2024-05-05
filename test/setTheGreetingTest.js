const setTheGreeting = artifacts.require("setTheGreeting");

contract("setTheGreeting", (accounts) => {
    let contractInstance;
    const owner = accounts[0];
    const nonOwner = accounts[1];

    beforeEach(async () => {
        contractInstance = await setTheGreeting.new(owner);
    });

    it("should allow changing the greeting by the owner", async () => {
        const newGreeting = "Hello, World!";

        // Call setGreeting function by the owner
        await contractInstance.setGreeting(newGreeting, { from: owner });

        // Check if the greeting was updated
        const updatedGreeting = await contractInstance.greeting();
        assert.strictEqual(updatedGreeting, newGreeting);

        // Check if totalCounter increased
        const totalCounter = await contractInstance.totalCounter();
        assert.strictEqual(totalCounter.toNumber(), 1);

        // Check if userGreetingCounter for owner increased
        const ownerCounter = await contractInstance.userGreetingCounter(owner);
        assert.strictEqual(ownerCounter.toNumber(), 1);
    });

    it("should emit GreetingChange event when greeting is updated", async () => {
        const newGreeting = "Hola, Mundo!";

        // Call setGreeting function by the owner
        const tx = await contractInstance.setGreeting(newGreeting, { from: owner });

        // Check if the event was emitted with correct parameters
        assert.strictEqual(tx.logs.length, 1);
        const event = tx.logs[0];
        assert.strictEqual(event.event, "GreetingChange");
        assert.strictEqual(event.args.greetingSetter, owner);
        assert.strictEqual(event.args.newGreeting, newGreeting);
        assert.strictEqual(event.args.premium, false); // Since no value was sent
    });

    it("should allow changing the greeting by a non-owner", async () => {
        const newGreeting = "Bonjour, le Monde!";

        // Call setGreeting function by a non-owner
        await contractInstance.setGreeting(newGreeting, { from: nonOwner });

        // Check if the greeting was updated
        const updatedGreeting = await contractInstance.greeting();
        assert.strictEqual(updatedGreeting, newGreeting);

        // Check if totalCounter increased
        const totalCounter = await contractInstance.totalCounter();
        assert.strictEqual(totalCounter.toNumber(), 1);

        // Check if userGreetingCounter for non-owner increased
        const nonOwnerCounter = await contractInstance.userGreetingCounter(nonOwner);
        assert.strictEqual(nonOwnerCounter.toNumber(), 1);

        // Check if premium status is false (since no value was sent)
        const isPremium = await contractInstance.premium();
        assert.strictEqual(isPremium, false);
    });
});