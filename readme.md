# use-contractkit

The easiest way to access [ContractKit](https://www.npmjs.com/package/@celo/contractkit) in your React applications 🔥. `use-contractkit` is a [React hook](https://reactjs.org/docs/hooks-intro.html) for managing access to ContractKit with a built-in headless modal system for connecting to your users wallet of choice.

Now your dApp can be made available to everyone in the Celo ecosystem, from Valora users to self custodied Ledger users.

#### Supported wallets

- [x] Plaintext private key (for testing)
- [x] [Ledger](https://www.ledger.com/)
- [x] [WalletConnect](https://walletconnect.org/)
- [x] [dAppKit](https://www.dappkit.io/)
- [x] [Metamask (Celo fork)](https://github.com/dsrvlabs/celo-extension-wallet)

## Install

```
yarn add use-contractkit
```

## Wrap your application with ContractKitProvider

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

We provide an `openModal` function that will open a modal with a list of wallets your user can connect to.

```javascript
import { useContractKit } from 'use-contractkit';

function App() {
  const { openModal } = useContractKit();

  return <button onClick={openModal}>Connect wallet</button>;
}
```

## Access ContractKit

Once connected to a wallet the `kit` object will have the `.defaultAccount` property set on it.

```javascript
import { useContractKit } from 'use-contractkit';

function App() {
  const { kit, address } = useContractKit();

  // lookup onchain data
  const accounts = await kit.contracts.getAccounts();
  await accounts.getAccountSummary(address);

  // send transaction
  const cUSD = await kit.contracts.getStableToken();
  await cUSD.transfer("0x...", 10000).sendAndWaitForReceipt();

  return (
    ...
  );
}
```

## Notes

#### Last connected account

use-contractkit will remember a users last connected address. You should always use this address even if the user has no `kit.defaultAccount` property set. This is a quality of life improvement that ensure than when a user refreshes their page, nothing in the UI should change other than potentially buttons being grayed out.

```javascript
import { useContractKit } from 'use-contractkit';

const { address } = useContractKit();
```

#### Prompt to connect

When calling `sendTransaction`, we provide a helper `send` that will open the connect modal before proceeding if the wallet is not connected. For `sign*` and other methods you should check the `kit.defaultAccount` property before trying an operation.

```javascript
import { useContractKit } from 'use-contractkit';

function App() {
  const { kit, send, openModal } = useContractKit();

  // use provided send function to connect account
  // if it doesn't exist
  const sendTransaction = async (to, value) => {
    const cUSD = await kit.contracts.getStableToken();
    await send(cUSD.transfer("0x...", 10000))
  }

  // check account manually before trying to sign
  const sign = async (data) => {
    if (!kit.defaultAccount) {
      openModal();
      return;
    }
    await kit.signTypedData(kit.defaultAccount, data)
  }

  return (
    ...
  );
}

```
