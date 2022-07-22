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
      <div
        className={`bg-rc-violet-light text-rc-violet rounded ${activeClass} px-1 py-1 hover:text-rc-violet-light hover:bg-rc-violet text-center`}
      >
        <Link {...props} />
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-between items-center min-h-screen dark:bg-slate-900">
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'w-72 md:w-96',
          style: {
            padding: '0px',
          },
        }}
      />
      <div className="max-w-screen-sm mx-auto px-4">
        <nav className="flex w-full fixed left-0 z-5 top-0 backdrop-blur-sm bg-rc-mist dark:bg-rc-smog py-2 px-4 gap-[10px] justify-between items-center flex-col md:flex-row lg:flex-row">
          <a href="/">
            <div className="flex items-center gap-[5px]">
              <CeloLogo />
              <span className="font-light text-[25px] font-['Philosopher'] dark:text-white">
                react-celo
              </span>
            </div>
          </a>
          <div className="flex gap-[12px]">
            <StyledLink href="/wallet">Wallet example</StyledLink>
            <StyledLink href="/wallet-test-plan">Test plan</StyledLink>
            <StyledLink href="https://github.com/celo-org/react-celo">
              Github
            </StyledLink>
            <StyledLink href="https://www.npmjs.com/package/@celo/react-celo">
              NPM
            </StyledLink>
          </div>
        </nav>
        <div className="h-20 md:h-14" />
        <Component {...pageProps} />
      </div>
      <footer className="flex gap-[36px] items-center text-white justify-center w-full py-4 px-6 bg-slate-900 mt-8">
        <a
          target="_blank"
          href="https://discord.com/channels/600834479145353243/929644242790383636"
          rel="noreferrer"
        >
          Discord
        </a>
        <a
          target="_blank"
          href="https://github.com/celo-org/react-celo/discussions"
          rel="noreferrer"
        >
          Discussions
        </a>
      </footer>
    </div>
  );
}

export default MyApp;
