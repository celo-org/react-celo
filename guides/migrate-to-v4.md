# Migrating from @celo-tools/use-contractkit

This guide covers moving from `@celo-tools/use-contractkit@3.x` to `@celo/react-celo@4.x`.

Do not be thrown off by the name change. This is the same code base (with a few [breaking changes](https://github.com/celo-org/react-celo/releases/tag/v4.0.0)).

## Step 1

Remove @celo-tools/use-contractkit

`yarn remove @celo-tools/use-contractkit`

## Step 2

Install @celo/react-celo and at least version 2.0.0 of @celo/contractkit

`yarn add @celo/react-celo @celo/contractkit@latest`

_If your app directly imports any other @celo sdks such as @celo/utils, @celo/wallet-\*\*, update them to 2.0.0 as well_

## Step 3

Using your favorite find–replace–tool replace all `@celo-tools/use-contractkit` with `@celo/react-celo`

## Step 4 (Optional yet Recommended)

Using your next favorite find–replace–tool replace all `useContractKit` with `useCelo` and all `ContractKitProvider` with `CeloProvider`

## Step 5 (If needed)

If you were using `kit.contracts` in your dApp to obtain celo contracts other than `Accounts`, `StableToken`, `Exchange` or `GoldToken`, you will need to [follow the contract-cache-recipe](contract-cache-recipes.md) for an alternative.
