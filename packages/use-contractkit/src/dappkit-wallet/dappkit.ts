import { ContractSendMethod, CeloTx } from '@celo/connect';
import { CeloContract, ContractKit } from '@celo/contractkit';
import {
  AccountAuthRequest,
  AccountAuthResponseSuccess,
  DappKitRequestMeta,
  DappKitRequestTypes,
  DappKitResponseStatus,
  parseDappkitResponseDeeplink,
  serializeDappKitRequestDeeplink,
  SignTxRequest,
  SignTxResponseSuccess,
  TxToSignParam,
} from '@celo/utils';
import Linking from './linking';
export {
  AccountAuthRequest,
  DappKitRequestMeta,
  serializeDappKitRequestDeeplink,
  SignTxRequest,
} from '@celo/utils';

const localStorageKey = 'use-contractkit/dappkit';
// hack to get around deeplinking issue where new tabs are opened
// and the url hash state is not respected (Note this implementation
// of dappkit doesn't use URL hashes to always force the newtab experience).

console.log('Running', window);
if (typeof window !== 'undefined') {
  console.log(window.location.href);
  const params = new URL(window.location.href).searchParams;
  console.log(params);
  if (params.get('type') && params.get('requestId')) {
    localStorage.setItem(localStorageKey, window.location.href);
    window.close();
  }
}

async function waitForResponse() {
  while (true) {
    const value = localStorage.getItem(localStorageKey);
    if (value) {
      localStorage.removeItem(localStorageKey);
      return value;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export async function waitForAccountAuth(
  requestId: string
): Promise<AccountAuthResponseSuccess> {
  const url = await waitForResponse();
  const dappKitResponse = parseDappkitResponseDeeplink(url);
  if (
    requestId === dappKitResponse.requestId &&
    dappKitResponse.type === DappKitRequestTypes.ACCOUNT_ADDRESS &&
    dappKitResponse.status === DappKitResponseStatus.SUCCESS
  ) {
    return dappKitResponse;
  }

  throw new Error('Unable to parse Valora response');
}

export async function waitForSignedTxs(
  requestId: string
): Promise<SignTxResponseSuccess> {
  const url = await waitForResponse();

  const dappKitResponse = parseDappkitResponseDeeplink(url);
  if (
    requestId === dappKitResponse.requestId &&
    dappKitResponse.type === DappKitRequestTypes.SIGN_TX &&
    dappKitResponse.status === DappKitResponseStatus.SUCCESS
  ) {
    return dappKitResponse;
  }

  console.warn('Unable to parse url', url);
  throw new Error('Unable to parse Valora response');
}

export function requestAccountAddress(meta: DappKitRequestMeta) {
  const deepLink = serializeDappKitRequestDeeplink(AccountAuthRequest(meta));
  Linking.openURL(deepLink);
}

export enum FeeCurrency {
  cUSD = 'cUSD',
  cGLD = 'cGLD',
}

async function getFeeCurrencyContractAddress(
  kit: ContractKit,
  feeCurrency: FeeCurrency
): Promise<string> {
  switch (feeCurrency) {
    case FeeCurrency.cUSD:
      return kit.registry.addressFor(CeloContract.StableToken);
    case FeeCurrency.cGLD:
      return kit.registry.addressFor(CeloContract.GoldToken);
    default:
      return kit.registry.addressFor(CeloContract.StableToken);
  }
}

export async function requestTxSig(
  kit: ContractKit,
  txParams: CeloTx[],
  meta: DappKitRequestMeta
) {
  const baseNonce = await kit.connection.nonce(txParams[0].from as string);
  const txs = await Promise.all(
    txParams.map(async (txParam: CeloTx, index: number) => {
      const feeCurrency = txParam.feeCurrency
        ? txParam.feeCurrency
        : FeeCurrency.cGLD;
      // const feeCurrencyContractAddress = await getFeeCurrencyContractAddress(
      //   kit,
      //   feeCurrency as FeeCurrency
      // );

      const value = txParam.value === undefined ? '0' : txParam.value;

      return {
        txData: txParam.data, // Valora expects this
        estimatedGas: txParam.gas ?? 150000,
        nonce: baseNonce + index,
        feeCurrencyAddress: undefined,
        value,
        ...txParam,
      };
    })
  );

  // @ts-ignore
  const request = SignTxRequest(txs, meta);
  Linking.openURL(serializeDappKitRequestDeeplink(request));
}
