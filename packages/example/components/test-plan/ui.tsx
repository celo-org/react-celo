import React from 'react';

import { SecondaryButton } from '../buttons';
import { ErrorIcon } from './error-icon';
import { Status } from './useTestStatus';

export function TestTag({ type }: { type: Status }) {
  const getText = (text: Status) => {
    return text.replace('-', ' ');
  };

  return (
    <span role="status" className={`test-tag ${type}`}>
      {getText(type)}
    </span>
  );
}

export function TestBlock({
  status,
  title,
  onRunTest,
  disabledTest,
  children,
}: React.PropsWithChildren<{
  title: string;
  status: Status;
  disabledTest: boolean;
  onRunTest: () => void;
}>) {
  return (
    <div className="test-block dark:text-slate-100">
      <div className="tag-column">
        <TestTag type={status} />
      </div>
      <div className="test-instructions">
        <div className="flex items-center">
          <Header>{title}</Header>
          <SecondaryButton
            className="underline"
            onClick={onRunTest}
            disabled={disabledTest}
            aria-label={`Run ${title}`}
          >
            Run
          </SecondaryButton>
        </div>
        {children}
      </div>
    </div>
  );
}

type HeaderProps = { children: React.ReactNode };
export const Header: React.FC<HeaderProps> = (props) => (
  <h3 className="font-semibold text-base mr-2">{props.children}</h3>
);

export const Text: React.FC = (props) => (
  <div className="text-slate-600 mt-2" {...props} />
);

const ResultContext = React.createContext('');

function useResultContext() {
  const context = React.useContext(ResultContext);
  if (!context) {
    throw new Error('Cannot use this element outside the Result component');
  }
  return context;
}

export function Result(props: React.PropsWithChildren<{ status: Status }>) {
  return (
    <ResultContext.Provider value={props.status}>
      <div className="test-result">{props.children}</div>
    </ResultContext.Provider>
  );
}

type ResultSuccessProps = { children: React.ReactNode };
export const ResultSuccess: React.FC<ResultSuccessProps> = (props) => {
  const context = useResultContext();
  return context === Status.Success ? (
    <p className="text-[#43aa8b] flex items-center gap-[5px]">
      {props.children}
    </p>
  ) : null;
};

type ResultErrorProps = { children: React.ReactNode };

export const ResultError: React.FC<ResultErrorProps> = (props) => {
  const context = useResultContext();
  return context === Status.Failed ? (
    <p className="text-[#f94144] flex items-center gap-[5px]">
      <ErrorIcon /> {props.children}
    </p>
  ) : null;
};

type ResultDefaultProps = { children: React.ReactNode };
export const ResultDefault: React.FC<ResultDefaultProps> = (props) => {
  const context = useResultContext();
  return context === Status.NotStarted || context === Status.Pending ? (
    <>{props.children}</>
  ) : null;
};

Result.Success = ResultSuccess;
Result.Error = ResultError;
Result.Default = ResultDefault;
