import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useActivityRenderer() {
  return useContext(WebChatContext).activityRenderer;
}
