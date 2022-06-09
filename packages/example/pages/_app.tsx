import '@celo/react-celo/lib/styles.css';
import '../styles/global.css';

import { AppProps } from 'next/app';
import Link, { type LinkProps } from 'next/link';
import { PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';

import CeloLogo from '../components/celo-logo';

function MyApp({ Component, pageProps, router }: AppProps): React.ReactElement {
  const StyledLink = (props: PropsWithChildren<LinkProps>) => {
    const active = router.pathname === props.href;
    const activeClass = active ? 'font-semibold' : '';
    return (
      <div className={`hover:text-slate-500 text-slate-900 ${activeClass}`}>
        <Link {...props} />
      </div>
    );
  };

  return (
    <div>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'w-72 md:w-96',
          style: {
            padding: '0px',
          },
        }}
      />
      <div className="max-w-screen-sm mx-auto py-10 px-4">
        <nav className="flex gap-[40px] mt-[20px] mb-[20px] justify-between items-center">
          <div className="flex items-center gap-[5px]">
            <CeloLogo />
            <span className="font-light text-[25px] font-['Philosopher']">
              react-celo
            </span>
          </div>
          <div className="flex gap-[40px]">
            <StyledLink href="/">Home</StyledLink>
            <StyledLink href="/wallet">Wallet example</StyledLink>
            <StyledLink href="/wallet-test-plan">Test plan</StyledLink>
          </div>
        </nav>
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
