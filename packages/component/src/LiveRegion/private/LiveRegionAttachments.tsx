import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import type { VFC } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

const { useCreateAttachmentForScreenReaderRenderer, useLocalizer } = hooks;

const ACTIVITY_NUM_ATTACHMENTS_ALT_IDS = {
  few: 'ACTIVITY_NUM_ATTACHMENTS_FEW_ALT',
  many: 'ACTIVITY_NUM_ATTACHMENTS_MANY_ALT',
  one: 'ACTIVITY_NUM_ATTACHMENTS_ONE_ALT',
  other: 'ACTIVITY_NUM_ATTACHMENTS_OTHER_ALT',
  two: 'ACTIVITY_NUM_ATTACHMENTS_TWO_ALT'
};

type LiveRegionAttachmentsProps = {
  activity: WebChatActivity & { type: 'message' };
};

const LiveRegionAttachments: VFC<LiveRegionAttachmentsProps> = ({ activity }) => {
  const { attachments = [] } = activity;
  const createAttachmentForScreenReaderRenderer = useCreateAttachmentForScreenReaderRenderer();
  const localizeWithPlural = useLocalizer({ plural: true });

  const attachmentForScreenReaderRenderers = attachments
    .map(attachment => createAttachmentForScreenReaderRenderer({ activity, attachment }))
    .filter(render => render);

  const numGenericAttachments = attachments.length - attachmentForScreenReaderRenderers.length;

  const numAttachmentsAlt =
    !!numGenericAttachments && localizeWithPlural(ACTIVITY_NUM_ATTACHMENTS_ALT_IDS, numGenericAttachments);

  return (
    <Fragment>
      {!!attachmentForScreenReaderRenderers.length && (
        <ul>
          {attachmentForScreenReaderRenderers.map((render, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={index}>{render()}</li>
          ))}
        </ul>
      )}
      {numAttachmentsAlt && <p>{numAttachmentsAlt}</p>}
    </Fragment>
  );
};

LiveRegionAttachments.propTypes = {
  // PropTypes is not fully compatible with TypeScript definition.
  // @ts-ignore
  activity: PropTypes.shape({
    attachments: PropTypes.array,
    type: PropTypes.oneOf(['message'])
  }).isRequired
};

export default LiveRegionAttachments;

export type { LiveRegionAttachmentsProps };
