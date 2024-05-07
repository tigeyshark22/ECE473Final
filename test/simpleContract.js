const SimpleContract = artifacts.require("SimpleContract");

contract("SimpleContract", (accounts) => {
    let simpleContractInstance;
    const initialTestString = "Initial Test";
    const newTestString = "New Test String";

    beforeEach(async () => {
        simpleContractInstance = await SimpleContract.new(initialTestString);
    });

    it("should set and get the test string correctly", async () => {
        // Get the initial test string
        const initialTest = await simpleContractInstance.getTest();
        assert.equal(initialTest, initialTestString, "Initial test string not set correctly");

        // Set a new test string
        await simpleContractInstance.setTest(newTestString);

        // Get the new test string
        const retrievedTest = await simpleContractInstance.getTest();
        assert.equal(retrievedTest, newTestString, "New test string not set correctly");
    });
});