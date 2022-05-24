import defaultTheme from '../theme/default';
import { Theme } from '../types';

enum Format {
  Hex,
  Rgb,
}
class Color {
  r: number;
  b: number;
  g: number;
  a: number | null;

  constructor(color: string, alpha?: number) {
    if (color.startsWith('#')) {
      if (color.length === 4) {
        // eg: #fff, #000
        this.r = parseInt(color.slice(1, 2) + color.slice(1, 2), 16);
        this.g = parseInt(color.slice(2, 3) + color.slice(2, 3), 16);
        this.b = parseInt(color.slice(3, 4) + color.slice(3, 4), 16);
      } else {
        // eg: #ffffff, #000000
        this.r = parseInt(color.slice(1, 3), 16);
        this.g = parseInt(color.slice(3, 5), 16);
        this.b = parseInt(color.slice(5, 7), 16);
      }
      this.a =
        typeof alpha === 'number' ? Math.max(0, Math.min(1, alpha)) : null;
    } else if (color.startsWith('rgb')) {
      // eg: rgb(0, 0, 0)
      const values = color.split('(')[1].split(')')[0].split(',');
      this.r = +values[0].trim();
      this.g = +values[1].trim();
      this.b = +values[2].trim();
      // eg: rgba(0, 0, 0, 1)
      this.a = values[3] ? parseFloat(values[3]) : null;

      console.error(
        `[react-celo] RGB(A) values not officially supported, but were translated to hex (${color} -> ${this.toHex()})`
      );
    } else if (color.startsWith('hsl')) {
      // eg: hsl(100, 50%, 75%)
      const values = color.split('(')[1].split(')')[0].split(',');
      const h = parseInt(values[0].trim().replace('deg', ''));
      const s = parseInt(values[1].trim().replace('%', ''));
      let l = parseFloat(values[2].trim().replace('%', ''));

      if (l > 1) {
        l /= 100;
      }

      const a = (s * Math.min(l, 1 - l)) / 100;
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color);
      };
      this.r = f(0);
      this.g = f(8);
      this.b = f(4);

      // eg: hsla(100, 50%, 75%, 0.8)
      this.a = values[3] ? parseFloat(values[3]) : null;

      console.error(
        `[react-celo] HSL(A) values not officially supported, but were translated to hex (${color} -> ${this.toHex()})`
      );
    } else {
      throw new Error(`[react-celo] Malformed color (${color})`);
    }
  }

  toRGB() {
    if (this.a !== null) {
      return `rgba(${this.r}, ${this.g}, ${this.b}, ${Math.max(
        0,
        Math.min(1, this.a)
      )})`;
    }
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  toHex() {
    const hex = [
      this.r.toString(16).padStart(2, '0'),
      this.g.toString(16).padStart(2, '0'),
      this.b.toString(16).padStart(2, '0'),
    ].join('');

    return `#${hex}`;
  }

  toString(format: Format) {
    switch (format) {
      case Format.Hex:
        return this.toHex();
      case Format.Rgb:
        return this.toRGB();
    }
  }
}

export function hexToRGB(hex: string, alpha?: number): string {
  return new Color(hex, alpha).toRGB();
}

export function RGBToHex(rgba: string): string {
  return new Color(rgba).toHex();
}

export function luminance(color: Color) {
  const a = [color.r, color.g, color.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function contrast(a: string, b: string) {
  const colorA = new Color(a);
  const colorB = new Color(b);

  const lum1 = luminance(colorA);
  const lum2 = luminance(colorB);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

export function contrastCheck(theme: Theme) {
  // minimal recommended contrast ratio is 4.
  // or 3 for larger font-sizes

  const textToBg = contrast(theme.background, theme.text);
  if (textToBg <= 4) {
    console.error(
      `[react-celo] potential accessibility error between text and background colors (${textToBg})`
    );
  }
  const textSecondaryToBg = contrast(theme.background, theme.textSecondary);
  if (textSecondaryToBg <= 4) {
    console.error(
      `[react-celo] potential accessibility error between textSecondary and background colors (${textSecondaryToBg})`
    );
  }
  const primaryToSecondary = contrast(theme.background, theme.secondary);
  if (primaryToSecondary <= 3) {
    console.error(
      `[react-celo] potential accessibility error between primary and secondary colors (${primaryToSecondary})`
    );
  }
}

export function fixTheme(theme: Theme) {
  Object.entries(theme).forEach(([key, value]: [string, string]) => {
    if (!(key in defaultTheme.light)) {
      console.error(`[react-celo] Theme key ${key} is not valid.`);
    }
    const _key = key as keyof Theme;
    try {
      const color = new Color(value);
      theme[_key] = color.toHex();
    } catch (e) {
      theme[_key] = '#FF0000';
      console.error(
        `[react-celo] Could not parse theme.${_key} with value ${value}. Replaced it with red!`
      );
    }
  });
}
