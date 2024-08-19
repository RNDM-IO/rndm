// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.20;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {PercentageMath} from "@aave/core-v3/contracts/protocol/libraries/math/PercentageMath.sol";

import {IPool} from "./interfaces/IPool.sol";

import {Errors} from "./helpers/Errors.sol";

import {PoolBase} from "./base/PoolBase.sol";

contract AgentPool is PoolBase {
    using PercentageMath for uint256;
    using SafeERC20 for IERC20;

    uint16 public minRepayBips = 9000;

    event MinRepayBipsUpdated(uint16 minRepayBips);

    constructor(InitPoolParams memory params) PoolBase(params) {}

    // Borrower Actions

    /// @inheritdoc IPool
    function borrow(
        uint256 amount,
        address receiver
    ) public onlyRole(BORROWER_ROLE) {
        // checks if total borrowed amount exceeds limit by this borrowing
        uint256 _totalAssets = totalAssets();

        if (debits[msg.sender] > 0) revert Errors.MUST_REPAY_TO_BORROW_MORE();
        uint256 maxToBorrow = _totalAssets.percentMul(config.borrowCap);
        if (amount + totalBorrowed > maxToBorrow)
            revert Errors.BORROW_CAP_EXCEEDED();

        totalBorrowed += amount;
        debits[msg.sender] += amount;

        // transfer asset to borrower
        IERC20(asset()).safeTransfer(receiver, amount);

        emit Borrow(msg.sender, receiver, amount);
    }

    function setMinRepayBips(
        uint16 newVal
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newVal > MAX_BIPS || newVal == 0) revert Errors.INVALID_AMOUNT();
        minRepayBips = newVal;

        emit MinRepayBipsUpdated(newVal);
    }

    function repay(
        uint256 amount,
        address onBehalfOf,
        bool shouldSettle
    ) public override {
        partialRepay(amount, onBehalfOf);
        if (shouldSettle) settleRepay(onBehalfOf);
    }

    function partialRepay(uint256 amount, address onBehalfOf) public {
        if (amount == 0) revert Errors.INVALID_AMOUNT();
        // borrower has clean debit, no need to repay
        if (debits[onBehalfOf] == 0) revert Errors.NOTHING_TO_REPAY();

        if (amount == type(uint256).max) {
            amount = IERC20(asset()).balanceOf(msg.sender);
        }

        repaid[onBehalfOf] += amount;
        _deductTotalBorrowed(amount);

        IERC20(asset()).safeTransferFrom(msg.sender, address(this), amount);

        emit Repay(onBehalfOf, msg.sender, amount);
    }

    function settleRepay(address onBehalfOf) public {
        // only borrower or admin can settle
        if (
            msg.sender != onBehalfOf && !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)
        ) revert Errors.UNAUTHORIZED();

        uint256 _debits = debits[onBehalfOf];
        uint256 _repaid = repaid[onBehalfOf];

        uint256 _fee = 0;

        if (_repaid > _debits) {
            uint256 _profit = _repaid - _debits;
            _fee = _profit.percentMul(config.performanceFee);
        } else {
            // what if total repaid amount is less than minRepayBips?
            if (_repaid < _debits.percentMul(minRepayBips))
                revert Errors.INSUFFICIENT_AMOUNT_TO_SETTLE();
        }
        debits[onBehalfOf] = 0;
        repaid[onBehalfOf] = 0;

        if (_fee > 0) IERC20(asset()).safeTransfer(feeCollector, _fee);
    }

    function _deductTotalBorrowed(uint256 amount) private {
        if (totalBorrowed > amount) totalBorrowed -= amount;
        else totalBorrowed = 0;
    }
}
