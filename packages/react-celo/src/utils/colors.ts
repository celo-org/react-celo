import defaultTheme from '../theme/default';
import { Theme } from '../types';

const minmax = (value: number, lowerBound = 0, higherBound = 1) =>
  Math.max(lowerBound, Math.min(higherBound, value));

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

enum Format {
  Hex,
  Rgb,
}
export class Color {
  r: number;
  b: number;
  g: number;
  a: number | null = null;

  constructor(color: string) {
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

        if (color.length === 9) {
          // eg: #ffffff80, #000000ff
          this.a = round2(minmax(parseInt(color.slice(7, 9), 16) / 255));
        }
      }
    } else if (color.startsWith('rgb')) {
      // eg: rgb(0, 0, 0)
      const values = color.split('(')[1].split(')')[0].split(',');
      this.r = parseInt(values[0].trim(), 10);
      this.g = parseInt(values[1].trim(), 10);
      this.b = parseInt(values[2].trim(), 10);

      if (values[3]) {
        // eg: rgba(0, 0, 0, 1)
        this.a = round2(minmax(parseFloat(values[3])));
      }

      console.error(
        `[react-celo] RGB(A) values not officially supported, but were translated to hex (${color} -> ${this.toHex()})`
      );
    } else if (color.startsWith('hsl')) {
      // eg: hsl(100, 50%, 75%)
      const values = color.split('(')[1].split(')')[0].split(',');
      const h = parseInt(values[0].trim().replace('deg', ''), 10);
      const s = parseInt(values[1].trim().replace('%', ''), 10);
      let l = parseFloat(values[2].trim().replace('%', ''));

      if (l > 1) {
        l /= 100;
      }

      const a = (s * Math.min(l, 1 - l)) / 100;
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color + Number.EPSILON);
      };
      this.r = f(0);
      this.g = f(8);
      this.b = f(4);

      if (values[3]) {
        // eg: hsla(100, 50%, 75%, 0.8)
        this.a = round2(minmax(parseFloat(values[3])));
      }

      console.error(
        `[react-celo] HSL(A) values not officially supported, but were translated to hex (${color} -> ${this.toHex()})`
      );
    } else {
      throw new Error(`[react-celo] Malformed color (${color})`);
    }
  }

  opacity(alpha?: number) {
    if (alpha != null) {
      this.a = round2(minmax(alpha));
    }
    return this;
  }

  toRGB() {
    if (this.a !== null) {
      return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  toHex() {
    const hex = [
      this.r.toString(16).padStart(2, '0'),
      this.g.toString(16).padStart(2, '0'),
      this.b.toString(16).padStart(2, '0'),
    ].join('');

    if (this.a !== null) {
      // 0 <= this.a <= 1
      const alpha = Math.round(this.a * 256)
        .toString(16)
        .padStart(2, '0');
      return `#${hex}${alpha}`;
    }

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
  return new Color(hex).opacity(alpha).toRGB();
}

export function RGBToHex(rgba: string): string {
  return new Color(rgba).toHex();
}

// https://en.wikipedia.org/wiki/Relative_luminance#Relative_luminance_and_.22gamma_encoded.22_colorspaces
export function luminance(color: Color) {
  const a = [color.r, color.g, color.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function contrast(a: Color, b: Color) {
  const lum1 = luminance(a);
  const lum2 = luminance(b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return round2((brightest + 0.05) / (darkest + 0.05));
}

export function contrastCheck(theme: Theme) {
  // minimal recommended contrast ratio is 4.
  // or 3 for larger font-sizes

  const textToBg = contrast(new Color(theme.background), new Color(theme.text));
  if (textToBg <= 4) {
    console.error(
      `[react-celo] potential accessibility error between text and background colors (${textToBg})`
    );
  }
  const textSecondaryToBg = contrast(
    new Color(theme.background),
    new Color(theme.textSecondary)
  );
  if (textSecondaryToBg <= 4) {
    console.error(
      `[react-celo] potential accessibility error between textSecondary and background colors (${textSecondaryToBg})`
    );
  }
  const primaryToSecondary = contrast(
    new Color(theme.background),
    new Color(theme.secondary)
  );
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
