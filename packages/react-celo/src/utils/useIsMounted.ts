import { MutableRefObject, useEffect, useRef } from 'react';

export function useIsMounted(): MutableRefObject<boolean> {
  const mountedRef = useRef<boolean>(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  return mountedRef;
}
