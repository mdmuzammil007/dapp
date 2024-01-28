// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    bool public accountClosed;
    string public accountDetails; // Store account details as a string

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event AccountClosed(bool closed);
    event AccountReopened(bool reopened);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        accountClosed = false;
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner of this account");
        _;
    }

    function deposit(uint256 _amount) public payable onlyOwner {
        require(!accountClosed, "Account is closed");
        uint _previousBalance = balance;

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public onlyOwner {
        require(!accountClosed, "Account is closed");
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

    function closeAccount() public onlyOwner {
        accountClosed = true;
        emit AccountClosed(true);
    }

    function reopenAccount() public onlyOwner {
        accountClosed = false;
        emit AccountReopened(true);
    }

    function fetchBalance() public view returns (uint256) {
        return balance;
    }

    // Function to set account details and generate QR code
    function setAccountDetails(
        string memory _name,
        string memory _education,
        string memory _accountOpenedDate,
        string memory _panNumber,
        string memory _swiftCode,
        string memory _customerId,
        string memory _crn
    ) public onlyOwner {
        accountDetails = string(
            abi.encodePacked(
                "Name: ", _name, "\n",
                "Education: ", _education, "\n",
                "Account Opened Date: ", _accountOpenedDate, "\n",
                "PAN Number: ", _panNumber, "\n",
                "Swift Code: ", _swiftCode, "\n",
                "Customer ID: ", _customerId, "\n",
                "CRN: ", _crn
            )
        );
    }

    // Function to get the stored account details
    function getAccountDetails() public view returns (string memory) {
        return accountDetails;
    }
}
