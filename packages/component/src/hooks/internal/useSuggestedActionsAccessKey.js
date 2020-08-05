import useWebChatUIContext from './useWebChatUIContext';

export default function useSuggestedActionsAccessKey() {
  const { suggestedActionsAccessKey } = useWebChatUIContext();

  return [suggestedActionsAccessKey];
}
