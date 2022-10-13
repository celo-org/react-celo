import { Contract, providers, Signer } from 'ethers';

export default function CoreContractRegistry(
  provider: Signer | providers.Provider
) {
  return new Contract(REGISTRY_CONTRACT_ADDRESS, REGISTRY_ABI, provider);
}

// Registry contract is always predeployed to this address
export const REGISTRY_CONTRACT_ADDRESS =
  '0x000000000000000000000000000000000000ce10';

const REGISTRY_ABI = [
  {
    inputs: [{ internalType: 'bool', name: 'test', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'identifier',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'identifierHash',
        type: 'bytes32',
      },
      { indexed: true, internalType: 'address', name: 'addr', type: 'address' },
    ],
    name: 'RegistryUpdated',
    type: 'event',
  },
  {
    constant: true,
    inputs: [],
    name: 'initialized',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'isOwner',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'registry',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [],
    name: 'initialize',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'string', name: 'identifier', type: 'string' },
      { internalType: 'address', name: 'addr', type: 'address' },
    ],
    name: 'setAddressFor',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { internalType: 'bytes32', name: 'identifierHash', type: 'bytes32' },
    ],
    name: 'getAddressForOrDie',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { internalType: 'bytes32', name: 'identifierHash', type: 'bytes32' },
    ],
    name: 'getAddressFor',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ internalType: 'string', name: 'identifier', type: 'string' }],
    name: 'getAddressForStringOrDie',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ internalType: 'string', name: 'identifier', type: 'string' }],
    name: 'getAddressForString',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'bytes32[]',
        name: 'identifierHashes',
        type: 'bytes32[]',
      },
      { internalType: 'address', name: 'sender', type: 'address' },
    ],
    name: 'isOneOf',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];
