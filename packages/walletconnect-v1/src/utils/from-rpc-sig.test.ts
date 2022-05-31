import { fromRpcSig } from './from-rpc-sig';

describe('fromRpcSig', () => {
  const r = Buffer.from(
    '99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9',
    'hex'
  );
  const s = Buffer.from(
    '129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66',
    'hex'
  );
  it('converts', () => {
    const sig =
      '0x99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca661b';

    expect(fromRpcSig(sig)).toMatchObject({
      v: 27,
      r,
      s,
    });
  });
  it('throws when length is short', () => {
    expect(() => fromRpcSig('')).toThrow();
    expect(() =>
      fromRpcSig(
        '0x99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9129ff05af364'
      )
    ).toThrow();
  });

  it('supports EIP-2098', () => {
    const sig =
      '0x99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9929ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66';
    expect(fromRpcSig(sig)).toMatchObject({
      v: 28,
      r,
      s,
    });
  });
});
