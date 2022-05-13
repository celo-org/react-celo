# Building a Contracts Cache

With version 4 the full ContractKit is no longer provided instead MiniContractKit is returned from the hook. For dapps that were accessing contract wrappers not provided on MiniContractKit getting the full contractsCache back can be done by providing a buildContractsCache function that takes in a `Connection` and an `AddressRegistry`. The return value of this function will be memoized and returned on `useContractKit` hook as `contractsCache`.

## Getting back the full cache

```typescript
import { Web3ContractCache } from '@celo/contractkit/lib/web3-contract-cache';
import { WrapperCache } from '@celo/contractkit/lib/contract-cache';
import { AddressRegistry } from '@celo/contractkit/lib/address-registry';
import { ContractKit } from '@celo/contractkit';

// This creates a contracts cache exactly the same as contractkit.contracts
function fullContractsCache(
  connection: ContractKit['connection'],
  registry: AddressRegistry
) {
  const web3Contracts = new Web3ContractCache(registry);
  return new WrapperCache(connection, web3Contracts, registry);
}
```

```tsx
//
<ContractKitProvider
  // The result of this function will be memoized. it will be recalculated when `fullContractsCache`, `connection` or `addressRegistry` changes
  buildContractsCache={fullContractsCache}
>
  {/* etc */}
</ContractKitProvider>

//
```

```ts
import { useContractKit } from '@celo-tools/use-contractkit';

const { contractsCache } = useContractKit();

const contracts = contractsCache as WrapperCache;

const governance = contractsCache.getGovernance();
```

## Creating a Custom Contracts Cache

You can also create your own ContractsCache Class see [MiniContractsCache for an example](https://github.com/celo-org/celo-monorepo/blob/5cfd16214ca7ef7a7ff428c7d397933b3e1eeb51/packages/sdk/contractkit/src/mini-contract-cache.ts)

Note that a few wrappers require a contractCache with a certain subset of other wrappers to be passed in to function these are `Slashers` `Election` `Governance` `ReleaseGold` `Validators` which depend on `Accounts` `Multisig` `BlockchainParameters` and themselves.
