import React, { memo } from 'react';
import { any, array, object, pipe, readonly, type InferInput } from 'valibot';

import computeSuggestedActionText from '../../Utils/computeSuggestedActionText';
import parseProps from '../../Utils/parseProps';

const liveRegionSuggestedActionsPropSchema = pipe(
  object({
    suggestedActions: pipe(
      object({
        actions: pipe(array(any()), readonly())
      }),
      readonly()
    )
  }),
  readonly()
);

type LiveRegionSuggestedActionsProps = InferInput<typeof liveRegionSuggestedActionsPropSchema>;

function LiveRegionSuggestedActions(props: LiveRegionSuggestedActionsProps) {
  const { suggestedActions } = parseProps(liveRegionSuggestedActionsPropSchema, props);

  return (
    suggestedActions.actions?.length && (
      <p className="webchat__live-region-activity__suggested-actions">
        {suggestedActions.actions.map((action, index) => (
          // Direct Line schema does not have key other than index.
          // eslint-disable-next-line react/no-array-index-key
          <button className="webchat__live-region-activity__suggested-action" key={index} tabIndex={-1} type="button">
            {computeSuggestedActionText(action)}
          </button>
        ))}
      </p>
    )
  );
}

export default memo(LiveRegionSuggestedActions);
export { liveRegionSuggestedActionsPropSchema, type LiveRegionSuggestedActionsProps };
