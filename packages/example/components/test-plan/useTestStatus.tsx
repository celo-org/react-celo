import { useCelo } from '@celo/react-celo';
import { useEffect, useMemo, useState } from 'react';

export enum Status {
  NotStarted = 'not-started',
  Success = 'success',
  Error = 'error',
  Pending = 'pending',
}

function hasMessage(error: unknown): error is { message: string } {
  if (!error || typeof error !== 'object') {
    return false;
  }

  return 'message' in error;
}

export const useTestStatus = () => {
  const { address } = useCelo();

  const [status, setStatus] = useState<Status>(Status.NotStarted);

  const set = useMemo(() => {
    return {
      success: () => {
        setStatus(Status.Success);
      },
      error: (error: unknown) => {
        setStatus(Status.Error);

        if (hasMessage(error)) {
          setErrorMessage(error.message);
        } else if (typeof error === 'string') {
          setErrorMessage(error);
        } else {
          setErrorMessage(JSON.stringify(error));
        }
      },
      pending: () => setStatus(Status.Pending),
      notStarted: () => setStatus(Status.NotStarted),
    };
  }, []);

  useEffect(() => {
    if (!address) {
      set.notStarted();
    }

    return () => {
      set.notStarted();
    };
  }, [address, set]);

  const [errorMessage, setErrorMessage] = useState('');

  const wrapActionWithStatus = (action: () => Promise<void>) => async () => {
    set.pending();
    try {
      await action();
      set.success();
    } catch (error) {
      set.error(error);
    }
  };

  return {
    status,
    errorMessage,
    setStatus: set,
    wrapActionWithStatus,
  };
};
