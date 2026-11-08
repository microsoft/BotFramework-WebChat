import { useSendBoxContext } from './internal/domains/SendBoxContext';
import useSourceValue from './internal/domains/useSourceValue';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendBoxValue(): [string, (value: string) => void] {
  return [useSourceValue(useSendBoxContext().value), useWebChatAPIContext().setSendBox];
}
