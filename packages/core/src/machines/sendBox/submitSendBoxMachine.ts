import sendMessage from '../../actions/sendMessage';
import setSendBox from '../../actions/setSendBox';
import setSendBoxAttachments from '../../actions/setSendBoxAttachments';
import { SUBMIT_SEND_BOX } from '../../actions/submitSendBox';
import sendBoxAttachmentsSelector from '../../selectors/sendBoxAttachments';
import sendBoxValueSelector from '../../selectors/sendBoxValue';
import { is } from '../private/effects';
import type { Machine } from '../types';

/**
 * `submitSendBoxSaga`: while online, submitting sends the text (trimmed) and the attachments, then clears both.
 *
 * Quirks kept, as the saga: submitting while offline does nothing and keeps the send box; submitting only spaces
 * clears the send box and sends nothing.
 */
const submitSendBoxMachine: Machine = scope =>
  scope.whileOnline((_, online) =>
    online.on(is(SUBMIT_SEND_BOX), ({ payload: { channelData, method } }, worker) => {
      const attachments = worker.select(sendBoxAttachmentsSelector);
      const sendBoxValue = worker.select(sendBoxValueSelector);

      (attachments.length || sendBoxValue) &&
        worker.put(sendMessage(sendBoxValue.trim(), method, { attachments, channelData }), () =>
          worker.put(setSendBox(''), () => worker.put(setSendBoxAttachments(Object.freeze([]))))
        );
    })
  );

export default submitSendBoxMachine;
