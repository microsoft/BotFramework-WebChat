import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useDisabled() {
  return useContext(WebChatContext).disabled;
}
