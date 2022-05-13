import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { ExternalProvider } from '@ethersproject/providers/lib/web3-provider';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Maybe } from './types';
import { useContractKit } from './use-contractkit';
import { useIsMounted } from './utils/useIsMounted';

export const useProvider = (): Web3Provider => {
  const { kit, network } = useContractKit();
  const provider = kit.connection.web3
    .currentProvider as unknown as ExternalProvider;
  const { chainId, name } = network;
  return useMemo(() => {
    return new Web3Provider(provider, { chainId, name });
  }, [provider, chainId, name]);
};

export const useProviderOrSigner = (): Web3Provider | JsonRpcSigner => {
  const { kit } = useContractKit();
  const provider = useProvider();
  return useMemo(() => {
    return kit.connection.defaultAccount
      ? provider.getSigner(kit.connection.defaultAccount)
      : provider;
  }, [provider, kit.connection.defaultAccount]);
};

export const useGetConnectedSigner = (): (() => Promise<JsonRpcSigner>) => {
  const { kit, getConnectedKit, network } = useContractKit();
  const signer = useProviderOrSigner();
  const { chainId, name } = network;

  return useCallback(async () => {
    if (kit.connection.defaultAccount) {
      return signer as JsonRpcSigner;
    }

    const nextKit = await getConnectedKit();
    const nextProvider = nextKit.connection.web3
      .currentProvider as unknown as ExternalProvider;
    return new Web3Provider(nextProvider, { chainId, name }).getSigner(
      nextKit.connection.defaultAccount
    );
  }, [kit.connection.defaultAccount, getConnectedKit, signer, chainId, name]);
};

export const useLazyConnectedSigner = (): {
  signer: Maybe<JsonRpcSigner>;
  address: Maybe<string>;
  getConnectedSigner: () => Promise<JsonRpcSigner>;
} => {
  const isMountedRef = useIsMounted();
  const getConnectedSigner = useGetConnectedSigner();
  const [signer, setSigner] = useState<Maybe<JsonRpcSigner>>(null);
  const getConnectedSignerCb = useCallback(async () => {
    const theSigner = await getConnectedSigner();
    if (isMountedRef.current) {
      setSigner(theSigner);
    }
    return theSigner;
  }, [getConnectedSigner, setSigner, isMountedRef]);
  return {
    signer,
    getConnectedSigner: getConnectedSignerCb,
    address: signer?._address ?? null,
  };
};

export const useConnectedSigner = (): Maybe<JsonRpcSigner> => {
  const getConnectedSigner = useGetConnectedSigner();
  const [signer, setSigner] = useState<Maybe<JsonRpcSigner>>(null);
  useEffect(() => {
    let stale;
    void (async () => {
      const theSigner = await getConnectedSigner();
      if (!stale) {
        setSigner(theSigner);
      }
      setSigner(await getConnectedSigner());
    })();

    return () => {
      stale = true;
    };
  }, [getConnectedSigner]);
  return signer;
};
