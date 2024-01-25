// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event TaxPaid(uint256 amount);

    constructor(uint256 initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint256 _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;
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

    function checkPassword(string memory _password) public pure returns (bool) {
        return keccak256(abi.encodePacked(_password)) == keccak256(abi.encodePacked("abcd"));
    }

    // Function to calculate and pay taxes
    function payTaxes() public {
        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // calculate tax as 10% of the current balance
        uint256 taxAmount = (balance * 10) / 100;

        // subtract tax from the balance
        balance -= taxAmount;

        // emit the event
        emit TaxPaid(taxAmount);
    }

    // Function to get the tax amount without actually paying it
    function getTaxAmount() public view returns (uint256) {
        // calculate tax as 10% of the current balance
        return (balance * 10) / 100;
    }

    // Function for auditing purposes to retrieve relevant contract details
    function auditContract() public view returns (address, uint256) {
        return (owner, balance);
    }
}
