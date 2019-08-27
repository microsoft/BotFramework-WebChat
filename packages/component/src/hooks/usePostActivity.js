import { useContext } from 'react';
import WebChatContext from '../Context';

export default function usePostActivity() {
  return useContext(WebChatContext).postActivity;
}
