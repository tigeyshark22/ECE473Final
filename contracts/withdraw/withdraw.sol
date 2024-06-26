//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
// import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract withdraw {
	// State Variables
	address public immutable owner;
	string public greeting = "Building Unstoppable Apps!!!";
	bool public premium = false;
	uint256 public totalCounter = 0;
	mapping(address => uint) public userGreetingCounter;

	// Events: a way to emit log statements from smart contract that can be listened to by external parties
	event GreetingChange(
		address indexed greetingSetter,
		string newGreeting,
		bool premium,
		uint256 value
	);

	// Constructor: Called once on contract deployment
	// Check packages/hardhat/deploy/00_deploy_your_contract.ts
	constructor(address _owner) {
		owner = _owner;
	}

	// Modifier: used to define a set of rules that must be met before or after a function is executed
	// Check the withdraw() function
	modifier isOwner() {
		// msg.sender: predefined variable that represents address of the account that called the current function
		require(msg.sender == owner, "Not the Owner");
		_;
	}

	/**
	* Function that allows the owner to withdraw all the Ether in the contract
	* The function can only be called by the owner of the contract as defined by the isOwner modifier
	*/
	function withdrawEther() public isOwner {
		// Cast owner address to payable address
		address payable ownerPayable = payable(owner);

		// Get the contract's current balance
		uint256 contractBalance = address(this).balance;

		// Ensure there are funds to withdraw
		require(contractBalance > 0, "Contract has no balance to withdraw");

		// Transfer all Ether held by the contract to the owner
		ownerPayable.transfer(contractBalance);

    // Optionally, emit an event or add a statement for logging purposes
	}
	/**
	 * Function that allows the contract to receive ETH
	 */
	receive() external payable {}
}
