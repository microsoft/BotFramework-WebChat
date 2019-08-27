import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useDirectLine() {
  return useContext(WebChatContext).directLine;
}
