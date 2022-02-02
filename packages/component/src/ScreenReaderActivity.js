/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Fragment, useMemo } from 'react';

import activityAltText from './Utils/activityAltText';
import useStyleToEmotionObject from './hooks/internal/useStyleToEmotionObject';
import useRenderMarkdownAsHTML from './hooks/useRenderMarkdownAsHTML';

const {
  useAvatarForBot,
  useCreateAttachmentForScreenReaderRenderer,
  useDateFormatter,
  useGetKeyByActivity,
  useLocalizer
} = hooks;

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

const ScreenReaderAttachments = ({ activity, renderAttachments }) => {
  const { attachments = [] } = activity;
  const createAttachmentForScreenReaderRenderer = useCreateAttachmentForScreenReaderRenderer();
  const localizeWithPlural = useLocalizer({ plural: true });

  const attachmentForScreenReaderRenderers = renderAttachments
    ? attachments
        .map(attachment => createAttachmentForScreenReaderRenderer({ activity, attachment }))
        .filter(render => render)
    : [];

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

ScreenReaderAttachments.propTypes = {
  activity: PropTypes.shape({
    attachments: PropTypes.array
  }).isRequired,
  renderAttachments: PropTypes.bool.isRequired
};

// When "renderAttachments" is false, we will not render the content of attachments.
// That means, it will only render "2 attachments", instead of "image attachment".
// This is used in the visual transcript, where we render "Press ENTER to interact."
const ScreenReaderActivity = ({ activity, children, id, renderAttachments }) => {
  const [{ initials: botInitials }] = useAvatarForBot();
  const formatDate = useDateFormatter();
  const getKeyByActivity = useGetKeyByActivity();
  const localize = useLocalizer();
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const textAlt = useMemo(() => activityAltText(activity, renderMarkdownAsHTML), [activity, renderMarkdownAsHTML]);

  const { channelData: { 'webchat:fallback-text': fallbackText } = {}, from: { role } = {}, timestamp } = activity;

  const fromUser = role === 'user';

  const greetingAlt = (
    fromUser ? localize('ACTIVITY_YOU_SAID_ALT') : localize('ACTIVITY_BOT_SAID_ALT', botInitials || '')
  ).replace(/\s{2,}/gu, ' ');

  const timestampAlt = localize('ACTIVITY_STATUS_SEND_STATUS_ALT_SENT_AT', formatDate(timestamp));
  const labelId = useMemo(
    () => `webchat__screen-reader-activity__label-${getKeyByActivity(activity)}`,
    [activity, getKeyByActivity]
  );

  return (
    <article
      aria-atomic={true}
      // Narrator requires the "aria-labelledby" attribute, otherwise, it will only read "aria-roledescription".
      // However, iOS VoiceOver and NVDA both ignore the "aria-labelledby" and read out the whole content, including timestamp.
      aria-labelledby={labelId}
      aria-roledescription="message"
      className={classNames('webchat__screen-reader-activity', rootClassName)}
      // "id" attribute is used by `aria-labelledby`.
      // eslint-disable-next-line react/forbid-dom-props
      id={id}
    >
      {/* "id" attribute is used by `aria-labelledby`. */}
      {/* eslint-disable-next-line react/forbid-dom-props */}
      <p id={labelId}>
        <span>{greetingAlt}</span>
        <span>{textAlt}</span>
      </p>
      {!fallbackText && <ScreenReaderAttachments activity={activity} renderAttachments={renderAttachments} />}
      <p className="webchat__screen-reader-activity__timestamp">{timestampAlt}</p>
      {children}
    </article>
  );
};

ScreenReaderActivity.defaultProps = {
  children: undefined,
  id: undefined,
  renderAttachments: true
};

ScreenReaderActivity.propTypes = {
  activity: PropTypes.any.isRequired,
  children: PropTypes.any,
  id: PropTypes.string,
  renderAttachments: PropTypes.bool
};

export default ScreenReaderActivity;
