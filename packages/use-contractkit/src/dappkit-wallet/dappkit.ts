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

// hack to get around dappkit issue where new tabs are opened
// and the url hash state is not respected (Note this implementation
// of dappkit doesn't use URL hashes to always force the newtab experience).
if (typeof window !== 'undefined') {
  const params = new URL(window.location.href).searchParams;
  if (params.get('type') && params.get('requestId')) {
    localStorage.setItem('dappkit', window.location.href);
    window.close();
  }
}

export function listenToAccount(callback: (account: string) => void) {
  return Linking.addEventListener('url', ({ url }: { url: string }) => {
    try {
      const dappKitResponse = parseDappkitResponseDeeplink(url);
      if (
        dappKitResponse.type === DappKitRequestTypes.ACCOUNT_ADDRESS &&
        dappKitResponse.status === DappKitResponseStatus.SUCCESS
      ) {
        callback(dappKitResponse.address);
      }
    } catch (error) {}
  });
}

export async function waitForAccountAuth(
  requestId: string
): Promise<AccountAuthResponseSuccess> {
  while (true) {
    const url = localStorage.getItem('dappkit');
    if (url) {
      try {
        const dappKitResponse = parseDappkitResponseDeeplink(url);
        if (
          requestId === dappKitResponse.requestId &&
          dappKitResponse.type === DappKitRequestTypes.ACCOUNT_ADDRESS &&
          dappKitResponse.status === DappKitResponseStatus.SUCCESS
        ) {
          return dappKitResponse;
        }
      } catch (e) {
        console.log('Unable to parse response', e);
      } finally {
        localStorage.removeItem('dappkit');
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export function waitForSignedTxs(
  requestId: string
): Promise<SignTxResponseSuccess> {
  return new Promise((resolve, reject) => {
    const handler = ({ url }: { url: string }) => {
      try {
        const dappKitResponse = parseDappkitResponseDeeplink(url);
        if (
          requestId === dappKitResponse.requestId &&
          dappKitResponse.type === DappKitRequestTypes.SIGN_TX &&
          dappKitResponse.status === DappKitResponseStatus.SUCCESS
        ) {
          Linking.removeEventListener('url', handler);
          resolve(dappKitResponse);
        }
      } catch (error) {
        reject(error);
      }
    };
    Linking.addEventListener('url', handler);
  });
}

export function listenToSignedTxs(callback: (signedTxs: string[]) => void) {
  return Linking.addEventListener('url', ({ url }: { url: string }) => {
    try {
      const dappKitResponse = parseDappkitResponseDeeplink(url);
      if (
        dappKitResponse.type === DappKitRequestTypes.SIGN_TX &&
        dappKitResponse.status === DappKitResponseStatus.SUCCESS
      ) {
        callback(dappKitResponse.rawTxs);
      }
    } catch (error) {}
  });
}

export function requestAccountAddress(meta: DappKitRequestMeta) {
  const deepLink = serializeDappKitRequestDeeplink(AccountAuthRequest(meta));
  console.log('>>> deepLink', deepLink);
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
  // TODO: For multi-tx payloads, we for now just assume the same from address for all txs. We should apply a better heuristic
  // @ts-ignore
  const baseNonce = await kit.connection.nonce(txParams[0].from);
  const txs = await Promise.all(
    txParams.map(async (txParam: any, index: number) => {
      const feeCurrency = txParam.feeCurrency
        ? txParam.feeCurrency
        : FeeCurrency.cGLD;
      const feeCurrencyContractAddress = await getFeeCurrencyContractAddress(
        kit,
        feeCurrency
      );

      const value = txParam.value === undefined ? '0' : txParam.value;

      const estimatedTxParams = {
        feeCurrency: feeCurrencyContractAddress,
        from: txParam.from,
        value,
      } as any;
      const estimatedGas = 100000000;
      // txParam.estimatedGas === undefined
      //   ? await txParam.tx.estimateGas(estimatedTxParams)
      //   : txParam.estimatedGas;

      return {
        txData: txParam.data, // Valora expects this
        estimatedGas,
        nonce: baseNonce + index,
        feeCurrencyAddress: feeCurrencyContractAddress,
        value,
        ...txParam,
      };
    })
  );
  console.log(JSON.stringify(txs));
  const request = SignTxRequest(txs, meta);

  Linking.openURL(serializeDappKitRequestDeeplink(request));
}
