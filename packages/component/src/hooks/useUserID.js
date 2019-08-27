import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useUserID() {
  return useContext(WebChatContext).userID;
}
