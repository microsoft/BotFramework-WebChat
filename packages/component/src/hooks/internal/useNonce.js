import useWebChatUIContext from './useWebChatUIContext';

export default function useNonce() {
  const { nonce } = useWebChatUIContext();

  return [nonce];
}
