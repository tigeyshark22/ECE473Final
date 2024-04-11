// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract FlightReservation {
    
    struct Listing{
        uint256 availability;
        uint256 price; //Price in ETH
    }

    address payable public manager;
    Listing public flights;
    mapping(uint=>mapping(address=>bool)) public reservations;
    uint public numReservations;
    uint public saleIteration;
    

    constructor() {
        manager = payable(msg.sender);
        flights.availability = 40;
        flights.price = 10000000000; // 10**-8 ETH
        saleIteration = 1;
        numReservations=0;
    }

    function bookFlight() payable external {
        require(
            msg.value >= flights.price,
            "Please pay full price"
        );
        require(flights.availability > 0, "No seats available");
        require(!reservations[saleIteration][msg.sender], "Flight already booked in this iteration");

        // Update reservations and seat availability
        reservations[saleIteration][msg.sender] = true;
        flights.availability -= 1;
        numReservations += 1;
    }

    function resetState(uint newPrice, uint newAvailability) external {
        require(msg.sender == manager, "Only the manager can reset state");

        flights.price = newPrice;
        flights.availability = newAvailability;
        saleIteration += 1;
    }

    function blockSeats(uint numSeats) external {
        require(msg.sender == manager, "Only the manager can block seats");
        require(numSeats <= flights.availability, "Not enough seats available");

        // Block seats
        flights.availability -= numSeats;
    }

    function checkReservations(address customerAddress) external view returns (bool) {
        return reservations[saleIteration][customerAddress];
    }

    function transferEarningsToManager() external {
        require(msg.sender == manager, "Only the manager can transfer earnings");

        uint amount = address(this).balance;
        manager.transfer(amount);
    }

}