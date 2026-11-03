import coreRenderWebChat, { type RenderWebChat } from '../../../renderWebChat';
import { ReactWebChat } from '../component/minimal';

const renderWebChat: RenderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

export { renderWebChat };
