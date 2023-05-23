// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "./logic/AppLogic.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract StkApp is AppLogic, ERC721, ERC721Enumerable, ERC721Burnable {
    using Strings for uint8;
    using Counters for Counters.Counter;
	uint256 private baseprice = 1;	
    Counters.Counter private _tokenIdCounter;
    string private baseuri;
	uint256 private collectedRewards = 0;

	event BuyMeritStake(address buyer, uint256 amountOfVal, uint8  meritId, uint256 tokenId);

    constructor(bool isdebug, string memory vAddress, uint256 bprice, string memory uri) ERC721("StkEvmosMerit", "SEM") {
        isDebugActive = isdebug;
		validatorAddress = vAddress;
		baseprice = bprice;
        baseuri = uri;
    }

	/* ==================== OVERRIDE  ================================ */
	function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    } 


	/* ==================== EXTERNAL  ================================ */
	function withdrawRewardsToContract() onlyOwner external returns (uint256 amount){
		Coin[] memory newRewards = extWithdrawRewards(address(this), validatorAddress);
		collectedRewards += newRewards[0].amount; 
		return newRewards[0].amount;
	}

	function queryRewardsToContract() onlyOwner external view returns (uint256 amount){
		DecCoin[] memory newRewards = extQueryRewardAmount(address(this), validatorAddress);
		return newRewards[0].amount;
	}

	function stakeMerit(uint256 tokenId) external returns (uint256 state){
		_requireMinted(tokenId);
		require(ERC721.ownerOf(tokenId) == msg.sender, "ERC721: staker is not owner");
		return _stakeMerit(tokenId);
	}
	
	function unstakeMerit(uint256 tokenId) external returns (uint256 state){
		_requireMinted(tokenId);
		require(ERC721.ownerOf(tokenId) == msg.sender, "ERC721: unstaker is not owner");
		return _unstakeMerit(tokenId);
	}

	/* ==================== PUBLIC ================================ */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

	function getRewardBalance() external view returns (uint256) {
        return collectedRewards;
    }
	
	/* ==================== ERC721 ================================ */
	function _baseURI() internal view override returns (string memory) {
		return baseuri;
	}
	
	function setBaseURI(string calldata uri) public onlyOwner {
		baseuri = uri;
	}
	
	function setBasePrice(uint256 bprice) public onlyOwner {
		baseprice = bprice;
	}

	function setValidator(string memory vAddress) public onlyOwner {
		validatorAddress = vAddress;
	}

	function setDebug(bool isdebug) public onlyOwner {
		isDebugActive = isdebug;
	}

	function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
		_requireMinted(tokenId);

		// Individual merit names are due to upload of nfts to nftstore
		string memory baseURI = _baseURI();
		uint8 meritId = curMerits[tokenId].meritId;
		string memory meritName = "";
		if (meritId == MERIT_1) { meritName = "1.png"; }
		else if (meritId == MERIT_2) { meritName = "2.png"; }
		else if (meritId == MERIT_3) { meritName = "3.png"; }
		else if (meritId == MERIT_CUSTOM) { meritName = "hithard.png"; }
		return string(abi.encodePacked(baseURI, meritName));
	}
	
	function _opMeritMint(address to, uint8 meritId, uint256 amount) private returns (uint256){
		uint256 tokenId = _tokenIdCounter.current();
		_tokenIdCounter.increment();
		_initMerit(tokenId, to, meritId, amount);
		_safeMint(to, tokenId);
		console.log("opMeritMint tokenId=%d, meritId=%d", tokenId, meritId);
		return tokenId;
	}
		
	/* ==================== Payable ================================ */
    receive() payable external {
		console.log("receive %s => %s", msg.sender, msg.value);
    }

    fallback() external payable {
		console.log("fallback %s => %s", msg.sender, msg.value);
    }

    function withdraw () external payable onlyOwner returns (bool issuccess) { 
        uint256 amount = address(this).balance; 
        require(amount > 0, 'Contract has no balance to withdraw');
        address payable owner = payable(owner());
        (bool success, ) = owner.call{value: amount}('');
        require(success, "Failed to send");
		return success;
    }

	function withdrawRewards () external payable onlyOwner returns (bool issuccess) { 
        uint256 amount = collectedRewards; 
        require(amount > 0, 'Contract has no reward balance to withdraw');
        address payable owner = payable(owner());
        (bool success, ) = owner.call{value: amount}('');
        require(success, "Failed to send");
		return success;
    }

	function buyMeritStake(uint8 meritId) external payable returns (bool success) {
		// User buys merit with EVMOS in return receives NFT from contract

		require(msg.value > 0, "Non-zero value needed to buy merit");
		require(meritId <= MERIT_3, "Invalid merit");

		console.log("buyMeritToken meritId=%d val=%d", meritId, msg.value);

		uint256 multfac = 100; 
		uint256 expval = (1e18); // 10**18
		//  merit1 100 evmos      => 1 * 100 * (10**18)

		// Each merit has different price
		if (meritId == MERIT_1) {
			require(msg.value == (1 * baseprice * multfac * expval), "Merit payment not correct");
		}	
		else if (meritId == MERIT_2) {
			require(msg.value == (2 * baseprice * multfac * expval), "Merit payment not correct");
		}	
		else if (meritId == MERIT_3) {
			require(msg.value == (3 * baseprice * multfac * expval), "Merit payment not correct");
		}	

		// Unique token
		uint256 tokenId = _opMeritMint(msg.sender, meritId, msg.value);
		emit BuyMeritStake(msg.sender, msg.value, meritId, tokenId);

		// The amount is immediately staked by contract to default validator
		_stakeMerit(tokenId);

		return true;
  	}

	function sellMeritStake(uint256 tokenId) external returns (uint256 state) {
		_requireMinted(tokenId);
		require(ERC721.ownerOf(tokenId) == msg.sender, "ERC721: seller is not owner");

		uint256 st = _withdrawAmountFromMerit(tokenId);
		_burn(tokenId);

		return st;
	}
}