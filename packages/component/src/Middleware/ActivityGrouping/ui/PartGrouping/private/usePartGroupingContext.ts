import { useContext } from 'react';
import PartGroupingContext, { type PartGroupingContextType } from './PartGroupingContext';

export default function usePartGroupingContext(): PartGroupingContextType {
  return useContext(PartGroupingContext);
}
