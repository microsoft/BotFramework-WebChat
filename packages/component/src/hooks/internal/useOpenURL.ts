import { hooks } from 'botframework-webchat-api';
import { useCallback } from 'react';

const { useSendMessage, useSendMessageBack, useSendPostBack } = hooks;

export default function useOpenURL() {
  const sendMessage = useSendMessage();
  const sendMessageBack = useSendMessageBack();
  const sendPostBack = useSendPostBack();

  return useCallback(
    (url: URL): void => {
      const { protocol, searchParams } = url;

      if (protocol === 'ms-directline-imback:') {
        const titleOrValue = searchParams.get('title') || searchParams.get('value');

        if (!titleOrValue) {
          throw new Error('When using "ms-directline-imback:" protocol, parameter "title" or "value" to be set.');
        }

        sendMessage(titleOrValue);
      } else if (protocol === 'ms-directline-messageback:') {
        let value: any;

        if (searchParams.has('value')) {
          const rawValue = searchParams.get('value') as string;

          try {
            value = JSON.parse(rawValue);
          } catch (error) {
            console.warn(
              'botframework-webchat: When using "ms-directline-messageback:" protocol, parameter "value" should be complex type or omitted.'
            );

            value = rawValue;
          }
        }

        sendMessageBack(value, searchParams.get('text') || undefined, searchParams.get('displaytext') || undefined);
      } else if (protocol === 'ms-directline-postback:') {
        const value = searchParams.get('value');

        sendPostBack(
          value &&
            // This is not conform to Bot Framework Direct Line specification.
            // However, this is what PVA is currently using.
            searchParams.get('valuetype') === 'application/json'
            ? JSON.parse(value)
            : value
        );
      } else {
        throw new Error(`Cannot open URL with an unsupported protocol "${protocol}".`);
      }
    },
    [sendMessage, sendMessageBack, sendPostBack]
  );
}
