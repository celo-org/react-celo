import React from 'react';
import { ErrorIcon } from './error-icon';
import { SecondaryButton } from '../buttons';

import { Status } from './useTestStatus';

export function TestTag({ type }: { type: Status }) {
  const getText = (type: Status) => {
    return type.replace('-', ' ');
  };

  return <span className={`test-tag ${type}`}>{getText(type)}</span>;
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
    <div className="test-block">
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
          >
            Run
          </SecondaryButton>
        </div>
        {children}
      </div>
    </div>
  );
}

export const Header: React.FC = (props) => (
  <h3 className="font-semibold text-2xl" {...props} />
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

export const Success: React.FC = (props) => {
  const context = useResultContext();
  return context === Status.Success ? (
    <p className="text-[#43aa8b]">{props.children}</p>
  ) : null;
};

export const ErrorText: React.FC = (props) => {
  const context = useResultContext();
  return context === Status.Error ? (
    <p className="text-[#f94144]">
      <ErrorIcon /> {props.children}
    </p>
  ) : null;
};

export const Default: React.FC = (props) => {
  const context = useResultContext();
  return context === Status.NotStarted || context === Status.Pending ? (
    <>{props.children}</>
  ) : null;
};

Result.Success = Success;
Result.Error = ErrorText;
Result.Default = Default;
