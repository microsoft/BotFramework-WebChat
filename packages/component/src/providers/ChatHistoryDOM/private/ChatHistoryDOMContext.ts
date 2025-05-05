import { type MutableRefObject } from 'react';
import createContextAndHook from '../../createContextAndHook';

type ChatHistoryDOMContextType = Readonly<{
  activityElementRef: MutableRefObject<Map<string, HTMLElement>>;
}>;

const { contextComponentType, useContext } = createContextAndHook<ChatHistoryDOMContextType>('ChatHistoryDOMContext');

export default contextComponentType;
export { useContext as useChatHistoryDOMContext, type ChatHistoryDOMContextType };
