import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useUsername(): [string] {
  return [useWebChatAPIContext().username];
}
