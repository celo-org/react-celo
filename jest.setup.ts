// https://github.com/achingbrain/uint8arrays/issues/21
// https://github.com/inrupt/solid-client-authn-js/issues/1676
// https://github.com/jsdom/jsdom/issues/2524

// Listed some (seemingly) related issues to what I'm encountering

import '@testing-library/jest-dom';

import { TextDecoder, TextEncoder } from 'util';

if (typeof window !== 'undefined' && !('TextEncoder' in window)) {
  Object.defineProperty(window, 'TextEncoder', {
    writable: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    value: TextEncoder,
  });
  Object.defineProperty(window, 'TextDecoder', {
    writable: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    value: TextDecoder,
  });
}
