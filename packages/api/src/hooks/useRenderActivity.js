import { useMemo } from 'react';

import useCreateActivityRendererInternal from './internal/useCreateActivityRendererInternal';

// In the old days, the useRenderActivity() will be called like this:
//
// const renderActivity = useRenderActivity();
// const element = renderActivity({ activity, nextVisibleActivity });

// In the new days, the useCreateActivityRenderer() is a 3-pass function:
//
// const createActivityRenderer = useCreateActivityRenderer();
// const renderActivity = createActivityRenderer({ activity, nextVisibleActivity });
// const element = renderActivity && renderActivity(undefined, { renderActivityStatus, renderAvatar, showCallout });

// Despite deprecation, useRenderActivity() can be retrofitted using useCreateActivityRenderer().

let showDeprecationNotes = true;

/** @deprecated Please use `useCreateActivityRenderer()` instead. */
export default function useRenderActivity(renderAttachment) {
  if (showDeprecationNotes) {
    console.warn(
      'botframework-webchat: "useRenderActivity" is deprecated and will be removed on or after 2022-07-22. Please use "useCreateActivityRenderer()" instead.'
    );

    showDeprecationNotes = false;
  }

  if (typeof renderAttachment !== 'function') {
    throw new Error('botframework-webchat: First argument passed to "useRenderActivity" must be a function.');
  }

  const createActivityRenderer = useCreateActivityRendererInternal(renderAttachment);

  return useMemo(
    () =>
      (renderActivityArg, renderOptions = {}) => {
        const { activity } = renderActivityArg || {};

        if (!activity) {
          throw new Error(
            'botframework-webchat: First argument passed to the callback of useRenderActivity() must contain an "activity" property.'
          );
        }

        const renderActivity = createActivityRenderer(renderActivityArg);

        return !!renderActivity && renderActivity(renderOptions);
      },
    [createActivityRenderer]
  );
}
