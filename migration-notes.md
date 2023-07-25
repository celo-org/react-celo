# Draft: Migration document from react-celo to rainbowkit

Hello devs 🌱 this is a migration path away from react-celo, formerly known as use-contractkit. With the rise of ethers and viem, came really cool "Modal libraries" to help connect to dapps. This guide will cover [rainbowkit](https://www.rainbowkit.com/) and how to start using it instead of react-celo. This will mention a couple key differences between contractkit+web3, powering react-celo and viem, powering rainbowkit, but a more detailled guide can [be found here](https://github.com/celo-org/celo-monorepo/blob/8e2e2c5c53bd7f7c5df4f2a64974555ad0250615/packages/sdk/contractkit/MIGRATION-TO-VIEM.md)

## Requirements

```bash
npm install @rainbow-me/rainbowkit wagmi viem
```

Optional recommended packages

```bash
npm install @celo/rainbowkit-celo @celo/abis
```

## Initialization

```ts
// react-celo
import { CeloProvider } from '@celo/react-celo';
import '@celo/react-celo/lib/styles.css';

function WrappedApp() {
  return (
    <CeloProvider
      dapp={{
        name: 'My awesome dApp',
        description: 'My awesome description',
        url: 'https://example.com',
        // if you plan on supporting WalletConnect compatible wallets, you need to provide a project ID, you can find it here: https://docs.walletconnect.com/2.0/cloud/relay
        walletConnectProjectId: '123',
      }}
    >
      <App />
    </CeloProvider>
  );
}
```

```ts
// rainbowkit
import celoGroups from '@celo/rainbowkit-celo/lists';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { celo, celoAlfajores } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const { chains, publicClient } = configureChains(
  [celo, celoAlfajores],
  [
    jsonRpcProvider({
      rpc: (chain) => ({ http: chain.rpcUrls.default.http[0] }),
    }),
  ]
);

const connectors = celoGroups({
  chains,
  projectId: '123',
  appName: 'My awesome dApp',
});
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

function WrappedApp() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <App />
      <RainbowKitProvider/>
    </WagmiConfig>
  );
}
```

While this may seem like more boilerplate, and it is, however it's also a lot more flexible since it can handle others chains out of the box, contrary to react-celo.

For example:

```diff
import { configureChains } from 'wagmi';
- import { celo, celoAlfajores } from 'wagmi/chains';
+ import { celo, celoAlfajores, avalanche, mainnet } from 'wagmi/chains';

const { chains, publicClient } = configureChains(
-   [celo, celoAlfajores],
+   [celo, celoAlfajores, mainnet, avalanche],
  ...
);
```

## Basic usage

Here we will cover the most basic interactions your dapp will have to implement to be able to interact with its users: connecting to a wallet, sending a transaction, displaying some chain data.

### Connecting your dapp to a wallet

```ts
// react-celo
import { useCelo } from '@celo/react-celo';

function App() {
  const { connect, address } = useCelo();

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

```ts
// rainbowkit
import { ConnectButton } from '@rainbow-me/rainbowkit';

function App() {
  const { connect, address } = useCelo();

  return <ConnectButton />;
}
```

More details regarding the connect button `props` in the [rainbowkit docs](https://www.rainbowkit.com/docs/connect-button)

### Reading chain data

Firstly, you need to be aware that rainbowkit is a more general library than react-celo ever claimed to be. So it's natural some more specific Celo helpers/boilerplate will need to be implemented on your side. Thankfully, it should be very few, and probably even fewer as time goes.

```ts
// ./use-celo-registry-address.ts
// Helper to interact with the celo registry, abstracted in contractkit
// We will probably add it to rainbowkit-celo, but until then, feel free
// to copy the following snippet in your codebase
import { useContractRead } from 'wagmi';
import { registryABI } from '@celo/abis/types/wagmi';

export default function useCeloRegistryAddress(contractName: string) {
  const { data: address } = useContractRead({
    address: '0x000000000000000000000000000000000000ce10', // constant on mainnet and alfajores
    abi: registryABI,
    functionName: 'getAddressForString',
    args: [contractName],
  });

  if (address && parseInt(address, 16) === 0) {
    return undefined;
  }
  return address;
}
```

You will see in the example below, the paradigm shifts from using imperative async functions to gather data to a more declarative "react-y" style, using hooks.

With rainbowkit using wagmi under the hood, the possiblities are pretty much endless, so here is a straightforward example trying to read data from a contract.

```diff
- import { useCelo } from '@celo/react-celo';
+ import { useAccount } from 'wagmi';
+ import { accountsABI } from '@celo/abis/types/wagmi';
+ import useCeloRegistryAddress from './use-celo-registry-address';

+ function useAccountSummary() {
+     const { isConnected, address } = useAccount();
+     const { data: accountSummary } = useContractRead({
+         address: useCeloRegistryAddress('Accounts'),
+         abi: accountsABI,
+         functionName: 'getAccountSummary',
+     });
+
+     return accountSummary
+ }

function App() {
-  const { kit, address } = useCelo();
-
-  async function getAccountSummary() {
-    const accounts = await kit.contracts.getAccounts();
-    await accounts.getAccountSummary(address);
-  }
+  const accountSummary = useAccountSummary();

  return (
    ...
  )
}
```

### Send a transaction

```ts
// react-celo
import { useCelo } from '@celo/react-celo';

function App() {
  const { performActions } = useCelo();

  async function transfer() {
    await performActions(async (kit) => {
      const cUSD = await kit.contracts.getStableToken();
      await cUSD.transfer('0x...', 10000).sendAndWaitForReceipt();
    });
  }

  return <button onClick={transfer}>Transfer</button>;
}
```

Rainbowkit doesn't support a similar function as `performActions` out of the box, but you may achieve a similar result using `react-modal` and a simple `useState`.

```ts
// rainbowkit
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { StableTokenABI } from '@celo/abis/types/wagmi';
import useCeloRegistryAddress from './use-celo-registry-address';
// optional
import MyCustomModal from './modal';

function App() {
  // optional modal state
  const [isOpen, setIsOpen] = useState(false);

  const { config } = usePrepareContractWrite({
    address: useCeloRegistryAddress('StableToken'),
    abi: StableTokenABI,
    functionName: 'transfer',
    args: ['0x...', 10000],
    onSettle: () => setIsOpen(false),
  });
  const { write } = useContractWrite(config);
  const transfer = useCallback(() => {
    setIsOpen(true);
    write();
  }, [write]);

  return;
  <>
    <button onClick={transfer}>Transfer</button>
    {isOpen && <MyCustomModal />}
  </>;
}
```

### Fee currency

While react-celo provides a `feeCurrency` variable and an `updateFeeCurrency` helper method, this isn't the case for rainbowkit. However, rainbowkit also supports `feeCurrency` out of the box thanks to its Celo-specific block and transactions formatters. You can find an advanced example in the [`rainbowkit-celo` package right here](https://rainbowkit-with-celo.vercel.app/fee-currency).

## Further reading

For more in depth examples and documentation about wagmi specifically, I highly recommend checking out the [extensive documentations of wagmi](https://wagmi.sh/react/getting-started). Rainbowkit also does a good job at documenting their library so make sure to [check it out](https://www.rainbowkit.com/docs/introduction)!

Another interesting application to help you migrate could be StCelo-v2. You can checkout the changes going from react-celo + contractkit to rainbowkit + wagmi + viem in [this pull-request](https://github.com/celo-org/staked-celo-web-app/pull/129).
