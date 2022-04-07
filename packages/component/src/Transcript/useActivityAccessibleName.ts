import { hooks } from 'botframework-webchat-api';
import { useEffect, useMemo, useState } from 'react';
import type { RefObject } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import activityAltText from '../Utils/activityAltText';
import tabbableElements from '../Utils/tabbableElements';
import useRenderMarkdownAsHTML from '../hooks/useRenderMarkdownAsHTML';
import useValueRef from '../hooks/internal/useValueRef';

enum InteractiveType {
  LINK,
  WIDGET
}

const { useAvatarForBot, useLocalizer } = hooks;

const ACTIVITY_NUM_ATTACHMENTS_ALT_IDS = {
  few: 'ACTIVITY_NUM_ATTACHMENTS_FEW_ALT',
  many: 'ACTIVITY_NUM_ATTACHMENTS_MANY_ALT',
  one: 'ACTIVITY_NUM_ATTACHMENTS_ONE_ALT',
  other: 'ACTIVITY_NUM_ATTACHMENTS_OTHER_ALT',
  two: 'ACTIVITY_NUM_ATTACHMENTS_TWO_ALT'
};

export default function useActivityAccessibleName(activity: WebChatActivity, bodyRef: RefObject<HTMLElement>) {
  const [{ initials: botInitials }] = useAvatarForBot();
  const [interactiveType, setInteractiveType] = useState<InteractiveType | false>(false);
  const fromSelf = activity.from?.role === 'user';
  const localize = useLocalizer();
  const localizeWithPlural = useLocalizer({ plural: true });
  const numAttachments = activity.type === 'message' ? activity.attachments?.length || 0 : 0;
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();

  const activityInteractiveAlt = localize('ACTIVITY_INTERACTIVE_LABEL_ALT'); // "Click to interact."
  const activityInteractiveWithLinkAlt = localize('ACTIVITY_INTERACTIVE_WITH_LINKS_LABEL_ALT'); // "Click to interact."
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

  const accessibleName = useMemo(
    // We are concatenating in a single string for Safari. If we split it up, Safari will only narrate the first section.
    () =>
      `${greetingAlt} ${messageTextAlt} ${numAttachmentsAlt} ${
        interactiveType === InteractiveType.LINK
          ? activityInteractiveWithLinkAlt
          : interactiveType === InteractiveType.WIDGET
          ? activityInteractiveAlt
          : ''
      }`,
    [
      activityInteractiveAlt,
      activityInteractiveWithLinkAlt,
      greetingAlt,
      interactiveType,
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
