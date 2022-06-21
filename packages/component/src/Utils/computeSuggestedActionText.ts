import type { DirectLineCardAction } from 'botframework-webchat-core';

// Please refer to this article to find out how to compute the "button text" for suggested action.
// https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#card-action
export default function computeSuggestedActionText(cardAction: DirectLineCardAction) {
  // "CardAction" must contains at least image or title.
  const { title } = cardAction as { title?: string };
  const { type, value } = cardAction;

  if (type === 'messageBack') {
    return title || cardAction.displayText;
  } else if (title) {
    return title;
  } else if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
}
