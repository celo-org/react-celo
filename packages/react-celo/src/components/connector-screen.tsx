import React, { ReactElement } from 'react';

import cls from '../utils/tailwind';
import useTheme from '../hooks/use-theme';
import Button from './button';

interface Footer {
  url: string;
  CTA?: string;
}
interface NamedFooter extends Footer {
  name: string;
}
interface FooterWithDescription extends Footer {
  name?: never;
  desc: string;
}
interface Props {
  title: string | ReactElement;
  content: ReactElement;
  footer?: NamedFooter | FooterWithDescription;
}

const styles = cls({
  container: `
    tw-flex
    tw-flex-col
    tw-items-stretch
    tw-justify-start
    tw-h-full
    tw-gap-2`,
  title: `
    tw-text-xl
    tw-text-center
    tw-w-4/5
    tw-self-center
    tw-font-medium`,
  contentContainer: `
    tw-flex
    tw-flex-col
    tw-items-center
    tw-flex-grow justify-center`,
  footer: `
    tw-flex
    tw-flex-row
    tw-justify-between
    tw-items-stretch
    tw-text-sm self-end`,
  footerText: `
    tw-font-medium`,
});

export default function ConnectorScreen({ title, content, footer }: Props) {
  const theme = useTheme();

  return (
    <div className={styles.container}>
      <h1 className={styles.title} style={{ color: theme.textSecondary }}>
        {title}
      </h1>
      <div className={styles.contentContainer}>{content}</div>
      {footer && (
        <div className={styles.footer}>
          <div>
            <p
              className={styles.footerText}
              style={{ color: theme.textTertiary }}
            >
              {'desc' in footer ? footer.desc : `Don't have ${footer.name}?`}
            </p>
          </div>
          <div>
            <Button as="a" href={footer.url} target="_blank" rel="noreferrer">
              {footer.CTA || 'GET'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// 296.500
// 248.762
