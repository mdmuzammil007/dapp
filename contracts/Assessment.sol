// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    string private password = "meta"; // Set password to "meta"

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event BalanceDoubled(uint256 newBalance);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function setPassword(string memory _newPassword) public {
        require(msg.sender == owner, "Only owner can set password");
        password = _newPassword;
    }

    function deposit(uint256 _amount, string memory _enteredPassword) public payable {
        require(keccak256(abi.encodePacked(_enteredPassword)) == keccak256(abi.encodePacked(password)), "Invalid password");
        uint _previousBalance = balance;

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    function doubleBalance(string memory _enteredPassword) public {
        require(keccak256(abi.encodePacked(_enteredPassword)) == keccak256(abi.encodePacked(password)), "Invalid password");

        // double the balance
        balance *= 2;

        // emit the event
        emit BalanceDoubled(balance);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount, string memory _enteredPassword) public {
        require(keccak256(abi.encodePacked(_enteredPassword)) == keccak256(abi.encodePacked(password)), "Invalid password");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }
}
