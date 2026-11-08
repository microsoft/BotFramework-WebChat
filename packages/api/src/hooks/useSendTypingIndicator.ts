import { useSendBoxContext } from './internal/domains/SendBoxContext';
import useSourceValue from './internal/domains/useSourceValue';

export default function useSendTypingIndicator(): [boolean] {
  return [useSourceValue(useSendBoxContext().sendTypingIndicator)];
}
