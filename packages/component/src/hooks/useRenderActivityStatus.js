import { useMemo } from 'react';

import useCreateActivityStatusRenderer from './useCreateActivityStatusRenderer';

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
  }, [createActivityStatusRenderer]);
}
