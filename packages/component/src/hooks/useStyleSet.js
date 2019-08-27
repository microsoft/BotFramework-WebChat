import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useStyleSet() {
  return useContext(WebChatContext).styleSet;
}
