import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useGrammars() {
  return [useWebChatAPIContext().grammars];
}
