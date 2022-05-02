// import { useMemo } from 'react';

// import { ThemeTokensMapping } from '../constants';
// import { ApplicationTheme, Theme, ThemeTokens } from '../types';
// import { useContractKitInternal } from '../use-contractkit';

// const tokens = Object.values(ThemeTokens);

// function replaceThemeTokens(rule: string, theme: ApplicationTheme): string {
//   for (const token of tokens) {
//     const idx = rule.indexOf(token);
//     if (idx >= 0) {
//       const key: keyof Theme = ThemeTokensMapping[token];
//       const prefix = rule.slice(0, idx); // eg: "hover:", "focus:"

//       return `${prefix}${theme.light[key]} dark:${prefix}${theme.dark[key]}`;
//     }
//   }
//   return rule;
// }

function transform(css: string, _theme?: unknown) {
  const rules: string[] = css
    .split(/\s/m)
    .map((x) => x.trim())
    .filter(Boolean);

  // if (theme) {
  //   rules = rules.map((rule) => replaceThemeTokens(rule, theme));
  // }

  return rules.join(' ');
}

export default function cls<T extends { [k: string]: string }>(
  object: T,
  theme?: unknown
): T {
  return Object.freeze(
    Object.entries(object).reduce((acc, [key, css]: [keyof T, string]) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      acc[key] = transform(css, theme);

      return acc;
    }, {} as T)
  );
}

// export function useTheme<T extends { [k: string]: string }>(classes: T): T {
//   const { theme } = useContractKitInternal();
//   const styles: T = useMemo(() => {
//     return cls(classes, theme);
//   }, [theme, classes]);

//   return styles;
// }
