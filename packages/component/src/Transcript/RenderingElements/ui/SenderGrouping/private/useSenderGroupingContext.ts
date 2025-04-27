import { useContext } from 'react';
import SenderGroupingContext, { type SenderGroupingContextType } from './SenderGroupingContext';

export default function useSenderGroupingContext(): SenderGroupingContextType {
  return useContext(SenderGroupingContext);
}
