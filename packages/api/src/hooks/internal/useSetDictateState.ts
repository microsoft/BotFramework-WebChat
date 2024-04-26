import useWebChatAPIContext from './useWebChatAPIContext';

export default function useSetDictateState(): (dictateState: number) => void {
  return useWebChatAPIContext().setDictateState;
}
