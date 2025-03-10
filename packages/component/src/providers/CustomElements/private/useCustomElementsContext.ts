import { useContext } from 'react';
import CustomElementsContext, { type CustomElementsContextType } from './CustomElementsContext';

export default function useCustomElementsContext(): CustomElementsContextType {
  return useContext(CustomElementsContext);
}
