import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useOnCardAction() {
  return useContext(WebChatContext).onCardAction;
}
