// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.20;

library Errors {
    error SUPPLY_CAP_EXCEEDED();
    error ADDRESS_SUPPLY_CAP_EXCEEDED();
    error BORROW_CAP_EXCEEDED();
    error BORROW_EXCEEDS_BALANCE();
    error INVALID_AMOUNT();
    error FUNDS_LOCKED();
    error NO_PENDING_FUNDS();
    error PENDING_NOT_AVAILABLE();
    error DISTRIBUTOR_NOT_SET();
    error INSUFFICIENT_AMOUNT();
    error FUNDS_AVAILABLE();
    error NOTHING_TO_REPAY();
    error VALUE_EXCEEDED_RANGE();
    error INVALID_ADDRESS();
    error INVALID_BASIS_POINT();

    error MUST_REPAY_TO_BORROW_MORE();
    error INSUFFICIENT_AMOUNT_TO_SETTLE();
    error UNAUTHORIZED();

    error INVALID_DECIMALS();
    error INVALID_PERFORMANCE_FEE();
    error INVALID_BORROW_CAP();
    error INVALID_SUPPLY_CAP();
    error INVALID_SUPPLY_CAP_PER_ADDRESS();

    error INVALID_LOCK_PERIOD();

    error NOT_BORROWED_BY_USER();

    error UNSUPPORTED();

    error INACTIVE_REWARD();

    error RECEIVE_NOT_ALLOWED();
    error FALLBACK_NOT_ALLOWED();
}
