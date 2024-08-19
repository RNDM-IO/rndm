// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.20;

import {IERC20, ERC20, SafeERC20, Math, IERC4626, ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {IRewardsController} from "@aave/periphery-v3/contracts/rewards/interfaces/IRewardsController.sol";
import {IPool} from "../interfaces/IPool.sol";

import {Errors} from "../helpers/Errors.sol";
import {WadRayMath} from "@aave/core-v3/contracts/protocol/libraries/math/WadRayMath.sol";

abstract contract PoolBase is IPool, ERC4626, AccessControl {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;
    using WadRayMath for uint256;

    Configuration public override config;

    uint256 public totalBorrowed;
    uint256 public totalRequestedWithdrawalShares;
    address public feeCollector;

    /// @dev The reward distributor for the ealry incentive
    IRewardsController public rewardsController;

    uint256 internal constant MAX_BIPS = 10000;

    uint16 internal constant INITIAL_BORROW_CAP = 5000;

    // The admin role
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    bytes32 public constant BORROWER_ROLE = keccak256("BORROWER_ROLE");

    mapping(address => uint256) public debits;
    mapping(address => uint256) public repaid;
    mapping(address => uint64) public depositTimes;

    constructor(
        InitPoolParams memory params
    )
        ERC20(params.tokenName, params.tokenSymbol)
        ERC4626(IERC20(params.underlying))
    {
        config.performanceFee = params.performanceFee;
        config.lockPeriod = params.lockPeriod;
        config.borrowCap = INITIAL_BORROW_CAP;
        feeCollector = params.feeCollector;

        _grantRole(DEFAULT_ADMIN_ROLE, params.admin);
        _grantRole(ADMIN_ROLE, params.admin);
        _setRoleAdmin(ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
    }

    // User Actions

    /// @dev Repays the amount of underlying asset
    /// @dev The calling functions should be guarded by access control
    /// @param amount The amount to repay
    /// @param shouldSettle Is the final repay of the underlying asset
    function repay(
        uint256 amount,
        address receiver,
        bool shouldSettle
    ) public virtual;

    function availableBalance() public view returns (uint256) {
        return IERC20(asset()).balanceOf(address(this));
    }

    function totalAssets()
        public
        view
        override(IERC4626, ERC4626)
        returns (uint256)
    {
        return totalBorrowed + availableBalance();
    }

    // Admin functions

    /// @inheritdoc IPool
    function setSupplyCap(
        uint256 supplyCap
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 oldCap = config.supplyCap;
        config.supplyCap = supplyCap;
        emit SupplyCapChanged(oldCap, supplyCap);
    }

    /// @inheritdoc IPool
    function setSupplyCapPerAddress(
        uint256 supplyCapPerAddress
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (supplyCapPerAddress == 0)
            revert Errors.INVALID_SUPPLY_CAP_PER_ADDRESS();
        uint256 oldSupplyCapPerAddress = config.supplyCapPerAddress;
        config.supplyCapPerAddress = supplyCapPerAddress;
        emit SupplyCapPerAddressChanged(
            oldSupplyCapPerAddress,
            supplyCapPerAddress
        );
    }

    /// @inheritdoc IPool
    function setBorrowCap(
        uint16 borrowCap
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _validateBasisPoint(borrowCap);
        uint16 oldBorrowCap = config.borrowCap;
        config.borrowCap = borrowCap;
        emit BorrowCapChanged(oldBorrowCap, borrowCap);
    }

    function setLockPeriod(
        uint64 lockPeriod
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint64 oldLockPeriod = config.lockPeriod;

        config.lockPeriod = lockPeriod;
        emit LockPeriodUpdated(oldLockPeriod, lockPeriod);
    }

    /// @inheritdoc IPool
    function setRewardsController(
        address _rewardsController
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        rewardsController = IRewardsController(_rewardsController);
    }

    function setPerformanceFee(
        uint16 performanceFee
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _validateBasisPoint(performanceFee);
        uint16 oldPerformanceFee = config.performanceFee;
        config.performanceFee = performanceFee;
        emit PerformanceFeeChanged(oldPerformanceFee, performanceFee);
    }

    function maxDeposit(
        address user
    ) public view override(IERC4626, ERC4626) returns (uint256) {
        uint256 balance = convertToAssets(balanceOf(user));

        if (config.supplyCap == 0 && config.supplyCapPerAddress == 0)
            return type(uint256).max;
        if (
            (config.supplyCapPerAddress > 0 &&
                config.supplyCapPerAddress <= balance) ||
            (config.supplyCap > 0 && config.supplyCap <= totalAssets())
        ) {
            return 0;
        }

        if (config.supplyCapPerAddress > 0 && config.supplyCap == 0)
            return config.supplyCapPerAddress - balance;
        return
            Math.min(
                config.supplyCapPerAddress - balance,
                config.supplyCap - totalAssets()
            );
    }

    function maxMint(
        address user
    ) public view override(IERC4626, ERC4626) returns (uint256) {
        return previewDeposit(maxDeposit(user));
    }

    function _validateBasisPoint(uint256 value) internal pure {
        if (value > MAX_BIPS) revert Errors.INVALID_BASIS_POINT();
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        if (value == 0) revert Errors.INVALID_AMOUNT();
        super._update(from, to, value);

        // lock

        if (from == address(0)) {
            depositTimes[to] = uint64(block.timestamp);
        } else {
            if (depositTimes[from] + config.lockPeriod > block.timestamp)
                revert Errors.FUNDS_LOCKED();
        }

        // reward
        if (address(rewardsController) != address(0)) {
            if (from != address(0))
                rewardsController.handleAction(
                    from,
                    totalSupply(),
                    balanceOf(from)
                );
            if (to != address(0)) {
                rewardsController.handleAction(
                    to,
                    totalSupply(),
                    balanceOf(to)
                );
            }
        }
    }
}
