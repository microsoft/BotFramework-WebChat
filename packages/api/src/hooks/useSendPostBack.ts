import useWebChatAPIContext from './internal/useWebChatAPIContext';
import type { SendPostBackInit } from './internal/WebChatAPIContext';

function useSendPostBack(): (value?: any, init?: SendPostBackInit | undefined) => void {
  return useWebChatAPIContext().sendPostBack;
}

export default useSendPostBack;
export type { SendPostBackInit };
