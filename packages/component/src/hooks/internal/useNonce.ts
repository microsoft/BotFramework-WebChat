import useWebChatUIContext from './useWebChatUIContext';

export default function useNonce(): [string | undefined] {
  const { nonce } = useWebChatUIContext();

  return [nonce];
}
