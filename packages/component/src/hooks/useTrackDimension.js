import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useTrackDimension() {
  const { trackDimension } = useWebChatUIContext();

  return trackDimension;
}
