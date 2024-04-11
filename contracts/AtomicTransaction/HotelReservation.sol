// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract HotelReservation {
    
    struct Listing{
        uint256 availability;
        uint256 price; //Price in ETH
    }

    address payable public manager;
    Listing public rooms;
    mapping(uint=>mapping(address=>bool)) public reservations;
    uint public numReservations;
    uint public saleIteration;
    

    constructor() {
        manager = payable(msg.sender);
        rooms.availability = 40;
        rooms.price = 10000000000; // 10**-8 ETH
        saleIteration = 1;
        numReservations=0;
    }

    function bookRoom() payable external {
        require(msg.value >= rooms.price, "Incorrect price sent");
        require(rooms.availability > 0, "No rooms available");
        require(!reservations[saleIteration][msg.sender], "Room already booked in this iteration");

        // Update reservations and room availability
        reservations[saleIteration][msg.sender] = true;
        rooms.availability -= 1;
        numReservations += 1;
    }

    function resetState(uint newPrice, uint newAvailability) external {
        require(msg.sender == manager, "Only the manager can reset state");

        rooms.price = newPrice;
        rooms.availability = newAvailability;
        saleIteration += 1;
    }

    function blockRooms(uint numRooms) external {
        require(msg.sender == manager, "Only the manager can block rooms");
        require(numRooms <= rooms.availability, "Not enough rooms available");

        // Block rooms
        rooms.availability -= numRooms;
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