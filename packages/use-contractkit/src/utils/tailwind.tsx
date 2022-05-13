function transform(css: string) {
  const rules: string[] = css
    .split(/\s/m)
    .map((x) => x.trim())
    .filter(Boolean);

  return rules.join(' ');
}

export default function cls<T extends { [k: string]: string }>(object: T): T {
  return Object.freeze(
    Object.entries(object).reduce((acc, [key, css]: [keyof T, string]) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      acc[key] = transform(css);

      return acc;
    }, {} as T)
  );
}
