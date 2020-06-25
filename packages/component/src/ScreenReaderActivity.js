/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import { css } from 'glamor';
import PropTypes from 'prop-types';
import React from 'react';

import remarkStripMarkdown from './Utils/remarkStripMarkdown';
import useAvatarForBot from './hooks/useAvatarForBot';
import useDateFormatter from './hooks/useDateFormatter';
import useLocalizer from './hooks/useLocalizer';

const ROOT_CSS = css({
  color: 'transparent',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  top: 0,
  whiteSpace: 'nowrap',
  width: 1
});

const ACTIVITY_NUM_ATTACHMENTS_ALT_IDS = {
  few: 'ACTIVITY_NUM_ATTACHMENTS_FEW_ALT',
  many: 'ACTIVITY_NUM_ATTACHMENTS_MANY_ALT',
  one: 'ACTIVITY_NUM_ATTACHMENTS_ONE_ALT',
  other: 'ACTIVITY_NUM_ATTACHMENTS_OTHER_ALT',
  two: 'ACTIVITY_NUM_ATTACHMENTS_TWO_ALT'
};

const ScreenReaderActivity = ({ activity }) => {
  const [{ initials: botInitials }] = useAvatarForBot();
  const formatDate = useDateFormatter();
  const localize = useLocalizer();
  const localizeWithPlural = useLocalizer({ plural: true });

  const {
    attachments = [],
    channelData: { messageBack: { displayText: messageBackDisplayText } = {} } = {},
    from: { role } = {},
    text,
    timestamp
  } = activity;

  const activityDisplayText = messageBackDisplayText || text;
  const fromUser = role === 'user';

  const numAttachmentsAlt =
    !!attachments.length && localizeWithPlural(ACTIVITY_NUM_ATTACHMENTS_ALT_IDS, attachments.length);

  const greetingAlt = (fromUser
    ? localize('ACTIVITY_YOU_SAID_ALT')
    : localize('ACTIVITY_BOT_SAID_ALT', botInitials)
  ).replace(/\s{2,}/gu, ' ');

  const textAlt = remarkStripMarkdown(activityDisplayText).replace(/[.\s]+$/u, '');

  const timestampAlt = localize('ACTIVITY_STATUS_SEND_STATUS_ALT_SENT_AT', formatDate(timestamp));

  return (
    <article aria-atomic={true} aria-roledescription="message" className={ROOT_CSS} role="region">
      <p>
        {/* TODO: Remove "A-B-C", this is for debugging only, identifying which text the screen reader is reading. */}
        <span>
          {'A-B-C '}
          {greetingAlt}
        </span>
        <span>{textAlt}</span>
      </p>
      {numAttachmentsAlt && <p>{numAttachmentsAlt}</p>}
      <p>{timestampAlt}</p>
    </article>
  );
};

ScreenReaderActivity.propTypes = {
  activity: PropTypes.any.isRequired
};

export default ScreenReaderActivity;
