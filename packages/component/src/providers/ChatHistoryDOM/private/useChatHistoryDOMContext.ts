import { useContext } from 'react';
import ChatHistoryDOMContext, { type ChatHistoryDOMContextType } from './ChatHistoryDOMContext';

export default function useChatHistoryDOMContext(): ChatHistoryDOMContextType {
  return useContext(ChatHistoryDOMContext);
}
