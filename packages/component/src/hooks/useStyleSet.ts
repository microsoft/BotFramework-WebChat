import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useStyleSet(): [any] {
  return [useWebChatUIContext().styleSet];
}
