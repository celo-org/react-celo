# use-contractkit

[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/celo-tools/use-contractkit/blob/master/LICENSEs)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/@celo-tools/use-contractkit/issues)
[![Open Source Love svg1](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![npm version](https://badge.fury.io/js/%40celo-tools%2Fuse-contractkit.png)](https://badge.fury.io/js/%40celo-tools%2Fuse-contractkit)

The easiest way to access [ContractKit](https://www.npmjs.com/package/@celo/contractkit) in your React applications 🔥. `use-contractkit` is a [React hook](https://reactjs.org/docs/hooks-intro.html) for managing access to ContractKit with a built-in headless modal system for connecting to your users wallet of choice.

Now your DApp can be made available to everyone in the Celo ecosystem, from Valora users to self custodied Ledger users.

By default use-contractkit is styled so that you can drop it into your application and go, however it's fully customisable so you can maintain a consistent UX throughout your application.

## Table of Contents

- [Installation](#install)
- [Supported Wallets](#supported-wallets)
- [Usage](#usage)
- [Notes](#notes)
- [Support](#support)

## Install

```
yarn add @celo-tools/use-contractkit
```

## Supported wallets

| Wallet                                                                    |  sendTransaction   |    signTransaction | signTypedData      | signPersonal       |
| ------------------------------------------------------------------------- | :----------------: | -----------------: | ------------------ | ------------------ |
| Plaintext private key                                                     |                    | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| [Ledger](https://www.ledger.com/)                                         |                    | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| [WalletConnect](https://walletconnect.org/)                               |                    | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| [DappKit](https://docs.celo.org/developer-guide/dappkit)                  | :white_check_mark: |                    |                    | :white_check_mark: |
| [Metamask (Celo fork)](https://github.com/dsrvlabs/celo-extension-wallet) | :white_check_mark: |                    |                    |                    |

## Usage

### Wrap your application with ContractKitProvider

use-contractkit uses [unstated-next](https://github.com/jamiebuilds/unstated-next) under the hood to inject state throughout your application. This library is built on top of the Context API, so you need to make sure your application is wrapped with the provider before usage.

```javascript
import { ContractKitProvider } from '@celo-tools/use-contractkit';
import '@celo-tools/use-contractkit/lib/styles.css';

function WrappedApp() {
  return (
    <ContractKitProvider dappName="My awesome dApp">
      <App />
    </ContractKitProvider>
  );
}

function App() {
  // your application code
}
```

### Access ContractKit

Once connected to a wallet the `address` property will also be available for use.

```javascript
import { useContractKit } from '@celo-tools/use-contractkit';

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

### Prompt users to connect wallet

use-contractkit provides an `openModal` function that will open a modal with a list of wallets your user can connect to.

```javascript
import { useContractKit } from '@celo-tools/use-contractkit';

function App() {
  const { openModal } = useContractKit();

  return <button onClick={openModal}>Connect wallet</button>;
}
```

### Network management

use-contractkit provides a `network` variable and an `updateNetwork` function you can use to display the currently connected network as well as switch to a different one (ie. Alfajores, Baklava or Mainnet).

Be sure to check the use-contractkit example application for a showcase of how this can work. Usually you'll want to show a dropdown to your users allowing them to select the network to connect to.

```javascript
import { useContractKit } from '@celo-tools/use-contractkit';

function App() {
  const { network, updateNetwork } = useContractKit();

  return <div>Currently connected to {network}</div>;
}
```

## Notes

#### Last connected account

use-contractkit will remember a users last connected address. You should always use this address even if the user has no `kit.defaultAccount` property set. This is a quality of life improvement that ensure than when a user refreshes their page, nothing in the UI should change other than potentially buttons being grayed out.

```javascript
import { useContractKit } from '@celo-tools/use-contractkit';

const { address } = useContractKit();
```

#### Prompt to connect

When calling `sendTransaction`, we provide a helper `send` that will open the connect modal before proceeding if the wallet is not connected. For `sign*` and other methods you should check the `kit.defaultAccount` property before trying an operation.

```javascript
import { useContractKit } from '@celo-tools/use-contractkit';

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

## Support

Struggling with anything use-contractkit related? Jump into the [celo-org discord channel](https://discord.gg/6yWMkgM) and ask for help any time.
