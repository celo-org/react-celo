# use-contractkit

The easiest way to access [ContractKit](https://www.npmjs.com/package/@celo/contractkit) in your React applications 🔥. `use-contractkit` is a [React hook](https://reactjs.org/docs/hooks-intro.html) for managing access to ContractKit with a built-in headless modal system for connecting to your users wallet of choice.

Now your dApp can be made available to everyone in the Celo ecosystem, from Valora users to self custodied Ledger users.

#### Supported wallets

- [x] Private key (for testing)
- [x] [Ledger](https://www.ledger.com/)
- [ ] [WalletConnect](https://walletconnect.org/)
- [ ] [dAppKit](https://www.dappkit.io/)

## Install

```
yarn add use-contractkit
```

## Wrap with Context provider

```javascript
import { ContractKitProvider } from 'use-contractkit';

function WrappedApp() {
  return (
    <ContractKitProvider>
      <App />
    </ContractKitProvider>
  );
}

function App() {
  // your application code
}
```

## Prompt users to connect wallet

```javascript
import { useContractKit } from 'use-contractkit';

function App() {
  const { openModal } = useContractKit();

  return <button onClick={openModal}>Connect wallet</button>;
}
```

## Access kit

```javascript
import { useContractKit } from 'use-contractkit';

function App() {
  const { kit } = useContractKit();

  // lookup onchain data
  // const accounts = await kit.contracts.getAccounts();
  // await accounts.getAccountSummary(kit.defaultAccount);

  // send transaction
  // const cUSD = await kit.contracts.getStableToken();
  // await cUSD.transfer("0x...", 10000).sendAndWaitForReceipt();

  return (
    ...
  );
}
```
