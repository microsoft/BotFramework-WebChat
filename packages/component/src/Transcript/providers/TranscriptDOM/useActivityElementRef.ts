import { type RefObject } from 'react';
import useTranscriptDOMContext from './private/useTranscriptDOMContext';

export default function useActivityElementMapRef(): RefObject<Map<string, HTMLElement>> {
  return useTranscriptDOMContext().activityElementRef;
}
