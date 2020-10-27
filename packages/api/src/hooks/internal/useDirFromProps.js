import useWebChatAPIContext from './useWebChatAPIContext';

export default function useDirFromProps() {
  return [useWebChatAPIContext().dir];
}
