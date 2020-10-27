import useWebChatAPIContext from './useWebChatAPIContext';

export default function useSetDictateState() {
  return useWebChatAPIContext().setDictateState;
}
