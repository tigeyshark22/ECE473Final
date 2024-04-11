// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IHotelReservation{
    function bookRoom() payable external;
}

interface IFlightReservation{
    function bookFlight() payable external;
}

contract AtomicTripReservation{
    function bookTrip(
    address hotelReservationAddress, 
    address flightReservationAddress, 
    uint256 hotelPrice, 
    uint256 flightPrice) payable external {
    // Calculate total price
    uint256 totalPrice = hotelPrice + flightPrice;
    
    // Ensure enough value is sent with the transaction
    require(msg.value >= totalPrice, "Insufficient ETH sent");

    // Initialize the hotel and flight reservation contracts
    IHotelReservation hotelReservation = IHotelReservation(hotelReservationAddress);
    IFlightReservation flightReservation = IFlightReservation(flightReservationAddress);
    
    // Book the hotel room
    hotelReservation.bookRoom{value: hotelPrice}();
    
    // Book the flight
    flightReservation.bookFlight{value: flightPrice}();
    
    // Refund any remaining ETH
    if (msg.value > totalPrice) {
        // Calculate the refund amount
        uint256 refundAmount = msg.value - totalPrice;
        // Send the refund to the sender
        payable(msg.sender).transfer(refundAmount);
    }
}

}