import useWebChatUIContext from './useWebChatUIContext';

function useInternalMarkdownIt() {
  return useWebChatUIContext().internalMarkdownItState;
}

export default useInternalMarkdownIt;
