import React from 'react';

import cls from '../utils/tailwind';

const styles = cls({
  // see styles.css
  svg: `
    use-ck-spinner
    tw-text-indigo-500 
    dark:tw-text-indigo-500`,
  circle: `
    use-ck-spinner-path
    tw-stroke-current`,
});

interface Props {
  className?: string;
}

export default function Spinner({ className = '' }: Props) {
  return (
    <svg className={`${styles.svg} ${className}`} viewBox="0 0 50 50">
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
