import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useTrackDimension() {
  const { trackDimension } = useWebChatAPIContext();

  return trackDimension;
}
