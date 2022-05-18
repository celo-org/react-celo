import React, { useMemo } from 'react';
import { isMobile } from 'react-device-detect';
import { Helmet } from 'react-helmet';

import { useCeloInternal } from '../use-celo';

export default function IOSViewportFix() {
  const { pendingActionCount, connectionCallback } = useCeloInternal();
  const isOpen = pendingActionCount > 0 || Boolean(connectionCallback);

  const tags = useMemo(
    () =>
      isMobile &&
      isOpen && (
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      ),
    [isOpen]
  );
  return <Helmet>{tags}</Helmet>;
}
