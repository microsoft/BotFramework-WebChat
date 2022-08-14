import PropTypes from 'prop-types';
import React from 'react';

import computeSuggestedActionText from '../../Utils/computeSuggestedActionText';

import type { DirectLineSuggestedAction } from 'botframework-webchat-core';
import type { VFC } from 'react';

type LiveRegionSuggestedActionsProps = {
  suggestedActions: DirectLineSuggestedAction;
};

const LiveRegionSuggestedActions: VFC<LiveRegionSuggestedActionsProps> = ({ suggestedActions }) =>
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
  );

LiveRegionSuggestedActions.propTypes = {
  suggestedActions: PropTypes.shape({
    actions: PropTypes.array
  }).isRequired
};

export default LiveRegionSuggestedActions;
