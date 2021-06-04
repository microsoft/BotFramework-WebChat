import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useDisabled(): [boolean] {
  return [useWebChatAPIContext().disabled];
}
