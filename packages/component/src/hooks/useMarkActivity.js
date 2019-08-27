import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useMarkActivity() {
  return useContext(WebChatContext).markActivity;
}
