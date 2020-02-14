import useWebChatUIContext from './useWebChatUIContext';

export default function useDirFromProps() {
  return [useWebChatUIContext().dir];
}
