import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useSuggestedActionsAccessKey() {
  const { suggestedActionsAccessKey } = useWebChatUIContext();

  return [suggestedActionsAccessKey];
}
