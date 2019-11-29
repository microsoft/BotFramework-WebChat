import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useGrammars() {
  return [useWebChatUIContext().grammars];
}
