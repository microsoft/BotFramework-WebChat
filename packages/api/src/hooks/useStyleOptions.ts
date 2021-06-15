import { StrictStyleOptions } from '../StyleOptions';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useStyleOptions(): [StrictStyleOptions] {
  return [useWebChatAPIContext().styleOptions];
}
