import useWebChatAPIContext from './useWebChatAPIContext';

export default function useErrorBoxClass() {
  const { internalErrorBoxClass } = useWebChatAPIContext();

  return [internalErrorBoxClass];
}
