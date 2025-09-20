import useWebChatUIContext from './useWebChatUIContext';

export default function useNonce(): readonly [string | undefined] {
  const { nonce } = useWebChatUIContext();

  return Object.freeze([nonce]);
}
