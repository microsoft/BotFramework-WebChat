import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import { SET_CLOCK_SKEW_ADJUSTMENT } from '../actions/setClockSkewAdjustment';

export default function clockSkewAdjustment(state = 0, { payload, type }) {
  if (type === INCOMING_ACTIVITY) {
    const {
      activity: { channelData: { clientTimestamp } = {}, timestamp }
    } = payload;

    const clientSendTime = Date.parse(clientTimestamp);
    const serverTime = Date.parse(timestamp);

    if (!isNaN(clientSendTime) && !isNaN(serverTime)) {
      // The adjustment include the latency between the client and the server.
      // This means, the adjustment is always larger than the actual value.
      // And it means, after adjustment, client time will be ahead of server time.
      // And it also means, the user-originated message has higher probability to appear below bot-originated message.
      // Although it has higher probability, if the user-originated message is still sending (i.e. did not echoback with server timestamp yet),
      // the insertion-sort logic will put the bot-originated below the user-originated message.

      state = serverTime - clientSendTime;
    }
  } else if (type === SET_CLOCK_SKEW_ADJUSTMENT) {
    // Currently, this action is for testing purpose only.
    state = payload.value;
  }

  return state;
}
