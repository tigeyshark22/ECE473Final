const HotelReservation = artifacts.require("HotelReservation");

contract("HotelReservationTest", async accounts => {
    let instance;
    const manager = accounts[0];
    const customer1 = accounts[1];
    const customer2 = accounts[2];
    const roomPrice = web3.utils.toBN(10000000000); // Room price in wei

    beforeEach (async () => {
        instance = await HotelReservation.new({ from: manager });
    });

    it("Test 1: bookRoom", async () => {
        // First customer books a room
        await instance.bookRoom({from: customer1, value: roomPrice});
        let customer1Reservation = await instance.checkReservations(customer1);
        let availabilityAfterBooking = await instance.rooms.call();

        assert.equal(customer1Reservation, true, "Customer1 should have a reservation");
        assert.equal(availabilityAfterBooking.availability.toNumber(), 39, "Availability should decrease by 1");
    });

    it("Test 2: resetState", async () => {
        // Manager resets state
        await instance.resetState(20000000000, 40, {from: manager}); // New price and reset availability
        let updatedRoomInfo = await instance.rooms.call();
        assert.equal(updatedRoomInfo.price, 20000000000, "Room price should be updated");
        assert.equal(updatedRoomInfo.availability, 40, "Availability should be reset to 40");

        // Ensure saleIteration incremented
        let saleIteration = await instance.saleIteration.call();
        assert.equal(saleIteration.toNumber(), 2, "Sale iteration should be incremented");
    });

    it("Test 3: blockRooms", async () => {
        // Manager blocks some rooms
        await instance.blockRooms(5, {from: manager});
        let availabilityAfterBlocking = (await instance.rooms.call()).availability.toNumber();
        assert.equal(availabilityAfterBlocking, 35, "Blocking 5 rooms should leave 35 available");

        // Attempt to block more rooms than available
        try {
            await instance.blockRooms(36, {from: manager});
            assert.fail("Should not be able to block more rooms than available");
        } catch (error) {
            assert.include(error.message, "revert", "Expected revert not received");
        }
    });

    it("Test 4: checkReservations", async () => {
        // Check reservations for both customers post-reset
        let customer1ReservationAfterReset = await instance.checkReservations(customer1);
        let customer2ReservationAfterReset = await instance.checkReservations(customer2);
        assert.equal(customer1ReservationAfterReset, false, "Customer1 should not have a reservation after reset");
        assert.equal(customer2ReservationAfterReset, false, "Customer2 should not have a reservation after reset");
    });

    it("Test 5: transferEarningsToManager", async () => {
        // Assuming the contract has balance from previous bookings
        const initialManagerBalance = web3.utils.toBN(await web3.eth.getBalance(manager));
        await instance.transferEarningsToManager({from: manager});
        const finalManagerBalance = web3.utils.toBN(await web3.eth.getBalance(manager));
        
        // Ensure manager's balance has increased
        assert(finalManagerBalance.gt(initialManagerBalance), "Manager's balance should have increased");

        // Check contract balance is 0
        const contractBalance = await web3.eth.getBalance(instance.address);
        assert.equal(contractBalance, 0, "Contract balance should be 0 after transfer");
    });
});