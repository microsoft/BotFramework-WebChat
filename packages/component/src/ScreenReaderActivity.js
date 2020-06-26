/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import { css } from 'glamor';
import PropTypes from 'prop-types';
import React from 'react';

import textFormatToContentType from './Utils/textFormatToContentType';
import useAvatarForBot from './hooks/useAvatarForBot';
import useDateFormatter from './hooks/useDateFormatter';
import useLocalizer from './hooks/useLocalizer';
import useStripMarkdown from './hooks/internal/useStripMarkdown';

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
    textFormat,
    timestamp
  } = activity;

  const fromUser = role === 'user';
  const contentTypeMarkdown = textFormatToContentType(textFormat) === 'text/markdown';
  const displayText = messageBackDisplayText || text;

  const greetingAlt = (fromUser
    ? localize('ACTIVITY_YOU_SAID_ALT')
    : localize('ACTIVITY_BOT_SAID_ALT', botInitials)
  ).replace(/\s{2,}/gu, ' ');
  const numAttachmentsAlt =
    !!attachments.length && localizeWithPlural(ACTIVITY_NUM_ATTACHMENTS_ALT_IDS, attachments.length);
  const textAlt = useStripMarkdown(contentTypeMarkdown && displayText) || displayText;
  const timestampAlt = localize('ACTIVITY_STATUS_SEND_STATUS_ALT_SENT_AT', formatDate(timestamp));

  return (
    <article aria-atomic={true} aria-roledescription="message" className={ROOT_CSS} role="region">
      <p>
        <span>{greetingAlt}</span>
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
