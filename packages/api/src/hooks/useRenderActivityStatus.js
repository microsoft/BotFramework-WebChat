import { useMemo } from 'react';

import useCreateActivityStatusRenderer from './useCreateActivityStatusRenderer';

// Previously, useRenderActivity() was called like this:
//
// const element = useRenderActivityStatus({ activity, nextVisibleActivity });

// Now, the useCreateActivityRenderer() is a 3-pass function:
//
// const createActivityStatusRenderer = useCreateActivityStatusRenderer();
// const renderActivityStatus = createActivityStatusRenderer({ activity, hideTimestamp });
// const element = renderActivityStatus && renderActivityStatus(undefined);

// Despite deprecation, useRenderActivityStatus() can be retrofitted using useCreateActivityStatusRenderer().

let showDeprecationNotes = true;

/** @deprecated Please use `useCreateActivityStatusRenderer()` instead. */
export default function useRenderActivityStatus({ activity, nextVisibleActivity }) {
  if (showDeprecationNotes) {
    console.warn(
      'botframework-webchat: "useRenderActivityStatus" is deprecated and will be removed on or after 2022-07-22. Please use "useCreateActivityStatusRenderer()" instead.'
    );

    showDeprecationNotes = false;
  }

  const createActivityStatusRenderer = useCreateActivityStatusRenderer();

  return useMemo(() => {
    const renderActivityStatus = createActivityStatusRenderer({ activity, nextVisibleActivity });

    return !!renderActivityStatus && renderActivityStatus;
  }, [activity, createActivityStatusRenderer, nextVisibleActivity]);
}
