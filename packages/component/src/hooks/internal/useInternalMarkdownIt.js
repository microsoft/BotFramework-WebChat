import useWebChatUIContext from './useWebChatUIContext';

function useInternalMarkdownIt() {
  const { internalMarkdownIt } = useWebChatUIContext();

  return [internalMarkdownIt];
}

export default useInternalMarkdownIt;
