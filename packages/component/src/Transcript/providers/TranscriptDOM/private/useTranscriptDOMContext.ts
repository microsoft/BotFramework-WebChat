import { useContext } from 'react';
import TranscriptDOMContext, { type TranscriptDOMContextType } from './TranscriptDOMContext';

export default function useTranscriptDOMContext(): TranscriptDOMContextType {
  return useContext(TranscriptDOMContext);
}
