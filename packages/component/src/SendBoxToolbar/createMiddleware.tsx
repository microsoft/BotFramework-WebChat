import { type SendBoxMiddleware } from 'botframework-webchat-api';

import BasicSendBoxToolbar from './BasicSendBoxToolbar';

const createMiddleware = (): readonly SendBoxMiddleware[] => Object.freeze([() => () => () => BasicSendBoxToolbar]);

export default createMiddleware;
