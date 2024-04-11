const AtomicTripReservation = artifacts.require('AtomicTripReservation');
const HotelReservation = artifacts.require('HotelReservation'); 
const FlightReservation = artifacts.require('FlightReservation');

contract("AtomicTripReservation tests", async accounts => {
    const manager = accounts[0];
    const customer = accounts[1];
    
    let atomicTrip;
    let hotel;
    let flight;

    // Initial setup before each test
    beforeEach(async () => {
        atomicTrip = await AtomicTripReservation.new({ from: manager });
        hotel = await HotelReservation.new({ from: manager });
        flight = await FlightReservation.new({ from: manager });

        hotel.rooms.price = web3.utils.toWei('0.01', 'ether');
        flight.flights.price = web3.utils.toWei('0.01', 'ether');
    });

    it("Test 1: bookTrip with sufficient funds", async () => {
        // Define the prices for the hotel and flight
        hotelPrice = hotel.rooms.price;
        flightPrice = flight.flights.price;
        const totalCost = web3.utils.toWei('0.02', 'ether'); // Total cost for hotel and flight
        
        // Perform the atomic transaction
        await atomicTrip.bookTrip(hotel.address, flight.address, hotelPrice, flightPrice, { from: customer, value: totalCost * 2 });

        // Check if the room and flight were booked successfully
        const hotelReserved = await hotel.checkReservations(customer);
        assert.equal(hotelReserved, true, "Hotel room should be reserved");

        const flightReserved = await flight.checkReservations(customer);
        assert.equal(flightReserved, true, "Flight should be reserved");

        // Check the remaining balance on the contract
        const remainingBalance = await web3.eth.getBalance(atomicTrip.address);
        assert.equal(remainingBalance, 0, "Contract balance should be zero after booking trip");

        // Check if the refund was transferred back to the user
        const initialBalance = await web3.eth.getBalance(customer);
        const finalBalance = await web3.eth.getBalance(customer);
        assert(finalBalance > initialBalance, "Refund should be transferred back to the user");
    });

    it("Test 2: test bookTrip with less funds than needed", async () => {
        hotelPrice = hotel.rooms.price;
        flightPrice = flight.flights.price;
        const totalPrice = hotelPrice + flightPrice;
    
        // Calculate a value that is less than the total price
        const insufficientFunds = totalPrice / 2;
    
        // Try to perform the booking with insufficient funds
        try {
            await atomicTrip.bookTrip(hotel.address, flight.address, hotelPrice, flightPrice, { value: insufficientFunds, from: customer });
            // If the function call does not revert, fail the test
            assert.fail("Expected transaction to revert due to insufficient funds");
        } catch (error) {
            // Ensure the error is due to the expected reason
            assert.include(error.message, "revert", "Transaction reverted as expected due to insufficient funds");
        }
    
        // Verify that there is no reservation in both hotel and flight for the user
        const hotelReservationExists = await hotel.checkReservations(customer);
        const flightReservationExists = await flight.checkReservations(customer);
    
        assert.isFalse(hotelReservationExists, "User should not have a hotel reservation due to insufficient funds");
        assert.isFalse(flightReservationExists, "User should not have a flight reservation due to insufficient funds");
    });
});