import React from 'react';

import useTheme from '../hooks/use-theme';
import { getApplicationLogger } from '../utils/logger';
import cls from '../utils/tailwind';

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
  as: 'a' | 'button' | React.ComponentType<unknown>;
  className?: string;
  style?: Record<string, string | number>;
}

export default function Button({ as, className, style, ...props }: Props) {
  const theme = useTheme();

  const Component = as;

  if (process.env.NODE_ENV !== 'production') {
    if (as !== 'a' && props.href) {
      getApplicationLogger().warn(
        '[a11y]',
        "Potential accessibility error. Got an href on an element which isn't an <a />"
      );
    }
  }

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
