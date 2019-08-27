import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useUsername() {
  return useContext(WebChatContext).username;
}
