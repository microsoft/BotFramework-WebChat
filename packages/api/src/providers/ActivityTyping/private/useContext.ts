import { useContext } from 'react';
import ActivityTypingContext, { type ActivityTypingContextType } from './Context';

export default function useActivityTypingContext(): ActivityTypingContextType {
  return useContext(ActivityTypingContext);
}
