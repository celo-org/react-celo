import React from 'react';

import cls from '../utils/tailwind';
import useTheme from '../utils/useTheme';

const styles = cls({
  // see styles.css
  svg: `
    use-ck-spinner`,
  circle: `
    use-ck-spinner-path
    tw-stroke-current`,
});

interface Props {
  className?: string;
  style?: Record<string, string | number>;
}

export default function Spinner({ className = '', style = {} }: Props) {
  const theme = useTheme();
  return (
    <svg
      className={`${styles.svg} ${className}`}
      style={{
        color: theme.primary,
        ...style,
      }}
      viewBox="0 0 50 50"
    >
      <circle
        className={styles.circle}
        cx={25}
        cy={25}
        r={20}
        strokeWidth="5"
        fill="none"
      />
    </svg>
  );
}
