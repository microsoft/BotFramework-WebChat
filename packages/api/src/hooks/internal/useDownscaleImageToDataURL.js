import useWebChatAPIContext from './useWebChatAPIContext';

export default function useDownscaleImageToDataURL() {
  const { downscaleImageToDataURL } = useWebChatAPIContext();

  return downscaleImageToDataURL;
}
