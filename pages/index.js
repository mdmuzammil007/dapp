import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
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
        let tx = await atm.deposit(20, password);
        await tx.wait();
        const txReceipt = await tx.wait();
        setSuccessMessage(`Deposit successful! Transaction hash: ${txReceipt.transactionHash}`);
        getBalance();
      } catch (error) {
        setErrorMessage(`Deposit error: ${error.message}`);
        console.error("Deposit error:", error.message);
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        let tx = await atm.withdraw(20, password);
        await tx.wait();
        const txReceipt = await tx.wait();
        setSuccessMessage(`Withdrawal successful! Transaction hash: ${txReceipt.transactionHash}`);
        getBalance();
      } catch (error) {
        setErrorMessage(`Withdrawal error: ${error.message}`);
        console.error("Withdrawal error:", error.message);
      }
    }
  };

  const doubleBalance = async () => {
    if (atm) {
      try {
        let tx = await atm.doubleBalance(password);
        await tx.wait();
        const txReceipt = await tx.wait();
        setSuccessMessage(`Double balance successful! Transaction hash: ${txReceipt.transactionHash}`);
        getBalance();
      } catch (error) {
        setErrorMessage(`Double balance error: ${error.message}`);
        console.error("Double balance error:", error.message);
      }
    }
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
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

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <input type="password" placeholder="Enter password" value={password} onChange={handlePasswordChange} />
        <button onClick={deposit}>Deposit 20 ETH</button>
        <button onClick={withdraw}>Withdraw 20 ETH</button>
        <button onClick={doubleBalance}>Double Balance</button>
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container" style={{ backgroundColor: "brown" }}>
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
