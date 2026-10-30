import coreCreateWebChatElementClass, {
  type CreateWebChatElementClassInit,
  type WebChatElementConstructor
} from '../../../element/createWebChatElementClass';
import { ReactWebChat } from '../component/full';

type ReactWebChatProps = Parameters<typeof ReactWebChat>[0];

function createWebChatElementClass(
  init?: CreateWebChatElementClassInit | undefined
): WebChatElementConstructor<ReactWebChatProps> {
  return coreCreateWebChatElementClass(ReactWebChat, init);
}

export { createWebChatElementClass };
