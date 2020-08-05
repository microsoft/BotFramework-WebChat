import { useCallback } from 'react';

import useTranscriptActivityElementsRef from './useTranscriptActivityElementsRef';

export default function useGetTranscriptActivityElementByID() {
  const [activityElementsRef] = useTranscriptActivityElementsRef();

  return useCallback(
    activityID => {
      const { element } = activityElementsRef.current.find(entry => entry.activityID === activityID) || {};

      return element;
    },
    [activityElementsRef]
  );
}
