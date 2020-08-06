import { useCallback } from 'react';

import useTranscriptRootElementRef from './useTranscriptRootElementRef';

export default function useGetTranscriptScrollableElement() {
  const [rootElementRef] = useTranscriptRootElementRef();

  return useCallback(() => rootElementRef.current.querySelector('.webchat__basic-transcript__scrollable'), [
    rootElementRef
  ]);
}
