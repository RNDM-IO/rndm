// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.20;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import {IPool} from "./interfaces/IPool.sol";
import {IExchange} from "./interfaces/IExchange.sol";
import {Operatable} from "./Operatable.sol";

contract BorrowerVault is IERC1271, Operatable {
    using SafeERC20 for IERC20;

    address public immutable pool;
    address public immutable exchange;
    IERC20 public immutable token;

    constructor(address _pool, address _exchange) Operatable(msg.sender) {
        pool = _pool;
        exchange = _exchange;
        token = IERC20(IPool(_pool).asset());
    }

    function deposit(uint128 amount) external onlyOperators {
        uint256 allowance = token.allowance(address(this), exchange);
        if (allowance > 0) token.safeDecreaseAllowance(exchange, allowance);
        token.safeIncreaseAllowance(exchange, amount);
        IExchange(exchange).deposit(address(token), amount);
    }

    function borrow(uint256 amount) external onlyOperators {
        IPool(pool).borrow(amount, address(this));
    }

    function repay(uint256 amount, bool isFinalRepay) external onlyOperators {
        uint256 allowance = token.allowance(address(this), pool);
        if (allowance > 0) token.safeDecreaseAllowance(pool, allowance);
        token.safeIncreaseAllowance(pool, amount);
        IPool(pool).repay(amount, address(this), isFinalRepay);
    }

    function isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) external view returns (bytes4 magicValue) {
        if (ECDSA.recover(hash, signature) == owner()) {
            return 0x1626ba7e;
        } else {
            return 0xffffffff;
        }
    }
}
