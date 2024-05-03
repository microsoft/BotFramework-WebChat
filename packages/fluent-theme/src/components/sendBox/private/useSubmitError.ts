import { hooks } from 'botframework-webchat-component';
import { type RefObject, useMemo } from 'react';
import { useRefFrom } from 'use-ref-from';

const { useConnectivityStatus, useLocalizer } = hooks;

type ErrorMessageStringMap = ReadonlyMap<SendError, string>;

type SendError = 'empty' | 'offline';

const useSubmitError = ({
  attachments,
  message
}: Readonly<{
  attachments: readonly Readonly<{ blob: Blob | File; thumbnailURL?: URL | undefined }>[];
  message: string;
}>) => {
  const [connectivityStatus] = useConnectivityStatus();
  const localize = useLocalizer();

  const submitErrorRef = useRefFrom<'empty' | 'offline' | undefined>(
    connectivityStatus !== 'connected' && connectivityStatus !== 'reconnected'
      ? 'offline'
      : !message && !attachments.length
        ? 'empty'
        : undefined
  );

  const errorMessageStringMap = useMemo<ErrorMessageStringMap>(
    () =>
      Object.freeze(
        new Map<SendError, string>()
          .set('empty', localize('SEND_BOX_IS_EMPTY_TOOLTIP_ALT'))
          // TODO: [P0] We should add a new string for "Cannot send message while offline."
          .set('offline', localize('CONNECTIVITY_STATUS_ALT_FATAL'))
      ),
    [localize]
  );

  return useMemo<Readonly<[RefObject<SendError | undefined>, string | undefined]>>(
    () => Object.freeze([submitErrorRef, submitErrorRef.current && errorMessageStringMap.get(submitErrorRef.current)]),
    [errorMessageStringMap, submitErrorRef]
  );
};

export default useSubmitError;
