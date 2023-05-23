// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "../../extension/manager/StakingManager.sol";
import "../../extension/manager/DistributionManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ExtensionMgr is StakingManager, DistributionManager {
	bool internal isDebugActive;

	function extApproveStakingDistribution(address from) public {
		if (isDebugActive) return;
		approveAllStakingMethodsWithMaxAmount(from);
		approveAllDistributionMethodsWithMaxAmount(from);
	}

	function extStake(address from, string memory _validatorAddr, uint256 _amount) public returns (int64 completionTime) {
		if (isDebugActive) return 0;
		return stakeTokens(from, _validatorAddr, _amount);
	}

	function extUnstake(address from, string memory _validatorAddr, uint256 _amount) public returns (int64 completionTime) {
		if (isDebugActive) return 0;
		return unstakeTokens(from, _validatorAddr, _amount);
	}

	function extWithdrawRewards(address from, string memory _validatorAddr) public returns (Coin[] memory amount) {
		return withdrawRewards(from, _validatorAddr);
	}

    function extQueryRewardAmount(address from, string memory _validatorAddr) public view returns (DecCoin[] memory) {
        return queryRewards(from, _validatorAddr);
    }
	
	function extQueryDelegatedAmount(address from, string memory _valAddr) public view returns (uint256, Coin memory) {
        return getDelegation(from, _valAddr);
    }

	function extQueryUndelegateInfo(address from, string memory _valAddr) public view returns (UnbondingDelegationEntry[] memory entries) {
        return getUnbondingDelegation(from, _valAddr);
    }
}


