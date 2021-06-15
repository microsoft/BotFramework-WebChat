import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useTrackDimension(): (name: string, data: any) => void {
  const { trackDimension } = useWebChatAPIContext();

  return trackDimension;
}
