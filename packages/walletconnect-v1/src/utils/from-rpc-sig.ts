import { convertBufferToNumber } from '@walletconnect/utils-v1';

export interface ECDSASignature {
  v: number;
  r: Buffer;
  s: Buffer;
}

/**
 *
 * Convert signature format of the `eth_sign` RPC method to signature parameters
 * Borrowed from ethereumjs https://github.com/ethereumjs/ethereumjs-monorepo/blob/ade4233ddffffdd146b386de701762196a8c941c/packages/util/src/signature.ts
 * Copyright ethereumjs License: https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/util/LICENSE
 * NOTE: all because of a bug in geth: https://github.com/ethereum/go-ethereum/issues/2053
 */
export const fromRpcSig = function (sig: string): ECDSASignature {
  const buf: Buffer = stringToBuffer(sig);

  let r: Buffer;
  let s: Buffer;
  let v: number;
  if (buf.length >= 65) {
    r = buf.slice(0, 32);
    s = buf.slice(32, 64);
    v = convertBufferToNumber(buf.slice(64));
  } else if (buf.length === 64) {
    // Compact Signature Representation (https://eips.ethereum.org/EIPS/eip-2098)
    r = buf.slice(0, 32);
    s = buf.slice(32, 64);
    v = convertBufferToNumber(buf.slice(32, 33)) >> 7;
    s[0] &= 0x7f;
  } else {
    throw new Error('Invalid signature length');
  }

  // support both versions of `eth_sign` responses
  if (v < 27) {
    v += 27;
  }

  return {
    v,
    r,
    s,
  };
};

function stringToBuffer(v: string) {
  if (v === null || v === undefined) {
    return Buffer.allocUnsafe(0);
  }

  if (Buffer.isBuffer(v)) {
    return Buffer.from(v);
  }

  if (typeof v === 'string') {
    if (!isHexString(v)) {
      throw new Error(
        `Cannot convert string to buffer. toBuffer only supports 0x-prefixed hex strings and this string was given: ${v}`
      );
    }
    return Buffer.from(padToEven(stripHexPrefix(v)), 'hex');
  }

  throw new Error('invalid type');
}

function stripHexPrefix(value: string) {
  return isHexString(value) ? value.slice(2) : value;
}

function isHexString(str: string) {
  if (typeof str !== 'string') {
    throw new Error(
      `[stripHexPrefix] input must be type 'string', received ${typeof str}`
    );
  }
  return str.startsWith('0x');
}

function padToEven(value: string) {
  if (value.length % 2) {
    return `0${value}`;
  }

  return value;
}
