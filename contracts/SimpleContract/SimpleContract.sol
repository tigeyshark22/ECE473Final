// SPDX-License-Identifier: GPL-3.0
pragma solidity>=0.7.0 <0.9.0;

contract simpleContract{
	string test;

	constructor(string memory _init) {
		test = _init;
	}
	function setTest(string memory _newTest) public {
		test = _newTest;
	}
	function getTest() public view returns(string memory){
		return test;
	}
}