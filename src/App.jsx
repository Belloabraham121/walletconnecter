import { useEffect, useState } from "react";
import useWalletConnect from "./hooks/useWalletConnect";

const WalletConnect = () => {
  const {
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
  } = useWalletConnect();

  const [networkName, setNetworkName] = useState("Unknown Network");

  useEffect(() => {
    const updateNetworkName = async () => {
      if (window.ethereum && chainId) {
        try {
          const chainIdDecimal = parseInt(chainId, 16);
          const networkData = await window.ethereum.request({
            method: 'eth_chainId',
            params: [chainIdDecimal],
          });
          setNetworkName(networkData.networkName || `Chain ID: ${chainIdDecimal}`);
        } catch (error) {
          console.error("Failed to get network name:", error);
          setNetworkName(`Chain ID: ${parseInt(chainId, 16)}`);
        }
      } else {
        setNetworkName("Unknown Network");
      }
    };

    updateNetworkName();
  }, [chainId]);

 
  useEffect(() => {
    if (account) {
      setAddressInput(account);
    }
  }, [account, setAddressInput]);

  const handleAddressChange = (e) => {
    setAddressInput(e.target.value);
  };

  const handleCheckBalance = () => {
    if (addressInput) {
      getBalance(addressInput);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 p-4">
      <div className="max-w-md w-full bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-white drop-shadow-lg">Wallet Connect</h2>
        
        {error && (
          <div className="bg-red-100/60 border-l-4 border-red-500 text-red-700 p-4 rounded-lg backdrop-blur-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        <div className="space-y-6">
          {isConnected ? (
            <>
              <div className="bg-blue-100/20 p-4 rounded-lg backdrop-blur-sm shadow-inner">
                <p className="text-sm text-white font-medium">Connected Account</p>
                <p className="font-mono text-white break-all">{account}</p>
              </div>
              
              <div className="bg-green-100/20 p-4 rounded-lg backdrop-blur-sm shadow-inner">
                <p className="text-sm text-white font-medium">Network</p>
                <p className="font-semibold text-white">{networkName}</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="address" className="block text-sm font-medium text-white">
                  Check Balance
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="address"
                    value={addressInput}
                    onChange={handleAddressChange}
                    placeholder="Enter Ethereum address"
                    className="flex-grow px-4 py-2 placeholder-gray-300 bg-white/20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition duration-200 backdrop-blur-lg"
                  />
                  <button
                    onClick={handleCheckBalance}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 shadow-md hover:shadow-lg"
                  >
                    Check
                  </button>
                </div>
              </div>
              
              {balance !== null && (
                <div className="bg-purple-100/20 p-4 rounded-lg backdrop-blur-sm shadow-inner">
                  <p className="text-sm text-white font-medium">Balance</p>
                  <p className="font-semibold text-white">{balance} ETH</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-white italic">No wallet connected</p>
          )}
        </div>
        
        <button
          onClick={isConnected ? disconnectWallet : connectWallet}
          className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white ${
            isConnected
              ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg`}
        >
          {isConnected ? "Disconnect Wallet" : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
};

export default WalletConnect;
