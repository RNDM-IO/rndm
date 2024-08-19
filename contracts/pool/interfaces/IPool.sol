// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.20;

import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";

interface IPool is IERC4626 {
    struct TokenInfo {
        address tokenAddress;
        address priceOracle;
        uint8 decimals;
    }

    struct Configuration {
        uint256 supplyCap;
        uint256 supplyCapPerAddress;
        uint16 borrowCap;
        uint16 performanceFee;
        uint64 lockPeriod;
    }

    struct InitPoolParams {
        string tokenName;
        string tokenSymbol;
        address underlying;
        string name;
        address admin;
        address feeCollector;
        uint16 performanceFee;
        uint64 lockPeriod;
    }

    /**
     * @notice Returns the configuration of the pool
     * @return supplyCap The maximum deposit amount
     * @return supplyCapPerAddress The maximum deposit amount per address
     * @return borrowCap The maximum borrow amount
     * @return performanceFee The performance fee
     * @return lockPeriod The period to lock the asset
     */
    function config()
        external
        view
        returns (
            uint256 supplyCap,
            uint256 supplyCapPerAddress,
            uint16 borrowCap,
            uint16 performanceFee,
            uint64 lockPeriod
        );

    /// @notice lends asset to borrower
    /// @param amount The amount of underlying asset to borrow
    function borrow(uint256 amount, address receiver) external;

    /// @notice Repays the borrowed asset the pool
    /// @dev The only borrower can repay
    /// @param amount The amount of underlying asset to repay
    function repay(
        uint256 amount,
        address receiver,
        bool isFinalRepay
    ) external;

    /// @notice Set the total deposit limit of pool
    /// @param newValue new limit
    function setSupplyCap(uint256 newValue) external;

    /// @notice Set the deposit limit per account
    /// @param newValue new limit per account
    function setSupplyCapPerAddress(uint256 newValue) external;

    /// @notice Set the total borrow limit of pool
    /// @param newValue new limit to borrow
    function setBorrowCap(uint16 newValue) external;

    /**
     * @notice Set the lock period of the pool
     * IMPORTANT: fails if the lock mode is ONE_TIME
     */
    function setLockPeriod(uint64 newValue) external;

    /// @notice set the reward distributor for early incentive
    function setRewardsController(address _rewardsController) external;

    /**
     * @dev Emitted on deposit()
     * @param user The address initiating the deposit
     * @param receiver The beneficiary of the deposit
     * @param amount The amount supplied
     */
    event Deposit(address user, address indexed receiver, uint256 amount);

    /**
     * @dev Emitted on withdraw()
     * @param user The address initiating the withdrawal, owner of aTokens
     * @param to The address that will receive the underlying
     * @param amount The amount to be withdrawn
     */
    event Withdraw(address indexed user, address indexed to, uint256 amount);

    /// @notice Emitted whenever user called IPoolAction#withdraw and pool doesn't have enough funds
    /// @dev Admin should seize funds from borrowers if it ocurrs
    /// @param user The address of withdrawer
    /// @param amount The amount of pending asset
    event WithdrawRequested(address indexed user, uint256 amount);

    event WithdrawPending(
        address indexed user,
        address indexed receiver,
        uint256 amount
    );

    /**
     * @dev Emitted on borrow() when debt needs to be opened
     * @param user The address of the user initiating the borrow(), receiving the funds on borrow()
     * @param receiver The address that will be getting the debt
     * @param amount The amount borrowed out
     */
    event Borrow(address user, address indexed receiver, uint256 amount);

    /**
     * @dev Emitted on repay()
     * @param user The beneficiary of the repayment, getting his debt reduced
     * @param repayer The address of the user initiating the repay(), providing the funds
     * @param amount The amount repaid
     */
    event Repay(address indexed user, address indexed repayer, uint256 amount);

    /**
     * @dev Emitted when a performance fee is updated.
     * @param oldPerformanceFee The old performance fee, expressed in bps
     * @param newPerformanceFee The new performance fee, expressed in bps
     */
    event PerformanceFeeChanged(
        uint256 oldPerformanceFee,
        uint256 newPerformanceFee
    );

    /**
     * @dev Emitted when the borrow cap of a reserve is updated.
     * @param oldBorrowCap The old borrow cap
     * @param newBorrowCap The new borrow cap
     */
    event BorrowCapChanged(uint256 oldBorrowCap, uint256 newBorrowCap);

    /**
     * @dev Emitted when the supply cap of a pool is updated.
     * @param oldSupplyCap The old supply cap
     * @param newSupplyCap The new supply cap
     */
    event SupplyCapChanged(uint256 oldSupplyCap, uint256 newSupplyCap);

    /**
     * @dev Emitted when the supply cap per address of a pool is updated.
     * @param oldSupplyCap The old supply cap
     * @param newSupplyCap The new supply cap
     */
    event SupplyCapPerAddressChanged(
        uint256 oldSupplyCap,
        uint256 newSupplyCap
    );

    /**
     * @dev Emitted when the lock period is updated.
     */
    event LockPeriodUpdated(uint64 oldLockPeriod, uint64 lockPeriod);
}
