const isEvmosTest = true;
var stkAppContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
var simpleStakeContractAddress = "";
//var stkAppContractAddress_testEvmos = "0xC9D11Dd172368b08192648EEe808DE72A20575CE";  
var stkAppContractAddress_testEvmos = "0x3F3b706407bB2d51312475D1d24e801fF70405BE";   // debug active
var simpleStakeContractAddress_testEvmos = "0xE28bC3660Bcfba56c0182487bF45F495Fe8A7d30";
var merit_price = 1;

const Merit = {
    CUSTOM: 0, M1: 1, M2: 2, M3: 3
}
var app = (function () {

	'use strict';

	var publicApp = {};

	var stakeContract;
	var simpleStakeContract;

	var isconnected = false;
	var userAccount;

	var ownedMeritCount = 0;
	var showingMeritInd = 0;
	var showingMeritStat = undefined;
	var showingMeritTokenId = -1;

	function displayAccounts(web3, accs) {
		$("#accounts").empty();
		let cnt = 0; let balance = 0;
		for (ac of accs) {
			web3.eth.getBalance(ac).then(bal => {
				balance = bal / 1E+18;
				$("#accounts").append(`<div class="account">
				<ul>
				<li>${cnt}: ${ac} - ${balance} ETH</li>
				</ul>
			</div>`);	
			cnt ++;	
			});	
		}
	}

	function displayAccount(web3, ac) {
		gui.showLog("display account");
		$("#accounts").empty();
		let cnt = 0; let balance = 0;
		web3.eth.getBalance(ac).then(bal => {
			balance = bal / 1E+18;
			$("#accounts").append(`<div class="account">
			<ul>
			<li> Metmask account: ${ac} - ${balance} ETH</li>
			</ul>
		</div>`);	
		cnt ++;	
		});	
	}

	publicApp.isContract = function () {
		checkIfContract(extensionStakeAddress).then(function (result) {		
			gui.showLog("isContract " + result);
		});
	}

	async function checkIfContract (address) {
		let res = await window.web3.eth.getCode(address)
		return res.length > 5
	}

	publicApp.disconnect = function () {
		isconnected = false;
		userAccount = undefined;
		gui.removeOperations();
		displayClaimableOpToken();
        displayOnlyMeritTokenBalance();
		gui.showPlayer("");
		gui.showHideConnect(true);
		gui.showStatus("");
        gui.showInfo("");
        gui.showTime("");
	}

	publicApp.openPageMain = function () {
		gui.showPageMain();
	}

	publicApp.openPageDefi = function () {
		gui.showPageDefi();
		displayOnlyMeritTokenBalance();
	}

	publicApp.openPageId = function () {
		gui.showPageId();
		displayOnlyMeritTokenBalance();
	}

	publicApp.openPageOwner = function () {
		gui.showPageOwner();
	}

	publicApp.openPageFeat = function () {
		gui.showPageFeat();
		displayMeritTokenBalance();
	}

	publicApp.connectContract = function (overwrite) {
		gui.showLog("connectContract: " + " overwrite = " + overwrite + " isconnected = " + isconnected);

		if (isEvmosTest) {
			stkAppContractAddress = stkAppContractAddress_testEvmos;
		}

		if (!overwrite && isconnected) {
			gui.showStatus("Already connected");	
			return;
		}
		isconnected = false;
		userAccount = undefined;

		//let web3 = new Web3('ws://127.0.0.1:8545'); 
		//let web3 = new Web3(Web3.givenProvider);
		if (!window.ethereum) {
			gui.showAlert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
			return;
		}
		window.web3 = new Web3(window.ethereum);
		//await window.ethereum.enable();
		stakeContract = new web3.eth.Contract(stakerABI, stkAppContractAddress);
		web3.eth.getAccounts().then(e => { 
			if (e.length != 0) {
				isconnected = true;
				userAccount = e[0];
				gui.showLog("A: " + userAccount);
				gui.showHideConnect(false);
				//displayAccount(web3, userAccount);
				gui.showPlayer(userAccount);
			}
		});

		gui.showPageMain();	

	}

	publicApp.ss_approveRequiredMethods = function () {
		if (!isconnected) {
			gui.showStatus("Not connected");
			return;
		}

		gui.showStatus("Approving");
		return simpleStakeContract.methods.approveRequiredMethods()
		.send({ from: userAccount })
		.on("receipt", function (receipt) {
			gui.showStatus("Approved");	
			gui.showError("");

		})
		.on("error", function (error) {
			gui.showError(error.message);
		});
	}

	publicApp.approveAll = function () {
		if (!isconnected) {
			gui.showStatus("Not connected");
			return;
		}

		gui.showStatus("Approving");
		return stakeContract.methods.approveAll()
		.send({ from: userAccount })
		.on("receipt", function (receipt) {
			gui.showStatus("Approved");	
			gui.showError("");

		})
		.on("error", function (error) {
			gui.showError(error.message);
		});
	}

	function getMeritPrice(meritId) {
		let mult = 1;
		switch(meritId) {
			case Merit.CUSTOM:
			  mult = 0;
			  break;
			case Merit.M1:
			  mult = 100;
			  break;
			case Merit.M2:
			  mult = 200;
			  break;
  		    case Merit.M3:
			  mult = 300;
			  break;
			default:
			  mult = 0;
			  break;
		}
		return merit_price * mult;
	}

	publicApp.buyMerit = function (meritId) {
		if (!isconnected) { gui.showStatus("Not connected"); return; }

		web3.eth.getBalance(userAccount).then(bal => {
			let balance = bal / 1E+18;
			let meritPrice = getMeritPrice(meritId);
			console.log("balance = ", balance, " meritPrice =  ", meritPrice);
			if (balance > meritPrice) {
				if (meritId == 0) {
					buyMeritCustom();
				}
				else 
				{
					buyDirectMerit(meritId, meritPrice * 1E+18);
				}
			}
			else {
				gui.showStatus("Not enough balance to buy merit");
			}

		});	
	}

	function buyDirectMerit(meritId, amountToSend) {
		if (!isconnected) { gui.showStatus("Not connected"); return; }

		gui.showLog("Buying merit");

		return stakeContract.methods.buyMeritStake(meritId)
		.send({ from: userAccount, value: amountToSend })
		.on("receipt", function (receipt) {
			//console.log(receipt);
			if (receipt.events.BuyMeritStake.returnValues.tokenId >= 0) {
				gui.showStatus("Bought merit");
				gui.showError("");
				//gui.showMeritData(meritId, 1, 0);
				displayMeritTokenBalance();
			}
		})
		.on("error", function (error) {
			gui.showError(error.message);
		});
	}

	function buyMeritCustom () {
		if (!isconnected) { gui.showStatus("Not connected"); return; }

		let buycnt = $("#opMeritQuantity").val();
		gui.showLog("Buy merit with amount = " + buycnt);
		/*
		buycnt = Math.floor(buycnt);
		$("#opMeritQuantity").val(buycnt);
		if (buycnt < 1) {
			gui.showStatus("Buy amount should be non-zero");
			return;
		}
		*/

		web3.eth.getBalance(userAccount).then(bal => {
			let balance = bal / 1E+18;
			let totval = buycnt * 1;
			console.log("balance = ", balance, " totval = ", totval);
			if (balance > totval) {
				buyDirectMerit(0, web3.utils.toWei(totval.toString(), 'ether'));
			}
			else {
				gui.showStatus("Not enough balance to buy custom merit");
			}
		});	
	}
	
	publicApp.stakeUnstake = function () {
		if (!isconnected) {
			gui.showStatus("Not connected");
			return;
		}

		if (ownedMeritCount == 0) return;
		if (showingMeritStat == undefined) return;
		if (showingMeritInd+1 > ownedMeritCount) {
			return;
		}
		if (showingMeritTokenId < 0) return;

		if (showingMeritStat.state == 2) {
			gui.showStatus("Staking");

			return stakeContract.methods.stakeMerit(showingMeritTokenId)
			.send({ from: userAccount})
			.on("receipt", function (receipt) {
				console.log(receipt);
				if (receipt.events.StakeMerit.returnValues.tokenId >= 0) {
					gui.showStatus("Staked");
					gui.showError("");
					getShowMeritStat(receipt.events.StakeMerit.returnValues.tokenId);
				}
			})
			.on("error", function (error) {
				gui.showError(error.message);
			});
		}
		else if (showingMeritStat.state == 1) {
			gui.showStatus("Unstaking");

			return stakeContract.methods.unstakeMerit(showingMeritTokenId)
			.send({ from: userAccount})
			.on("receipt", function (receipt) {
				console.log(receipt);
				if (receipt.events.UnstakeMerit.returnValues.tokenId >= 0) {
					gui.showStatus("Unstaked");
					gui.showError("");
					getShowMeritStat(receipt.events.UnstakeMerit.returnValues.tokenId);
				}
			})
			.on("error", function (error) {
				gui.showError(error.message);
			});
		}	
	}


	async function getMeritTokenBalance() {
		let balance = await stakeContract.methods.balanceOf(userAccount).call();
		return balance;
	}

	function displayOnlyMeritTokenBalance() {
		if (!isconnected) { gui.showStatus("Not connected"); return; }
		gui.showLog("Getting merittoken balance");

		getMeritTokenBalance().then(function (result) {		
			$("#currentMeritToken").text(result);
			gui.handlePageTicket(result);
			gui.handlePageDefi(result);
		});
	}

	function displayMeritTokenBalance() {
		if (!isconnected) { gui.showStatus("Not connected"); return; }
		gui.showLog("Getting merittoken balance");

		getMeritTokenBalance().then(function (result) {		
			ownedMeritCount = result;
			showingMeritInd = 0;
			showingMeritStat = undefined;
			showingMeritTokenId = -1;
			gui.showLog("getMeritTokenBalance " + ownedMeritCount);
			$("#currentMeritToken").text(result);
			displayMeritInfo(result);	
		});
	}

	publicApp.displayNextMeritInfo = function () {
		showingMeritInd += 1;
		gui.showStatus("");
        gui.showInfo("");
		displayMeritInfo(ownedMeritCount);
	}

	publicApp.displayPrevMeritInfo = function () {
		if (showingMeritInd == 0) {
			showingMeritInd = ownedMeritCount - 1;
		}
		else {
			showingMeritInd -= 1;
		}
		gui.showStatus("");
        gui.showInfo("");
		displayMeritInfo(ownedMeritCount);
	}

	function handleWithdrawButton(stat) {
		$(moWithdraw).prop('disabled', true);
		if (stat.state == 2) { 
			if (stat.actionTime == 0) {
				$(moWithdraw).prop('disabled', false); 
			}
			else {
				let dcont = new Date(stat.actionTime * 1000);
				console.log("contract date = ", dcont);
				let dnow = new Date();
				console.log("now date = ", dnow);
				if (dnow > dcont)
				{
					$(moWithdraw).prop('disabled', false); 
					console.log("now is greater than contract date");
				}
				else {
					$(moWithdraw).prop('disabled', true); 
					console.log("now is less than contract date");
				}
			}
		}
	}

	function displayMeritInfo(ncMerits) {
		if (ncMerits == 0) {
			gui.hideMeritStat();
			return;
		}

		if (showingMeritInd < 0) {
			showingMeritInd = 0;
		}
		if (showingMeritInd+1 > ncMerits) {
			showingMeritInd = 0;
		}
		
		getMeritTokenId(showingMeritInd).then(function (tokenId) {		
			$("#moId").text(tokenId);
			showingMeritTokenId = tokenId;	
			getShowMeritStat(tokenId);
			
		});

		if (ncMerits == 1) {
			gui.hideMeritIdPrevNext();
		}
		else {
			gui.showMeritIdPrevNext();
		}

		gui.showMeritStat();
	}

	async function getMeritTokenId(chkInd) {
		let id = await stakeContract.methods.tokenOfOwnerByIndex(userAccount, chkInd).call({ from: userAccount });
		gui.showLog("getMeritTokenId chkInd " + chkInd + " id " + id);
		//return web3.utils.fromWei(id, 0);
		return id;
	}

	async function getMeritStat(tokenId) {
		let stat = await stakeContract.methods.getMeritStat(tokenId).call({ from: userAccount })
		return stat;
	}

	function getShowMeritStat(tokenId) {
		getMeritStat(tokenId).then(function (stat) {	
			showingMeritStat = stat;
			gui.showLog("getMeritStat " + stat);
			$("#moAmount").text(web3.utils.fromWei(stat.amount));	
			let st = "MINTED";
			if (stat.state == 1) { st = "DELEGATED"; $("#moStakeUnstake").prop('value', "Unstake"); $(moStakeUnstake).prop('disabled', false); }
			if (stat.state == 2) { st = "UNDELEGATED"; $("#moStakeUnstake").prop('value', "Stake"); $(moStakeUnstake).prop('disabled', false); }
			if (stat.state == 3) { st = "WITHDRAWN"; $("#moStakeUnstake").prop('value', ""); $(moStakeUnstake).prop('disabled', true); }
			handleWithdrawButton(stat);
			$("#moState").text(st);
			gui.showActionTime(stat.actionTime);
		});
	}

	publicApp.ticketLogin = function () {
	};

	publicApp.defiBorrow = function () {
	};

	return publicApp;

})();