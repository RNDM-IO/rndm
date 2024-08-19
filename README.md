# sAMM

### Steps to use tasks

- ERC20 token

```shell
npx hardhat deploy --network <network>

npx hardhat create-agent-pool --network <network> --asset <tokenAddress> --period <lockPeriodInSecs> --label <label>

npx hardhat agent-pool:deposit --network <network> --label <label> --asset <assetAddress> --amount <amountToDeposit>

npx hardhat agent-pool:withdraw --network <network> --label <label> --asset <assetAddress> --amount <amountToWithdraw>

npx hardhat pool:grant-role --network <network> --pool <poolAddress> --to <addressToGrant>

npx hardhat agent-pool:borrow --network <network> --label <label> --asset <assetAddress> --amount <amountToBorrow>

npx hardhat agent-pool:repay --network <network> --label <label> --asset <assetAddress> --amount <amountToRepay>

npx hardhat agent-pool:partial-repay --network <network> --label <label> --asset <assetAddress> --amount <amountToRepay>

npx hardhat agent-pool:settle-repay --network <network> --label <label> --asset <assetAddress>
```

- Auxiliary

```shell
npx hardhat deploy:mock-token --network <network>
npx hardhat time-travel --network <network> --seconds <seconds>
npx hardhat transfer:token --network <network> --token <tokenAddress> --to <recipientAddress> --amount <amountToSend>
```

- Deployment and usage step-by-step

```shell
cp .env.example .env
```

And update `PK_*` values inside `.env` file. It's essential as all the actions in tasks will be performed from those
private keys respectively to their names.

1. `PK_USER` is a user that deposits and withdraws tokens/coins to pools - regular user.
2. `PK_OWNER` is deployer account - it will be main admin and deployer of all the contracts.
3. `PK_BORROWER` is a borrower account to perform borrow/repay actions.

```shell
npx hardhat agent-admin:grant-borrower-role --network <network> --asset <assetAddress> --label <label> --to <addressToGrant>

npx hardhat agent-admin:revoke-borrower-role --network <network> --asset <assetAddress> --label <label> --borrower <borrowerAddressToRevoke>
```

Grant borrower role to specific address.

### Admin

1. Set total deposit limit
   ```shell
   hh pool:admin:total-deposit-limit --pool <poolAddress> --amount <amountInUnits> --decimals <decimalsOfToken> --network local
   ```
2. Set personal deposit limit
   ```shell
   hh pool:admin:personal-deposit-limit --pool <poolAddress> --amount <amountInUnits> --decimals <decimalsOfToken> --network local
   ```

### BSX Exchange

BorrowerVault.sol is the borrower smart contract.
There is no change in the AgentPool contract.
It's just enough to grant borrower role to BorrowerVault address to make it interact with BSX Exchange.

There are sample scripts to interact with BSX Exchange in the scripts/bsx folder.

- Register

```shell
   hh run scripts/bsx/register.ts --network base-sepolia
```

The register endpoint will return api_key, api_secret, expired_at. Use them in the following steps.

- Borrow from an agent pool with a BorrowerVault

```shell
   hh run scripts/bsx/borrow-with-vault.ts --network base-sepolia
```

It just borrow funds from the agent pool. So there is no interaction with BSX.
At this point, funds are in the borrower vault.

- Deposit to the BSX Exchange contract from the BorrowerVault

```shell
   hh run scripts/bsx/deposit.ts --network base-sepolia
```

It deposits borrowed funds of vault to the BSX contract directly, no api call.

- Create order
  It instantiates the exchange object and create order and fetch open orders.

```shell
   hh run scripts/bsx/create-order.ts --network base-sepolia
```

- Get open orders

```shell
   hh run scripts/bsx/get-open-orders.ts --network base-sepolia
```

- Withdraw from the BSX Exchange contract to the BorrowerVault

```shell
   hh run scripts/bsx/withdraw.ts --network base-sepolia
```

It withdraws funds from the BSX Exchange contract to the BorrowerVault.
So you can repay to the pool.
