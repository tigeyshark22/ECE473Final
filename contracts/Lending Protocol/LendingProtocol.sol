// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the ERC20 interface from OpenZeppelin contracts to interact with the collateral token
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LendingProtocol {
    // Store the amount of collateral tokens held by the contract
    uint256 public liquidity;

    // The ratio of collateral tokens required per lending token borrowed
    uint256 public collateralRatio;

    // The address of the collateral token contract
    address public collateralToken;

    // The address of the owner of the contract
    address public owner;
    IERC20 token; //instantiates the imported contract
    mapping(address => uint256) borrow_amount;
    mapping(address => uint256) balance;
    event LiquidityAdded(address indexed depositor, uint256 amount);
    event Borrow(address indexed borrower, uint256 amount);
    event Repay(address indexed borrower, uint256 amount);
    event Withdrawal(address indexed owner, uint256 amount);

    // Constructor function, sets the collateral ratio and collateral token address
    constructor(uint256 _collateralRatio, address _collateralToken) {
        collateralRatio = _collateralRatio;
        collateralToken = _collateralToken;
        owner = msg.sender;
        token = IERC20(_collateralToken);
    }

    // Function to deposit collateral tokens into the contract
    function addLiquidity(uint256 _amount) public {
        require(_amount > 0, "Amount must be greater than 0");

        // Transfer collateral tokens from the sender to this contract
        require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        // Increase the liquidity tracked by the contract
        liquidity += _amount;

        // Update the balance of the user
        balance[msg.sender] += _amount;

        // Emit event for the added liquidity
        emit LiquidityAdded(msg.sender, _amount);
    }

    // Function to borrow lending tokens, using collateral tokens as collateral
    function borrow(uint256 _amount) public {
        require(_amount > 0, "Borrow amount must be greater than 0");

        // Calculate required collateral amount
        uint256 requiredCollateral = _amount * collateralRatio;
        require(token.balanceOf(address(this)) >= requiredCollateral, "Insufficient collateral");

        // Transfer lending tokens to the borrower
        token.transfer(msg.sender, _amount);

        // Update the borrowed amount and decrease liquidity
        borrow_amount[msg.sender] += _amount;
        liquidity -= requiredCollateral;

        // Emit event for the borrowing action
        emit Borrow(msg.sender, _amount);
    }

    function repay(uint256 _amount) public {
        require(_amount > 0, "Repay amount must be greater than 0");
        require(borrow_amount[msg.sender] >= _amount, "Exceeds borrowed amount");

        // Transfer lending tokens from the borrower back to the contract
        require(token.transferFrom(msg.sender, address(this), _amount), "Repayment failed");

        // Update the borrowed amount and increase liquidity
        borrow_amount[msg.sender] -= _amount;
        liquidity += (_amount * collateralRatio); // Increase liquidity by collateral equivalent

        // Emit event for the repayment action
        emit Repay(msg.sender, _amount);
    }

    // Function to withdraw collateral tokens from the contract
    function withdraw(uint256 _amount) public {
        require(msg.sender == owner, "Only owner can withdraw");
        require(_amount > 0 && _amount <= liquidity, "Invalid amount");

        // Transfer collateral tokens from the contract to the owner
        require(token.transfer(owner, _amount), "Withdrawal failed");

        // Decrease the liquidity tracked by the contract
        liquidity -= _amount;

        // Emit event for the withdrawal action
        emit Withdrawal(owner, _amount);
    }

    // Function to get the contract's liquidity
    function getLiquidity() public view returns (uint256) {
        return liquidity;
    }

    // Function to get the contract's collateral ratio
    function getCollateralRatio() public view returns (uint256) {
        return collateralRatio;
    }

    // Function to get the contract's collateral token
    function getCollateralToken() public view returns (address) {
        return collateralToken;
    }

    // Function to get the contract's owner
    function getOwner() public view returns (address) {
        return owner;
    }

    //funcation to borrow amount of user
    function getBorrowAmount(address _user) public view returns (uint256) {
        return borrow_amount[_user];
    }

    //funcation to get balance of liquidity provider
    function getBalance(address _user) public view returns (uint256) {
        return balance[_user];
    }
}
