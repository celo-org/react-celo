import { useCelo } from '@celo/react-celo';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export const useDisabledTest = (): [
  boolean,
  Dispatch<SetStateAction<boolean>>
] => {
  const { address } = useCelo();
  const [disabled, setDisabled] = useState(true);
  useEffect(() => {
    setDisabled(!address);
  }, [address]);

  return [disabled, setDisabled];
};
