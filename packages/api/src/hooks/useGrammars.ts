import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useGrammars(): [any] {
  return [useWebChatAPIContext().grammars];
}
