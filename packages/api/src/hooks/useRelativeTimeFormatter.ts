/* eslint no-magic-numbers: ["error", { "ignore": [1, 5, 24, 48, 60000, 3600000] }] */

import { useMemo } from 'react';

import useDateFormatter from './useDateFormatter';
import useLocalizedGlobalize from './internal/useLocalizedGlobalize';
import useLocalizer from './useLocalizer';
import usePonyfill from './usePonyfill';

// False positive: we are using `Date` as a type.
// eslint-disable-next-line no-restricted-globals
export default function useRelativeTimeFormatter(): (dateOrString: Date | string) => string {
  const [{ Date }] = usePonyfill();
  const [globalize] = useLocalizedGlobalize();
  const formatDate = useDateFormatter();
  const localize = useLocalizer();

  return useMemo(() => {
    const relativeTimeFormatter = globalize.relativeTimeFormatter.bind(globalize);

    return dateOrString => {
      const date = new Date(dateOrString);
      const dateTime = date.getTime();

      if (isNaN(dateTime)) {
        return dateOrString;
      }

      const now = Date.now();
      const deltaInMs = now - dateTime;
      const deltaInMinutes = Math.floor(deltaInMs / 60000);
      const deltaInHours = Math.floor(deltaInMs / 3600000);

      if (deltaInMinutes < 1) {
        return localize('ACTIVITY_STATUS_TIMESTAMP_JUST_NOW');
      } else if (deltaInMinutes === 1) {
        return localize('ACTIVITY_STATUS_TIMESTAMP_ONE_MINUTE_AGO');
      } else if (deltaInHours < 1) {
        return relativeTimeFormatter('minute')(-deltaInMinutes);
      } else if (deltaInHours === 1) {
        return localize('ACTIVITY_STATUS_TIMESTAMP_ONE_HOUR_AGO');
      } else if (deltaInHours < 5) {
        return relativeTimeFormatter('hour')(-deltaInHours);
      } else if (deltaInMs <= 24 * 3_600_000) {
        return localize('ACTIVITY_STATUS_TIMESTAMP_TODAY');
      } else if (deltaInMs <= 48 * 3_600_000) {
        return localize('ACTIVITY_STATUS_TIMESTAMP_YESTERDAY');
      }

      return formatDate(date);
    };
  }, [Date, formatDate, globalize, localize]);
}
