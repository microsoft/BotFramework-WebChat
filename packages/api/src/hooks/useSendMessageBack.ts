import type { SendMessageBackActionFactoryInit } from 'botframework-webchat-core';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

type SendMessageBackInit = SendMessageBackActionFactoryInit;

export default function useSendMessageBack(): (
  value: any,
  text?: string | undefined,
  displayText?: string | undefined,
  init?: SendMessageBackInit | undefined
) => void {
  return useWebChatAPIContext().sendMessageBack;
}
