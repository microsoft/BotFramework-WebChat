import { hooks } from 'botframework-webchat-api';
import { useEffect, useMemo, useState } from 'react';
import type { RefObject } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import { SEND_FAILED, SENT } from '../types/internal/SendStatus';
import activityAltText from '../Utils/activityAltText';
import tabbableElements from '../Utils/tabbableElements';
import useRenderMarkdownAsHTML from '../hooks/useRenderMarkdownAsHTML';
import useLocalizeActivityGreetingAlt from '../hooks/internal/useLocalizeActivityGreetingAlt.js';
import useValueRef from '../hooks/internal/useValueRef';

enum InteractiveType {
  LINK,
  WIDGET
}

const { useDateFormatter, useGetKeyByActivity, useLocalizer, useSendStatusByActivityKey } = hooks;

const ACTIVITY_NUM_ATTACHMENTS_ALT_IDS = {
  few: 'ACTIVITY_NUM_ATTACHMENTS_FEW_ALT',
  many: 'ACTIVITY_NUM_ATTACHMENTS_MANY_ALT',
  one: 'ACTIVITY_NUM_ATTACHMENTS_ONE_ALT',
  other: 'ACTIVITY_NUM_ATTACHMENTS_OTHER_ALT',
  two: 'ACTIVITY_NUM_ATTACHMENTS_TWO_ALT'
};

/**
 * Computes accessible name of an activity during transcript navigation.
 *
 * This text should be kept simple and short.
 *
 * Due to a bug in Safari, accessible name for active descendant must be a string but not a DOM element.
 */
export default function useActivityAccessibleName(
  activity: WebChatActivity,
  bodyRef: RefObject<HTMLElement>
): readonly [string] {
  const [interactiveType, setInteractiveType] = useState<InteractiveType | false>(false);
  const [sendStatusByActivityKey] = useSendStatusByActivityKey();
  const formatDate = useDateFormatter();
  const getKeyByActivity = useGetKeyByActivity();
  const localize = useLocalizer();
  const localizeWithPlural = useLocalizer({ plural: true });
  const numAttachments = activity.type === 'message' ? activity.attachments?.length || 0 : 0;
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();

  /** "Click to interact." */
  const activityInteractiveFootNoteAlt = localize('ACTIVITY_INTERACTIVE_FOOTNOTE_ALT');
  /** "Message is interactive." */
  const activityInteractiveReasonInteractiveContentAlt = localize(
    'ACTIVITY_INTERACTIVE_REASON_INTERACTIVE_CONTENT_ALT'
  );
  /** "One or more links in the message." */
  const activityInteractiveReasonLinkAlt = localize('ACTIVITY_INTERACTIVE_REASON_LINK_ALT');
  /** "Send failed." */
  const activityInteractiveReasonSendFailedAlt = localize('ACTIVITY_INTERACTIVE_REASON_SEND_FAILED_ALT');
  const activityKey = useMemo(() => getKeyByActivity(activity), [activity, getKeyByActivity]);
  const [greetingAlt] = useLocalizeActivityGreetingAlt()(activity);
  const interactiveTypeRef = useValueRef(interactiveType);
  const messageTextAlt = useMemo(
    () => activityAltText(activity, renderMarkdownAsHTML),
    [activity, renderMarkdownAsHTML]
  );
  const numAttachmentsAlt = useMemo(
    () => (numAttachments ? localizeWithPlural(ACTIVITY_NUM_ATTACHMENTS_ALT_IDS, numAttachments) : ''),
    [localizeWithPlural, numAttachments]
  );

  // Like the activity status, an activity without a send status is sent, e.g. from the bot.
  const sendStatus = sendStatusByActivityKey.get(activityKey) || SENT;

  const isSendFailed = sendStatus === SEND_FAILED;

  /** "Sent at October 17 at 4:00 PM", only after the activity is sent, like the timestamp in the activity status. */
  const sentAtAlt = useMemo(
    () =>
      activity.timestamp && sendStatus === SENT
        ? localize('ACTIVITY_STATUS_SEND_STATUS_ALT_SENT_AT', formatDate(activity.timestamp))
        : '',
    [activity.timestamp, formatDate, localize, sendStatus]
  );

  const accessibleName = useMemo(
    // We are concatenating in a single string for Safari. If we split it up, Safari will only narrate the first section.
    () =>
      [
        greetingAlt,
        messageTextAlt,
        numAttachmentsAlt,
        isSendFailed ? activityInteractiveReasonSendFailedAlt : '',
        interactiveType === InteractiveType.LINK
          ? activityInteractiveReasonLinkAlt
          : interactiveType === InteractiveType.WIDGET
            ? activityInteractiveReasonInteractiveContentAlt
            : '',
        interactiveType || isSendFailed ? activityInteractiveFootNoteAlt : '',
        sentAtAlt
      ]
        .filter(Boolean)
        .join(' '),
    [
      activityInteractiveFootNoteAlt,
      activityInteractiveReasonInteractiveContentAlt,
      activityInteractiveReasonLinkAlt,
      activityInteractiveReasonSendFailedAlt,
      greetingAlt,
      interactiveType,
      isSendFailed,
      messageTextAlt,
      numAttachmentsAlt,
      sentAtAlt
    ]
  );

  useEffect(() => {
    const hasLinks = !!bodyRef.current?.querySelector('a');
    const hasWidgets = !!tabbableElements(bodyRef.current).length;

    interactiveTypeRef.current !== hasWidgets &&
      setInteractiveType(hasLinks ? InteractiveType.LINK : hasWidgets ? InteractiveType.WIDGET : false);
  }, [bodyRef, interactiveTypeRef, setInteractiveType]);

  return useMemo(() => Object.freeze([accessibleName] as const), [accessibleName]);
}
