import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useGrammars() {
  return useContext(WebChatContext).grammars;
}
