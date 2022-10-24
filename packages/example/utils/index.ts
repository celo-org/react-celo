import { CeloTokenType, StableToken, Token } from '@celo/base/lib/currencies';
import { CeloContract, CeloTokenContract } from '@celo/contractkit/lib/base';

export function getTypedData(chainId: number) {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' },
      ],
    },
    primaryType: 'Mail',
    domain: {
      name: 'Ether Mail',
      version: '1',
      chainId,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    message: {
      from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      },
      to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      },
      contents: 'Hello, Bob!',
    },
  };
}

type FeeTokenMap = { [FeeToken in CeloTokenContract]: CeloTokenType };

export const feeTokenMap: FeeTokenMap = {
  [CeloContract.GoldToken]: Token.CELO,
  [CeloContract.StableToken]: StableToken.cUSD,
  [CeloContract.StableTokenEUR]: StableToken.cEUR,
  [CeloContract.StableTokenBRL]: StableToken.cREAL,
};
