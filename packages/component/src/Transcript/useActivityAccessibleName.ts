import { hooks } from 'botframework-webchat-api';
import { useEffect, useMemo, useState } from 'react';
import type { RefObject } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import { SEND_FAILED } from '../types/internal/SendStatus';
import activityAltText from '../Utils/activityAltText';
import tabbableElements from '../Utils/tabbableElements';
import useRenderMarkdownAsHTML from '../hooks/useRenderMarkdownAsHTML';
import useValueRef from '../hooks/internal/useValueRef';

enum InteractiveType {
  LINK,
  WIDGET
}

const { useAvatarForBot, useGetKeyByActivity, useLocalizer, useSendStatusByActivityKey } = hooks;

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
export default function useActivityAccessibleName(activity: WebChatActivity, bodyRef: RefObject<HTMLElement>) {
  const [{ initials: botInitials }] = useAvatarForBot();
  const [interactiveType, setInteractiveType] = useState<InteractiveType | false>(false);
  const [sendStatusByActivityKey] = useSendStatusByActivityKey();
  const fromSelf = activity.from?.role === 'user';
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
  const greetingAlt = useMemo(
    () =>
      (fromSelf ? localize('ACTIVITY_YOU_SAID_ALT') : localize('ACTIVITY_BOT_SAID_ALT', botInitials || '')).replace(
        /\s{2,}/gu,
        ' '
      ),
    [botInitials, fromSelf, localize]
  );
  const interactiveTypeRef = useValueRef(interactiveType);
  const messageTextAlt = useMemo(
    () => activityAltText(activity, renderMarkdownAsHTML),
    [activity, renderMarkdownAsHTML]
  );
  const numAttachmentsAlt = useMemo(
    () => (numAttachments ? localizeWithPlural(ACTIVITY_NUM_ATTACHMENTS_ALT_IDS, numAttachments) : ''),
    [localizeWithPlural, numAttachments]
  );

  const isSendFailed = useMemo(
    () => sendStatusByActivityKey.get(activityKey) === SEND_FAILED,
    [activityKey, sendStatusByActivityKey]
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
        interactiveType || isSendFailed ? activityInteractiveFootNoteAlt : ''
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
      numAttachmentsAlt
    ]
  );

  useEffect(() => {
    const hasLinks = !!bodyRef.current?.querySelector('a');
    const hasWidgets = !!tabbableElements(bodyRef.current).length;

    interactiveTypeRef.current !== hasWidgets &&
      setInteractiveType(hasLinks ? InteractiveType.LINK : hasWidgets ? InteractiveType.WIDGET : false);
  }, [bodyRef, interactiveTypeRef, setInteractiveType]);

  return [accessibleName];
}
