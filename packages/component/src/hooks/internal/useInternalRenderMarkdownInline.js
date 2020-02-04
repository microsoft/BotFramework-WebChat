import useWebChatUIContext from './useWebChatUIContext';

function useInternalRenderMarkdownInline() {
  const { internalRenderMarkdownInline } = useWebChatUIContext();

  return internalRenderMarkdownInline;
}

export default useInternalRenderMarkdownInline;
