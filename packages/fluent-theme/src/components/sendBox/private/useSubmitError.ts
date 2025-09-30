import { hooks } from 'botframework-webchat';
import { useCallback, useMemo, useState } from 'react';
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

  // TODO: we may want to improve this later e.g. to avoid re-render
  // Reset visible error if there is a value
  const hasValue = !!message?.trim();
  if (error === 'empty' && hasValue) {
    setError(undefined);
  }

  const commitLatestError = useCallback(() => {
    setError(submitErrorRef.current);
    return submitErrorRef.current;
  }, [submitErrorRef]);

  return useMemo<Readonly<[string | undefined, () => typeof submitErrorRef.current]>>(
    () => Object.freeze([error && errorMessageStringMap.get(error), commitLatestError]),
    [error, errorMessageStringMap, commitLatestError]
  );
};

export default useSubmitError;
