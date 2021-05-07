import { SupportedProviders } from '../constants';
import { Metamask } from './cew';
import { Ledger } from './ledger';
import { PrivateKey } from './private-key';
import { Valora } from './valora';
import { WalletConnect } from './wallet-connect';

const defaultScreens = {
  [SupportedProviders.Ledger]: Ledger,
  [SupportedProviders.Valora]: Valora,
  [SupportedProviders.WalletConnect]: WalletConnect,
  [SupportedProviders.CeloExtensionWallet]: Metamask,
  [SupportedProviders.PrivateKey]: PrivateKey,
};

export default defaultScreens;
