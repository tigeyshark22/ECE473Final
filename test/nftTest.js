const BENCHMARK = artifacts.require("TigerNFT");
const GPT = artifacts.require("TigerNFTGPT");

contract("TigerNFT", async accounts => {
    let tigerNFTInstance;

    const owner = accounts[0];
    const user = accounts[1];

    beforeEach(async () => {
        tigerNFTInstance = await GPT.new({ from: owner });
    });

    it("Test 1: Test Minting", async () => {
        const inputString = "Test NFT";
        const id = 1;

        await tigerNFTInstance.mint(inputString, user, { from: owner });

        const retrievedString = await tigerNFTInstance.retrieve(id);
        assert.equal(retrievedString, inputString, "String associated with NFT ID should match the input string");

        const isOwner = await tigerNFTInstance.verify(user, id);
        assert.isTrue(isOwner, "User should be the owner of the NFT");
    });

    it("Test 2: Test Ownership", async () => {
        const inputString = "Another Test NFT";
        const id = 2;

        await tigerNFTInstance.mint(inputString, user, { from: owner });
        await tigerNFTInstance.mint(inputString, owner, { from: owner });

        const isOwner = await tigerNFTInstance.verify(owner, id);
        assert.isTrue(isOwner, "Owner should be the owner of the NFT");
    });

    it("Test 3: Test Permissions", async () => {
        const inputString = "Test NFT 3"
        try {
            await tigerNFTInstance.mint(inputString, user, { from: user });
            assert.fail("User should not be able to mint");
        } catch {
            
        }
        
    })
});