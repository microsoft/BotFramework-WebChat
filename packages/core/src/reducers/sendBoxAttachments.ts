import { type SendBoxAttachment } from '../types/SendBoxAttachment';
import createRawReducer from './private/createRawReducer';

const sendBoxAttachments = createRawReducer<readonly SendBoxAttachment[]>('sendBoxAttachments', Object.freeze([]));

export default sendBoxAttachments;
