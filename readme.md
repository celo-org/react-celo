# use-contractkit

[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/celo-tools/use-contractkit/blob/master/LICENSEs)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/celo-org/use-contractkit/issues)
[![Open Source Love svg1](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![npm version](https://badge.fury.io/js/%40celo-tools%2Fuse-contractkit.png)](https://badge.fury.io/js/%40celo-tools%2Fuse-contractkit)
[![codecov](https://codecov.io/gh/celo-org/use-contractkit/branch/master/graph/badge.svg?token=vy6ALIKLwt)](https://codecov.io/gh/celo-org/use-contractkit)

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
yarn add @celo-tools/use-contractkit @celo/contractkit
```

You can use any `@celo/contractkit` version at least as recent as `1.5.1` including `2.0`.

## Supported wallets

| Wallet                                                                                     |  sendTransaction   |    signTransaction | signTypedData      | signPersonal       |
| ------------------------------------------------------------------------------------------ | :----------------: | -----------------: | ------------------ | ------------------ |
| Plaintext private key                                                                      |                    | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| [Ledger](https://www.ledger.com/)                                                          |                    | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| [WalletConnect](https://walletconnect.org/)                                                |                    | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| [Celo Extension Wallet (Metamask fork)](https://github.com/dsrvlabs/celo-extension-wallet) | :white_check_mark: |                    |                    |                    |

## Basic Usage

### Wrap your application with ContractKitProvider

use-contractkit uses [React's Context.Provider](https://reactjs.org/docs/context.html#contextprovider) under the hood to inject state throughout your application. You need to make sure your application is wrapped with the provider in order to be able to access all the goodies use-contractkit provides.

```javascript
import { ContractKitProvider } from '@celo-tools/use-contractkit';
import '@celo-tools/use-contractkit/lib/styles.css';

function WrappedApp() {
  return (
    <ContractKitProvider
      dapp={{
        name: 'My awesome dApp',
        description: 'My awesome description',
        url: 'https://example.com',
      }}
    >
      <App />
    </ContractKitProvider>
  );
}

function App() {
  // your application code
}
```

### Default wallets and customization

use-contractkit provides a list of default wallets (CeloExtensionWallet, Injected, Ledger, MetaMask, PrivateKey (dev only) and WalletConnect). It can be configured as shown below.

```javascript
<ContractKitProvider
  dapp={{
    name: 'My awesome dApp',
    description: 'My awesome description',
    url: 'https://example.com',
  }}
  connectModal={{
    // This options changes the title of the modal and can be either a string or a react element
    title: <span>Connect your Wallet</span>,
    providersOptions: {
      // This option hides specific wallets from the default list
      hideFromDefaults: [
        SupportedProvider.MetaMask,
        SupportedProvider.PrivateKey,
        SupportedProvider.CeloExtensionWallet,
        SupportedProvider.Valora,
      ],

      // This option hides all default wallets
      hideFromDefaults: true,

      // This option toggles on and off the searchbar
      searchable: true,
    },
  }}
>
  <App />
</ContractKitProvider>
```

You can also add new custom wallets that don't exist in the registry or aren't in our defaults. For now, we only support custom wallets that implement the walletconnect protocol, but more may come in the future. In the example below, we're hiding all wallets except a new custom wallet.

```javascript
<ContractKitProvider
  dapp={{
    name: 'My awesome dApp',
    description: 'My awesome description',
    url: 'https://example.com',
  }}
  connectModal={{
    title: <span>Connect your ExampleWallet</span>,
    providersOptions: {
      hideFromDefaults: true,
      additionalWCWallets: [
        // see https://github.com/WalletConnect/walletconnect-registry/#schema for a schema example
        {
          id: 'example-wallet',
          name: 'Example Wallet',
          description: 'Lorem ipsum',
          homepage: 'https://example.com',
          chains: ['eip:4220'],
          // IMPORTANT
          // This is the version of WC. If more than one version is provided
          // use-contractkit will use the highest one
          versions: ['1', '2'],
          logos: {
            sm: 'https://via.placeholder.com/40/000000/FFFFFF',
            md: 'https://via.placeholder.com/80/000000/FFFFFF',
            lg: 'https://via.placeholder.com/160/000000/FFFFFF',
          },
          app: {
            browser: '...',
            ios: '...',
            android: '...',
            mac: '...',
            windows: '..',
            linux: '...',
          },
          mobile: {
            native: '...',
            universal: '...',
          },
          desktop: {
            native: '...',
            universal: '...',
          },
          metadata: {
            shortName: '...',
            colors: {
              primary: '...',
              secondary: '...',
            },
          },
          responsive: {
            mobileFriendly: true,
            browserFriendly: true,
            mobileOnly: false,
            browserOnly: false,
          },
        },
      ],
    },
  }}
>
  <App />
</ContractKitProvider>
```

### Prompt users to connect their wallet

use-contractkit provides a `connect` function that will open a modal with a list of wallets your user can connect to.

```javascript
import { useContractKit } from '@celo-tools/use-contractkit';

function App() {
  const { connect, address } = useContractKit();

  return (
    <>
      {address ? (
        <div>Connected to {address}</div>
      ) : (
        <button onClick={connect}>Connect wallet</button>
      )}
    </>
  );
}
```

After connecting to an account the `address` property will be set.

### Use ContractKit to read chain data

Now that we've connected to an account and have the users address, we can use the `kit` to query on-chain data:

```javascript
import { useContractKit } from '@celo-tools/use-contractkit';

function App() {
  const { kit, address } = useContractKit();

  async function getAccountSummary() {
    const accounts = await kit.contracts.getAccounts();
    await accounts.getAccountSummary(address);
  }

  return (
    ...
  )
}
```

### Accessing user accounts

The biggest problem when developing DApps is ensuring a Web2 level experience while managing the flaky and often slow nature of blockchains. To that end we've designed use-contractkit in a way to abstract away most of that pain.

Initially connecting to a user's account is one thing, handled via the `connect` function we just mentioned. However once a user has connected to your DApp we can make the experience nicer for them on repeat visits.

#### Last connected account

use-contractkit will remember a user's last connected address when they navigate back to or refresh your DApp. Ensure that when developing your DApp nothing changes in the UI whether or not the user has a `kit.defaultAccount` property set.

```javascript
import { useContractKit } from '@celo-tools/use-contractkit';

const { address } = useContractKit();
```

#### Get a connected account

When a user refreshes or navigates back to your page, they may not necessarily have a connected account any longer, however we shouldn't need to prompt them to login again just to view the page, that can be done only when doing an action.

For that functionality we have the `performActions` and `getConnectedKit` methods. Usage looks a little like this for `getConnectedKit`:

```javascript
import { useContractKit } from '@celo-tools/use-contractkit';

function App() {
  const { getConnectedKit } = useContractKit();

  async function transfer() {
    const kit = await getConnectedKit();
    const cUSD = await kit.contracts.getStableToken();
    await cUSD.transfer('0x...', 10000).sendAndWaitForReceipt();
  }

  return <button onClick={transfer}>Transfer</button>;
}
```

and this for `performActions`:

```javascript
import { useContractKit } from '@celo-tools/use-contractkit';

function App() {
  const { performActions } = useContractKit();

  async function transfer() {
    await performActions(async (kit) => {
      const cUSD = await kit.contracts.getStableToken();
      await cUSD.transfer('0x...', 10000).sendAndWaitForReceipt();
    });
  }

  return <button onClick={transfer}>Transfer</button>;
}
```

The `performActions` method will also take care of displaying a modal to the user telling them to confirm any actions on their connected wallet.

### Network management

use-contractkit provides a `network` variable and an `updateNetwork` function you can use to display the currently connected network as well as switch to a different one (ie. Alfajores, Baklava or Mainnet).

If you'd prefer your DApp to only access a specific network (maybe you're deploying your testnet website at `https://test-app.dapp.name` and your mainnet version at `https://app.dapp.name`) you can pass the network you want to use as a variable into the provider you wrap your application with:

You can also pass in a `network` prop to the `ContractKitProvider` as the default starting network

```javascript
import { ContractKitProvider, Alfajores, NetworkNames } from '@celo-tools/use-contractkit';

function WrappedApp({ Component, pageProps }) {
  return (
    <ContractKitProvider
      ...
      networks={[Alfajores]}
      network={{
        name: NetworkNames.Alfajores,
        rpcUrl: 'https://alfajores-forno.celo-testnet.org',
        graphQl: 'https://alfajores-blockscout.celo-testnet.org/graphiql',
        explorer: 'https://alfajores-blockscout.celo-testnet.org',
        chainId: 44787,
      }}
    >
      <App />
    </ContractKitProvider>
  );
}

function App () {
  ...
}

```

Be sure to check the use-contractkit example application for a showcase of how network management works in more depth. Usually you'll want to show a dropdown to your users allowing them to select the network to connect to.

```javascript
import { useContractKit } from '@celo-tools/use-contractkit';

function App() {
  const { network, updateNetwork } = useContractKit();

  return <div>Currently connected to {network}</div>;
}
```

#### Extending Supported Networks

By default Use-Contractkit only supports Celo Blockchain Networks. You can however extend this to include other chains you choose such as Ethereum, Polygon, Avalanche etc by Passing your array of `Network`s into `ContractKitProvider`. Note this feature is considered experimental and works better with wallets like Metamask.

### Adjust FeeCurrency

use-contractkit provides a `feeCurrency` variable and an `updateFeeCurrency` function you can use to display the currently selected feeCurrency (cUSD, CELO, cEUR). The feeCurrency can also be passed to the provider component. Valid values are `CeloContract.GoldToken`, `CeloContract.StableToken`, `CeloContract.StableTokenEUR`. CeloContract can be imported like so:

`import { CeloTokenContract } from '@celo/contractkit'`

### Dark mode

use-contrackit uses Tailwind for styling, to use the modal in dark mode simply add the class `tw-dark` to the root `<html />` tag of the web page.

## Development

To run use-contractkit locally, simply clone this repository and run:

- `yarn`
- `yarn dev`

A hot reloading server should come up on `localhost:3000`, it's the exact same as what's at [use-contractkit-c-labs.vercel.app](https://use-contractkit-c-labs.vercel.app).

## Support

Struggling with anything use-contractkit related? Jump into the [GitHub Discussions](https://github.com/celo-org/use-contractkit/discussions) or [celo-org discord channel](https://chat.celo.org) and ask for help any time.
