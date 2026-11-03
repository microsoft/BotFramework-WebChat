import coreRenderWebChat, { type RenderWebChat } from '../../../renderWebChat';
import { ReactWebChat } from '../component/full';

const renderWebChat: RenderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

export { renderWebChat };
