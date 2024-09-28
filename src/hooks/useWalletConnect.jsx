import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const useWalletConnect = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);
  const [addressInput, setAddressInput] = useState("");
  const [balance, setBalance] = useState(null);

  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setChainId(await window.ethereum.request({ method: "eth_chainId" }));
        }
      } catch (err) {
        console.error("⚠️ Failed to get accounts", err);
      }
    }
  }, []);

  const handleAccountsChange = useCallback((accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setError(null);
    } else {
      setAccount(null);
      setError("Please connect to MetaMask.");
    }
  }, []);

  const handleChainChanged = useCallback((chainId) => {
    setChainId(chainId);
    setBalance(null); // Reset balance when chain changes
  }, []);

  useEffect(() => {
    checkConnection();
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleAccountsChange);
      window.ethereum.on("chainChanged", handleChainChanged);
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChange);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [checkConnection, handleAccountsChange, handleChainChanged]);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        setAccount(accounts[0]);
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        setChainId(chainId);
        setError(null);
      } catch (err) {
        if (err.code === 4001) {
          setError("Please connect to MetaMask.");
        } else {
          setError("Failed to connect wallet: " + err.message);
        }
      }
    } else {
      setError("⚠️ Please install MetaMask!");
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setError(null);
    setBalance(null);
  }, []);

  const isConnected =  !!account;

  const getBalance = useCallback(async (address) => {
    if (typeof window.ethereum !== "undefined" && ethers.isAddress(address)) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(address);
        setBalance(ethers.formatEther(balance));
        setError(null);
      } catch (err) {
        setError("Failed to fetch balance: " + err.message);
        setBalance(null);
      }
    } else if (!ethers.isAddress(address)) {
      setError("Invalid Ethereum address.");
      setBalance(null);
    }
  }, []);

  return {
    account,
    chainId,
    error,
    isConnected,
    addressInput,
    setAddressInput,
    balance,
    connectWallet,
    disconnectWallet,
    getBalance,
  };
};

export default useWalletConnect;
