import { useContext } from 'react';
import StatusGroupingContext, { type StatusGroupingContextType } from './StatusGroupingContext';

export default function useStatusGroupingContext(): StatusGroupingContextType {
  return useContext(StatusGroupingContext);
}
