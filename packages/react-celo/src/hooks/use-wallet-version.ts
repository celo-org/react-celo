// Uncomment with WCV2 support
// import { useEffect, useState } from 'react';
// import fetchWCWallets from './fetchWCWallets';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useWalletVersion(_walletId?: string): number {
  return 1;
}

// Uncomment with WCV2 support
// const VERSION_OVERRIDE: Record<string, number> = Object.freeze({
//   [WalletIds.Valora]: 1,
//   [WalletIds.CeloWallet]: 2,
//   [WalletIds.CeloTerminal]: 2,
//   [WalletIds.CeloDance]: 2,
// });
//
// export function useWalletVersion(walletId?: WalletIdsMaybe<): number> {
//   // TODO: decide if to use v1 or v2 as a default for unknown wallectconnect? Or if to expose both
//   const [version, setVersion] = useState<Maybe<number>>(walletId ? null : 2);
//
//   useEffect(() => {
//     if (!walletId) {
//       return;
//     }
//
//     void fetchWCWallets().then((celoWallets) => {
//       const wallet = celoWallets.find((appEntry) => appEntry.id === walletId);
//       if (wallet) {
//         const versionFromRegistry = Math.max(
//           ...wallet.versions.map((_) => parseInt(_, 10))
//         );
//
//         if (
//           VERSION_OVERRIDE[walletId] &&
//           VERSION_OVERRIDE[walletId] !== versionFromRegistry
//         ) {
//           console.warn(
//             `Override version found in registry(${versionFromRegistry}) by hard-coded version(${VERSION_OVERRIDE[walletId]}) for ${wallet.name}`
//           );
//           setVersion(VERSION_OVERRIDE[walletId]);
//         } else {
//           setVersion(versionFromRegistry);
//         }
//       } else if (!VERSION_OVERRIDE[walletId]) {
//         throw new Error('Unknown wallectconnect wallet');
//       }
//     });
//   }, [walletId]);
//
//   return version;
// }
