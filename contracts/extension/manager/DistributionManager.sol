// SPDX-License-Identifier: LGPL-v3
pragma solidity >=0.8.17;

import "../../precompiles/stateful/Distribution.sol";

contract DistributionManager {
    string[] private distributionMethods = [MSG_WITHDRAW_DELEGATOR_REWARD];

    /// @dev Approves all staking transactions with the maximum amount of tokens.
    /// @dev This creates a Cosmos Authorization Grant for the given methods.
    /// @dev This emits an Approval event.
    function approveAllDistributionMethodsWithMaxAmount(address staker) internal {
        bool success = DISTRIBUTION_CONTRACT.approve(staker, distributionMethods);
        require(success, "Failed to approve distribution methods");
    }

    function withdrawRewards(address staker, string memory _validatorAddr) internal returns (Coin[] memory amount) {
        return
            DISTRIBUTION_CONTRACT.withdrawDelegatorRewards(
                staker,
                _validatorAddr
            );
    }

    function queryRewards(address staker, string memory _validatorAddr) internal view returns (DecCoin[] memory rewards) {
        return
            DISTRIBUTION_CONTRACT.delegationRewards(staker, _validatorAddr);
    }

}
