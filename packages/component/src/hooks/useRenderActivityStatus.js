import { useMemo } from 'react';

import useCreateActivityStatusRenderer from './useCreateActivityStatusRenderer';

// In the old days, the useRenderActivity() will be called like this:
//
// const element = useRenderActivityStatus({ activity, nextVisibleActivity });

// In the new days, the useCreateActivityRenderer() is a 3-pass function:
//
// const createActivityStatusRenderer = useCreateActivityStatusRenderer();
// const renderActivityStatus = createActivityStatusRenderer({ activity, hideTimestamp });
// const element = renderActivityStatus && renderActivityStatus(undefined);

// Despite deprecation, useRenderActivityStatus() can be retrofitted using useCreateActivityStatusRenderer().

const RETURN_FALSE = () => false;

let showDeprecationNotes = true;

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

    return renderActivityStatus || RETURN_FALSE;
  }, [activity, createActivityStatusRenderer, nextVisibleActivity]);
}
