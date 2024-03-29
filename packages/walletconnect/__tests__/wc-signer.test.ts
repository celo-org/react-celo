/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  ensureLeading0x,
  eqAddress,
  privateKeyToAddress,
  privateKeyToPublicKey,
  trimLeading0x,
} from '@celo/utils/lib/address';
import { computeSharedSecret as computeECDHSecret } from '@celo/utils/lib/ecdh';
import { ECIES } from '@celo/utils/lib/ecies';
import {
  verifyEIP712TypedDataSigner,
  verifySignature,
} from '@celo/utils/lib/signatureUtils';
import { recoverTransaction } from '@celo/wallet-base';
import Web3 from 'web3';

import { WalletConnectWallet } from '../src';
import {
  getTestWallet,
  testAddress,
  testPrivateKey,
} from './utils/in-memory-wallet';

const CHAIN_ID = 44787;
const TYPED_DATA = {
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
    chainId: 1,
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
const testTx = {
  from: testAddress,
  to: privateKeyToAddress(
    '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abbdef'
  ),
  chainId: CHAIN_ID,
  value: Web3.utils.toWei('1', 'ether'),
  nonce: 0,
  gas: '10',
  gasPrice: '99',
  feeCurrency: '0x',
  gatewayFeeRecipient: '0x',
  gatewayFee: '0x',
  data: '0xabcdef',
};
const decryptMessage = 'Hello';

describe('WalletConnectWallet tests', () => {
  const wallet = new WalletConnectWallet({
    init: {
      relayUrl: 'wss://relay.walletconnect.com',
      logger: 'error',
    },
    projectId: '3ee9bf02f3a89a03837044fc7cdeb232',
    chainId: 44787,
  });
  const testWallet: {
    init: (uri: string) => void;
    close: () => Promise<void>;
  } = getTestWallet();

  // if (E2E) {
  //   testWallet = getTestWallet();
  // } else {
  //   jest
  //     .spyOn<any, any>(wallet, 'getWalletConnectClient')
  //     .mockImplementation(() => new MockWalletConnectClient());
  // }

  beforeAll(async () => {
    const uri = await wallet.getUri();
    testWallet?.init(uri as string);
    await wallet.init();
    await wallet.hasSession();
  }, 10000);

  afterAll(async () => {
    await wallet.close();
    await testWallet?.close();
    // TODO: bug in WalletConnect V2 ????
    setTimeout(() => {
      process.exit(0);
    }, 10000);
  }, 10000);

  it('getAccounts()', () => {
    const accounts = wallet.getAccounts();
    expect(accounts.length).toBe(1);
    expect(eqAddress(accounts[0], testAddress)).toBe(true);
  });

  describe('operations with an unknown address', () => {
    const unknownAddress = privateKeyToAddress(
      '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abbdef'
    );

    function assertInvalidAddress(e: Error) {
      // dealing with checksum addresses
      expect(e.message.toLowerCase()).toBe(
        `Could not find address ${unknownAddress}`.toLowerCase()
      );
    }

    it('hasAccount()', () => {
      expect(wallet.hasAccount(unknownAddress)).toBeFalsy();
    });

    it('signPersonalMessage()', async () => {
      const hexString = ensureLeading0x(Buffer.from('hello').toString('hex'));
      try {
        await wallet.signPersonalMessage(unknownAddress, hexString);
        throw new Error('Expected exception to be thrown');
      } catch (e: any) {
        assertInvalidAddress(e);
      }
    });

    it('signTypedData()', async () => {
      try {
        await wallet.signTypedData(unknownAddress, TYPED_DATA);
        throw new Error('Expected exception to be thrown');
      } catch (e: any) {
        assertInvalidAddress(e);
      }
    });

    it('signTransaction()', async () => {
      try {
        await wallet.signTransaction({
          ...testTx,
          from: unknownAddress,
        });
        throw new Error('Expected exception to be thrown');
      } catch (e: any) {
        assertInvalidAddress(e);
      }
    });

    it('decrypt()', async () => {
      const encrypted = ECIES.Encrypt(
        Buffer.from(
          trimLeading0x(privateKeyToPublicKey(testPrivateKey)),
          'hex'
        ),
        Buffer.from(decryptMessage)
      );

      try {
        await wallet.decrypt(unknownAddress, encrypted);
        throw new Error('Expected exception to be thrown');
      } catch (e: any) {
        assertInvalidAddress(e);
      }
    });

    it('computeSharedSecret()', async () => {
      const otherPubKey = privateKeyToPublicKey(
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abbdef'
      );
      try {
        await wallet.computeSharedSecret(unknownAddress, otherPubKey);
        throw new Error('Expected exception to be thrown');
      } catch (e: any) {
        assertInvalidAddress(e);
      }
    });
  });

  describe('with a known address', () => {
    it('hasAccount()', () => {
      expect(wallet.hasAccount(testAddress)).toBeTruthy();
    });

    it('signPersonalMessage()', async () => {
      const hexString = ensureLeading0x(Buffer.from('hello').toString('hex'));
      const signedMessage = await wallet.signPersonalMessage(
        testAddress,
        hexString
      );

      expect(signedMessage).not.toBeUndefined();
      const valid = verifySignature(hexString, signedMessage, testAddress);
      expect(valid).toBeTruthy();
    });

    it('signTypedData()', async () => {
      const signedMessage = await wallet.signTypedData(testAddress, TYPED_DATA);

      expect(signedMessage).not.toBeUndefined();
      const valid = verifyEIP712TypedDataSigner(
        TYPED_DATA,
        signedMessage,
        testAddress
      );
      expect(valid).toBeTruthy();
    });

    it('signTransaction()', async () => {
      const signedTx = await wallet.signTransaction(testTx);
      const [, recoveredSigner] = recoverTransaction(signedTx.raw);
      expect(eqAddress(recoveredSigner, testAddress)).toBe(true);
    });

    it('decrypt()', async () => {
      const encrypted = ECIES.Encrypt(
        Buffer.from(
          trimLeading0x(privateKeyToPublicKey(testPrivateKey)),
          'hex'
        ),
        Buffer.from(decryptMessage)
      );

      const decrypted = await wallet.decrypt(testAddress, encrypted);
      expect(decrypted.toString()).toBe(decryptMessage);
    });

    it('computeSharedSecret()', async () => {
      const otherPubKey = privateKeyToPublicKey(
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abbdef'
      );
      const sharedSecret = await wallet.computeSharedSecret(
        testAddress,
        otherPubKey
      );
      expect(sharedSecret).toEqual(
        computeECDHSecret(testPrivateKey, otherPubKey)
      );
    });
  });
});
