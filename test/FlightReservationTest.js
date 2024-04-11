const FlightReservation = artifacts.require('FlightReservation');

contract("FlightReservation tests", async accounts => {
    let instance;
    const manager = accounts[0];
    const customer1 = accounts[1];
    const customer2 = accounts[2];
    const customer3 = accounts[3];

    const bookingPrice = web3.utils.toBN(10000000000); // Room price in wei

    // Initial setup before each test
    beforeEach(async () => {
        instance = await FlightReservation.new({ from: manager });
    });

    it("Test 1: test bookFlight", async () => {
        const initialAvailability = (await instance.flights()).availability;
        const initialReservations = await instance.numReservations();
        
        // Perform booking
        await instance.bookFlight({ value: bookingPrice, from: customer1 });

        // Check availability has decreased
        const newAvailability = (await instance.flights()).availability;
        assert.equal(newAvailability, initialAvailability - 1);

        // Check the number of reservations has increased
        const newReservations = await instance.numReservations();
        assert.equal(newReservations, initialReservations + 1);
    });

    it("Test 2: test resetState", async () => {
        const newPrice = 20000000000; // New price in wei
        const newAvailability = 20;

        // Reset state as manager
        await instance.resetState(newPrice, newAvailability, { from: manager });

        // Check the price and availability have been updated
        const updatedFlights = await instance.flights();
        assert.equal(updatedFlights.price, newPrice);
        assert.equal(updatedFlights.availability, newAvailability);
    });

    it("Test 3: test blockSeats", async () => {
        const seatsToBlock = 5;
        const flightsBefore = await instance.flights();

        // Block seats as manager
        await instance.blockSeats(seatsToBlock, { from: manager });

        // Check the availability has decreased accordingly
        const updatedFlights = await instance.flights();
        assert.equal(updatedFlights.availability, flightsBefore.availability - seatsToBlock); // Assuming resetState was called before

        // Attempt to block more seats than available and check for error
        try {
            await instance.blockSeats(100, { from: manager });
            assert.fail("Should not be able to block more seats than available");
        } catch (err) {
            assert(err.message.includes("Can't block more seats than available"));
        }
    });

    it("Test 4: test checkReservations", async () => {
        // Book a flight first
        const bookingPrice = (await instance.flights()).price;
        await instance.bookFlight({ value: bookingPrice, from: customer2 });

        // Check if reservation exists
        const reservationExists = await instance.checkReservations(customer2);
        assert.isTrue(reservationExists, "Reservation should exist for account 2");

        // Check for an account that hasn't made a reservation
        const noReservation = await instance.checkReservations(customer3);
        assert.isFalse(noReservation, "Reservation should not exist for account 3");
    });

    it("Test 5: test transferEarningsToManager", async () => {
        const initialManagerBalance = await web3.eth.getBalance(manager);

        // Transfer earnings to the manager
        await instance.transferEarningsToManager({ from: manager });

        // Check the manager's balance has increased
        const newManagerBalance = await web3.eth.getBalance(manager);
        assert.isAbove(parseInt(newManagerBalance), parseInt(initialManagerBalance));
    });
});