import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useStyleSet() {
  return [useWebChatUIContext().styleSet];
}
