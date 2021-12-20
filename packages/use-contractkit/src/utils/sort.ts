import { Provider } from '../types';

export type SortingPredicate<T> = (a: T, b: T) => -1 | 0 | 1;

export const sortString: SortingPredicate<string> = (a, b) => {
  const A = a.toUpperCase();
  const B = b.toUpperCase();

  if (A < B) return -1;
  if (A > B) return 1;
  return 0;
};

export const sortByPriority: SortingPredicate<Provider> = (a, b) => {
  const A = a.listPriority();
  const B = b.listPriority();

  if (A < B) return -1;
  if (A > B) return 1;
  return 0;
};

export const sortByWCId: SortingPredicate<Provider> = (a, b) => {
  if (a.walletConnectRegistryId && !b.walletConnectRegistryId) return 1;
  if (!a.walletConnectRegistryId && b.walletConnectRegistryId) return -1;
  return 0;
};

export const defaultProviderSort: SortingPredicate<Provider> = (a, b) => {
  return sortByPriority(a, b) || sortByWCId(a, b) || sortString(a.name, b.name);
};
