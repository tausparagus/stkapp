// https://docs.metamask.io/guide/ethereum-provider.html#table-of-contents
// https://www.npmjs.com/package/@metamask/detect-provider

var metamask = (function () {
  'use strict';
  
  const chainId_hardhat = 31337;
  const chainId_testEvmos = 9000;
  const chainId_Evmos = 9001;
  const errChainStr = "Not connected - please switch to Hardhat/Evmos test chain";
  const alertChainStr = "Currently supporting only hardhat/Evmos test";

  var publicMetamask = {};

  let currentAccount = null;
  let curChainId = chainId_hardhat;

  publicMetamask.onLoad = function () {
    detectMetamask();
    gui.onLoad();
  }

  let detectMetamask = async function () {
    const provider = await detectEthereumProvider();
    if (provider !== window.ethereum) {
      gui.showError('Do you have multiple wallets installed?');
      gui.showAlert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
      
      return;
    }

    ethereum.request({ method: 'eth_chainId' })
    .then(handleChainChanged)
    .catch((err) => {gui.showError(err); } );

    ethereum.on('chainChanged', handleChainChanged);
    ethereum.on('accountsChanged', handleAccountsChanged);
    gui.showLog("detectMetamask " + currentAccount);
  }


  /**********************************************************/
  /* Handle chain (network) and chainChanged (per EIP-1193) */
  /**********************************************************/

  function isChainSupported(cid) {
    if (cid == chainId_testEvmos)
    {
      return true;
    }
    if (cid == chainId_Evmos)
    {
      return true;
    }
    if (cid == chainId_hardhat)
    {
      return true;
    }
    return false;
  }

  function handleChainChanged(_chainId) {
    // We recommend reloading the page, unless you must do otherwise
    //window.location.reload();
    gui.showLog("handleChainChanged: " + _chainId);
    
    let cid = parseInt(_chainId, 16);
    let cname = "";   if (_chainId == "0x7a69") cname = " Hardhat Node"; // 31337
    if (_chainId == chainId_testEvmos) cname = " Evmos Test Chain"; 
    if (_chainId == chainId_Evmos) cname = " Evmos Chain"; 
    
    
    gui.showStatus("Detected Metamask chainID = " + cid + cname);

    if (!isChainSupported(cid)) {
      alert(alertChainStr);
      gui.showStatus(errChainStr);
      app.disconnect();
    }

    else {
      app.connectContract(true);
    }
    curChainId = cid;
  }

  /***********************************************************/
  /* Handle user accounts and accountsChanged (per EIP-1193) */
  /***********************************************************/

  function handleAccountsChanged(accounts) {

    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      currentAccount = undefined;
      gui.showLog('Please connect to MetaMask.');
      gui.showStatus("Disconnected");
      app.disconnect();
    } else if (accounts[0] !== currentAccount) {
      currentAccount = accounts[0];
      gui.showLog("Connected to Metamask = " + currentAccount);
      gui.showStatus("Connected to Metamask = " + currentAccount);
      app.connectContract(true); 
    }
    gui.showLog("handleAccountsChanged: " + currentAccount);
  }

  /*********************************************/
  /* Access the user's accounts (per EIP-1102) */
  /*********************************************/

  // You should only attempt to request the user's accounts in response to user
  // interaction, such as a button click.
  // Otherwise, you popup-spam the user like it's 1999.
  // If you fail to retrieve the user's account(s), you should encourage the user
  // to initiate the attempt.

  // While you are awaiting the call to eth_requestAccounts, you should disable
  // any buttons the user can click to initiate the request.
  // MetaMask will reject any additional requests while the first is still
  // pending.
  publicMetamask.connectMetamask = function () {
    if (!isChainSupported(curChainId)) {
      alert(alertChainStr);
      gui.showStatus(errChainStr);
      return;
    }

    ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          gui.showLog('Please connect to MetaMask.');
          gui.showStatus("Please connect to MetaMask");
          app.disconnect();
        } else {
          gui.showError(err);
        }
      });
  }

  return publicMetamask;

})();