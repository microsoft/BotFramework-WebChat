import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useStyleOptions() {
  return useContext(WebChatContext).styleOptions;
}
