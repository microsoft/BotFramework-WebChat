/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import textFormatToContentType from './Utils/textFormatToContentType';
import useStripMarkdown from './hooks/internal/useStripMarkdown';
import useStyleToEmotionObject from './hooks/internal/useStyleToEmotionObject';

const { useAvatarForBot, useCreateAttachmentForScreenReaderRenderer, useDateFormatter, useLocalizer } = hooks;

const ROOT_STYLE = {
  '&.webchat__screen-reader-activity': {
    color: 'transparent',
    height: 1,
    opacity: 0,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    whiteSpace: 'nowrap',
    width: 1
  }
};

const ACTIVITY_NUM_ATTACHMENTS_ALT_IDS = {
  few: 'ACTIVITY_NUM_ATTACHMENTS_FEW_ALT',
  many: 'ACTIVITY_NUM_ATTACHMENTS_MANY_ALT',
  one: 'ACTIVITY_NUM_ATTACHMENTS_ONE_ALT',
  other: 'ACTIVITY_NUM_ATTACHMENTS_OTHER_ALT',
  two: 'ACTIVITY_NUM_ATTACHMENTS_TWO_ALT'
};

const ScreenReaderActivity = ({ activity }) => {
  const [{ initials: botInitials }] = useAvatarForBot();
  const createAttachmentForScreenReaderRenderer = useCreateAttachmentForScreenReaderRenderer();
  const formatDate = useDateFormatter();
  const localize = useLocalizer();
  const localizeWithPlural = useLocalizer({ plural: true });
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

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

  const attachmentForScreenReaderRenderers = attachments
    .map(attachment => createAttachmentForScreenReaderRenderer({ activity, attachment }))
    .filter(render => render);

  const greetingAlt = (fromUser
    ? localize('ACTIVITY_YOU_SAID_ALT')
    : localize('ACTIVITY_BOT_SAID_ALT', botInitials || '')
  ).replace(/\s{2,}/gu, ' ');
  const numGenericAttachments = attachments.length - attachmentForScreenReaderRenderers.length;

  const numAttachmentsAlt =
    !!numGenericAttachments && localizeWithPlural(ACTIVITY_NUM_ATTACHMENTS_ALT_IDS, numGenericAttachments);
  const textAlt = useStripMarkdown(contentTypeMarkdown && displayText) || displayText;
  const timestampAlt = localize('ACTIVITY_STATUS_SEND_STATUS_ALT_SENT_AT', formatDate(timestamp));

  return (
    <article
      aria-atomic={true}
      aria-roledescription="message"
      className={classNames('webchat__screen-reader-activity', rootClassName)}
      role="region"
    >
      <p>
        <span>{greetingAlt}</span>
        <span>{textAlt}</span>
      </p>
      {!!attachmentForScreenReaderRenderers.length && (
        <ul>
          {attachmentForScreenReaderRenderers.map((render, index) => (
            <li key={index}>{render()}</li>
          ))}
        </ul>
      )}
      {numAttachmentsAlt && <p>{numAttachmentsAlt}</p>}
      <p className="webchat__screen-reader-activity__timestamp">{timestampAlt}</p>
    </article>
  );
};

ScreenReaderActivity.propTypes = {
  activity: PropTypes.any.isRequired
};

export default ScreenReaderActivity;
