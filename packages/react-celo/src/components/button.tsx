import React from 'react';

import cls from '../utils/tailwind';
import useTheme from '../utils/useTheme';

const styles = cls({
  button: `
    tw-rounded
    tw-px-2
    tw-py-1
    tw-font-medium`,
});

type anchorType = JSX.IntrinsicElements['a'];
type buttonType = JSX.IntrinsicElements['button'];
type extendType = anchorType & buttonType;

interface Props extends extendType {
  as?: 'a' | 'button' | React.ComponentType<unknown>;
  className?: string;
  style?: Record<string, string | number>;
}

export default function Button({
  as = 'button',
  className,
  style,
  ...props
}: Props) {
  const theme = useTheme();

  const Component = as;

  return (
    <Component
      className={`${styles.button} ${className || ''}`}
      style={{
        color: theme.primary,
        background: theme.secondary,
        ...style,
      }}
      {...props}
    />
  );
}
