import {
  Color,
  contrast,
  hexToRGB,
  luminance,
  RGBToHex,
} from '../../src/utils/colors';

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(jest.fn());
  jest.spyOn(console, 'debug').mockImplementation(jest.fn());
  jest.spyOn(console, 'error').mockImplementation(jest.fn());
  jest.spyOn(console, 'warn').mockImplementation(jest.fn());
});

describe('RGBToHex', () => {
  it('converts rgb to hex', () => {
    expect(RGBToHex('rgb(0, 0, 0)')).toEqual('#000000');
    expect(RGBToHex('rgb(255, 0, 0)')).toEqual('#ff0000');
  });
  it('converts rgba to hex, with a warning, and strip the alpha', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(jest.fn());
    expect(RGBToHex('rgba(255, 255, 255, 0.5)')).toEqual('#ffffff80');
    expect(spy).toBeCalled();
  });
});

describe('hexToRGB', () => {
  it('converts hex to rgb', () => {
    expect(hexToRGB('#000000')).toEqual('rgb(0, 0, 0)');
    expect(hexToRGB('#ff0000')).toEqual('rgb(255, 0, 0)');
  });
  it('converts hex to rgba', () => {
    expect(hexToRGB('#000000ff')).toEqual('rgba(0, 0, 0, 1)');
    expect(hexToRGB('#ff0000', 0.5)).toEqual('rgba(255, 0, 0, 0.5)');
  });
});

describe('luminance', () => {
  it('calculates the luminance of one color', () => {
    expect(luminance(new Color('#fff'))).toBe(1);
    expect(luminance(new Color('#000'))).toBe(0);
    const randomColor = '#' + Math.floor(Math.random() * 0xffffff).toString(16);
    expect(luminance(new Color(randomColor))).toBeGreaterThanOrEqual(0);
    expect(luminance(new Color(randomColor))).toBeLessThanOrEqual(1);
  });
});

describe('contrast', () => {
  it('calculates the constrats between two colors', () => {
    expect(contrast(new Color('#fff'), new Color('#000'))).toBe(21);
    expect(contrast(new Color('#000'), new Color('#000'))).toBe(1);
    expect(contrast(new Color('#fff'), new Color('#fff'))).toBe(1);
    expect(contrast(new Color('#fff'), new Color('#444'))).toBe(9.74);
  });
});

describe('Color', () => {
  it('accepts hex', () => {
    const color1 = new Color('#000000');
    expect(color1.r).toEqual(0x00);
    expect(color1.g).toEqual(0x00);
    expect(color1.b).toEqual(0x00);
    expect(color1.a).toEqual(null);
    const color2 = new Color('#f00');
    expect(color2.r).toEqual(0xff);
    expect(color1.g).toEqual(0x00);
    expect(color1.b).toEqual(0x00);
    expect(color1.a).toEqual(null);
    const color3 = new Color('#ffffff80');
    expect(color3.r).toEqual(0xff);
    expect(color3.r).toEqual(0xff);
    expect(color3.r).toEqual(0xff);
    expect(color3.a).toEqual(0.5);
  });
  it('accepts rgb(a)', () => {
    const color1 = new Color('rgb(0, 0, 0)');
    expect(color1.r).toEqual(0x00);
    expect(color1.g).toEqual(0x00);
    expect(color1.b).toEqual(0x00);
    expect(color1.a).toEqual(null);
    const color2 = new Color('rgb(255, 0, 0)');
    expect(color2.r).toEqual(0xff);
    expect(color1.g).toEqual(0x00);
    expect(color1.b).toEqual(0x00);
    expect(color1.a).toEqual(null);
    const color3 = new Color('rgb(255, 255, 255, 0.2)');
    expect(color3.r).toEqual(0xff);
    expect(color3.r).toEqual(0xff);
    expect(color3.r).toEqual(0xff);
    expect(color3.a).toEqual(0.2);
  });
  it('accepts hsl(a)', () => {
    const color1 = new Color('hsl(0, 0, 0)');
    expect(color1.r).toEqual(0x00);
    expect(color1.g).toEqual(0x00);
    expect(color1.b).toEqual(0x00);
    expect(color1.a).toEqual(null);
    const color2 = new Color('hsl(359, 94, 62)');
    expect(color2.r).toEqual(0xf9);
    expect(color2.g).toEqual(0x43);
    expect(color2.b).toEqual(0x46);
    const color3 = new Color('hsl(359, 94, 62, 0.3)');
    expect(color3.r).toEqual(0xf9);
    expect(color3.g).toEqual(0x43);
    expect(color3.b).toEqual(0x46);
    expect(color3.a).toEqual(0.3);
  });
});
