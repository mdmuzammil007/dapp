import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [password, setPassword] = useState("abcd"); // Set initial password to "abcd"
  const [transactionStatus, setTransactionStatus] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        setTransactionStatus("Transaction in progress...");
        const tx = await atm.deposit(1, { value: ethers.utils.parseEther("0.1") });
        await tx.wait();
        setTransactionStatus("Transaction successful! Transaction fee: 0.1 ETH");
        getBalance();
      } catch (error) {
        console.error(error);
        setTransactionStatus("Transaction failed");
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        setTransactionStatus("Transaction in progress...");
        const tx = await atm.withdraw(1, { gasPrice: ethers.utils.parseEther("0.1") });
        await tx.wait();
        setTransactionStatus("Transaction successful! Transaction fee: 0.1 ETH");
        getBalance();
      } catch (error) {
        console.error(error);
        setTransactionStatus("Transaction failed");
      }
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    const clearPassword = () => {
      setPassword("");
    };

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <div>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            readOnly // Make the input read-only
          />
          <button onClick={clearPassword}>Clear Password</button> {/* Add clear password button */}
          <div className="keyboard">
            {/* Digital keyboard buttons */}
            {[...Array(10).keys()].map((num) => (
              <button key={num} onClick={() => setPassword((prev) => prev + num)}>
                {num}
              </button>
            ))}
            {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"].map((char) => (
              <button key={char} onClick={() => setPassword((prev) => prev + char)}>
                {char}
              </button>
            ))}
            <button onClick={() => setPassword((prev) => prev.slice(0, -1))}>
              {"<-"}
            </button>
          </div>
        </div>
        <div className="transaction-status">{transactionStatus}</div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: purple; /* Purple background */
          color: white; /* Text color */
        }
        .keyboard {
          margin-top: 10px;
        }
        .keyboard button {
          margin: 5px;
          padding: 5px 10px;
          cursor: pointer;
        }
        .transaction-status {
          margin-top: 10px;
        }
      `}</style>
    </main>
  );
}
