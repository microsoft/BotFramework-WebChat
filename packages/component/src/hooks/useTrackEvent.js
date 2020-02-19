import { useCallback } from 'react';

import useWebChatUIContext from './internal/useWebChatUIContext';

function isObject(obj) {
  return [].toString.call(obj) === '[object Object]';
}

export default function useTrackEvent() {
  const { onTelemetry } = useWebChatUIContext();

  return useCallback(
    (name, dataOrValue) => {
      if (!name || typeof name !== 'string') {
        return console.warn('botframework-webchat: "name" passed to "useTrackEvent" hook must be a string.');
      }

      const type = typeof dataOrValue;

      if (type !== 'number' && type !== 'undefined' && !isObject(dataOrValue)) {
        return console.warn(
          `botframework-webchat: "dataOrValue" passed to "useTrackEvent" must be of a number, plain object, or undefined. Ignoring event "${type}".`
        );
      }

      onTelemetry && onTelemetry('event', name, dataOrValue);
    },
    [onTelemetry]
  );
}
