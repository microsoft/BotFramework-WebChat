// @ts-expect-error No @types/simple-update-in
import updateIn from 'simple-update-in';
import type { GlobalScopePonyfill } from '../../types/GlobalScopePonyfill';
import type { WebChatActivity } from '../../types/WebChatActivity';
import getOrgSchemaMessage from '../../utils/getOrgSchemaMessage';

const DIRECT_LINE_PLACEHOLDER_URL =
  'https://docs.botframework.com/static/devportal/client/images/bot-framework-default-placeholder.png';

/**
 * Patches incoming activity.
 *
 * @returns A patched activity.
 */
export default function patchActivity(activity: WebChatActivity, { Date }: GlobalScopePonyfill): WebChatActivity {
  // Direct Line channel will return a placeholder image for the user-uploaded image.
  // As observed, the URL for the placeholder image is https://docs.botframework.com/static/devportal/client/images/bot-framework-default-placeholder.png.
  // To make our code simpler, we are removing the value if "contentUrl" is pointing to a placeholder image.

  // TODO: [P2] #2869 This "contentURL" removal code should be moved to DirectLineJS adapter.

  // Also, if the "contentURL" starts with "blob:", this means the user is uploading a file (the URL is constructed by URL.createObjectURL)
  // Although the copy/reference of the file is temporary in-memory, to make the UX consistent across page refresh, we do not allow the user to re-download the file either.

  activity = updateIn(activity, ['attachments', () => true, 'contentUrl'], (contentUrl: string) => {
    if (contentUrl !== DIRECT_LINE_PLACEHOLDER_URL && !/^blob:/iu.test(contentUrl)) {
      return contentUrl;
    }

    return undefined;
  });

  activity = updateIn(activity, ['channelData'], (channelData: any) => ({ ...channelData }));
  activity = updateIn(activity, ['channelData', 'webChat', 'receivedAt'], () => Date.now());

  const messageEntity = getOrgSchemaMessage(activity.entities ?? []);
  const entityPosition = messageEntity?.position;
  const entityPartOf = messageEntity?.isPartOf?.['@id'];

  if (typeof entityPosition === 'number') {
    activity = updateIn(activity, ['channelData', 'webchat:entity-position'], () => entityPosition);
  }

  if (typeof entityPartOf === 'string') {
    activity = updateIn(activity, ['channelData', 'webchat:entity-part-of'], () => entityPartOf);
  }

  return activity;
}
