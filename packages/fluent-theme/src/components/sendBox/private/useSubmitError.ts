import { hooks } from 'botframework-webchat-component';
import { type RefObject, useCallback, useEffect, useMemo, useState } from 'react';
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
  const [error, setError] = useState<SendError | undefined>();
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

  const hasValue = !!message?.trim();

  useEffect(() => {
    if (error === 'empty' && hasValue) {
      setError(undefined);
    }
  }, [error, hasValue]);

  const checkError = useCallback(() => {
    setError(submitErrorRef.current);
  }, [submitErrorRef]);

  return useMemo<Readonly<[RefObject<SendError | undefined>, string | undefined, () => void]>>(
    () => Object.freeze([submitErrorRef, error && errorMessageStringMap.get(error), checkError]),
    [checkError, error, errorMessageStringMap, submitErrorRef]
  );
};

export default useSubmitError;
