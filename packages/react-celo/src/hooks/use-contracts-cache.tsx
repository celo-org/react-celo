import { AddressRegistry } from '@celo/contractkit/lib/address-registry';
import { MiniContractKit } from '@celo/contractkit/lib/mini-kit';
import { useMemo } from 'react';

import { Connector } from '../types';

export type ContractCacheBuilder<K = unknown> = (
  connection: MiniContractKit['connection'],
  registry: AddressRegistry
) => K;

export function useContractsCache(
  buildContractsCache: ContractCacheBuilder | undefined,
  connector: Connector
) {
  return useMemo(() => {
    if (buildContractsCache) {
      return buildContractsCache(
        connector.kit.connection,
        connector.kit.registry
      );
    }
    return;
  }, [buildContractsCache, connector.kit.connection, connector.kit.registry]);
}
