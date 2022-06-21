import { Network } from '../types';

// will look for a network searching first in local storage, then based on what was given.
export function getInitialNetwork(
  networks: Network[],
  defaultNetwork?: string,
  passedNetwork?: Network,
  storedNetwork?: string | null
) {
  if (process.env.NODE_ENV !== 'production' && passedNetwork) {
    console.warn(
      '[react-celo] The `network` prop on CeloProvider has been deprecated, use `defaultNetwork`'
    );
  }
  const network = networks.find((net) => {
    if (storedNetwork) {
      net.name === storedNetwork;
    }

    // TODO:#246 remove when network prop is removed
    if (passedNetwork) {
      return net.name === passedNetwork.name;
    } else {
      return net.name === defaultNetwork;
    }
  });

  if (!network) {
    const name = defaultNetwork || passedNetwork?.name || 'unknown';
    throw new Error(
      `[react-celo] Could not find 'defaultNetwork' (${name}) in 'networks'. 'defaultNetwork' must equal 'network.name' on one of the 'networks' passed to CeloProvider.`
    );
  }

  // ensure for now that we return the original
  if (network.name === passedNetwork?.name) {
    return passedNetwork;
  }

  return network;
}
