// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./ExtensionMgr.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AppLogic is Ownable, ExtensionMgr {

	string internal validatorAddress;
	uint8 constant internal MERIT_CUSTOM = 0;
	uint8 constant internal MERIT_1 = 1;
	uint8 constant internal MERIT_2 = 2;
	uint8 constant internal MERIT_3 = 3;

	event StakeMerit(address staker, uint256 tokenId);
	event UnstakeMerit(address staker, uint256 tokenId);
	event WithdrawstakeMerit(address staker, uint256 tokenId, uint256 amount);

	enum MeritState{MINTED, DELEGATED, UNDELEGATED, WITHDRAWN}
	struct MeritInfo {
		MeritState state;
		uint8 meritId;
		address mintedBy;
		string validator;
		uint256 amount;
		int64 actionTime;
	}
	mapping (uint256 => MeritInfo) internal curMerits;

	/* ==================== EXTERNAL  ================================ */
	function getMeritStat(uint256 tokenId) external view returns(uint256 state, uint8 meritId, uint256 amount, int64 actionTime) {
		return (uint256(curMerits[tokenId].state), curMerits[tokenId].meritId, curMerits[tokenId].amount, curMerits[tokenId].actionTime);
	}
	
	function setDebugAttribute(uint256 tokenId, uint256 state, uint8 meritId, uint256 amount, int64 actionTime) external onlyOwner {
		require (isDebugActive, "Contract has to be created with debug active");
		curMerits[tokenId].state = MeritState(state);
		curMerits[tokenId].meritId = meritId;
		curMerits[tokenId].amount = amount;
		curMerits[tokenId].actionTime = actionTime;
		
		_printMeritInfo(tokenId);
	}
	
	/* ==================== PRIVATE ================================ */

	function _initMerit(uint256 tokenId, address to, uint8 meritId, uint256 amount) internal {
		curMerits[tokenId].meritId = meritId;
		curMerits[tokenId].mintedBy = to;
		curMerits[tokenId].amount = amount;
		curMerits[tokenId].validator = validatorAddress;
		curMerits[tokenId].state = MeritState.MINTED;
	}

	function _approveAll(address from) private {
		extApproveStakingDistribution(from);
	}

	function _stakeMerit(uint256 tokenId) internal returns(uint256 state) {
		require (curMerits[tokenId].state == MeritState.MINTED || curMerits[tokenId].state == MeritState.UNDELEGATED, "Stake not possible: Not minted and not undelegated");
		require(curMerits[tokenId].amount > 0, "Amount zero in merit");
		curMerits[tokenId].state = MeritState.DELEGATED;
		
		// needs to be approved by user not by contract
		_approveAll(msg.sender);  

		// staked using contract address
		int64 completionTime = extStake(address(this), curMerits[tokenId].validator, curMerits[tokenId].amount);

		curMerits[tokenId].actionTime = completionTime;
		emit StakeMerit(msg.sender, tokenId);
		return uint256(curMerits[tokenId].state);
	}

	function _unstakeMerit(uint256 tokenId) internal returns(uint256 state) {
		require (curMerits[tokenId].state == MeritState.DELEGATED, "Unstake not possible: Not staked");
		require(curMerits[tokenId].amount > 0, "Amount zero in merit");
		curMerits[tokenId].state = MeritState.UNDELEGATED;

		// unstake using contract address
		int64 completionTime = extUnstake(address(this), curMerits[tokenId].validator, curMerits[tokenId].amount);
		curMerits[tokenId].actionTime = completionTime;
		emit UnstakeMerit(msg.sender, tokenId);
		return uint256(curMerits[tokenId].state);
	}

	function _withdrawAmountFromMerit(uint256 tokenId) internal returns(uint256 state) {
		require (curMerits[tokenId].state == MeritState.UNDELEGATED, "Withdraw not possible: Not unstaked");
		require(curMerits[tokenId].amount > 0, "Withdraw not possible: Amount zero in merit");
		require(block.timestamp >= uint256(int256(curMerits[tokenId].actionTime)), "Withdraw not possible: Release time not come");

		curMerits[tokenId].state = MeritState.WITHDRAWN;
		uint256 payback = curMerits[tokenId].amount; 
		curMerits[tokenId].amount = 0;
		(bool sent,) = payable(msg.sender).call{value: payback}("");
		require(sent, "Failed to send Evmos");
		
		emit WithdrawstakeMerit(msg.sender, tokenId, payback);
		return uint256(curMerits[tokenId].state);
	}

	function _printMeritInfo(uint256 tokenId) private view {
		console.log("==================");
		console.log("%s: tokenId=%d state=%d ", curMerits[tokenId].mintedBy, tokenId, uint256(curMerits[tokenId].state));
		console.log("meritId=%d amount=%d actionTime=%d", curMerits[tokenId].meritId, curMerits[tokenId].amount, uint64(curMerits[tokenId].actionTime));
		console.log("validator %s: id=%d state=%d ", curMerits[tokenId].validator);
	} 

}


