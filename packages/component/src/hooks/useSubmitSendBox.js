import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useSubmitSendbox() {
  return useWebChatUIContext().submitSendBox;
}
