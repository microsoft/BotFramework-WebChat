// TODO: [P3] We should obsolete this action in favor of DIRECT_LINE/UPDATE_CONNECTION_STATUS.
//       But today, both actions behave differently, this one only dispatch after connected and not dispatched when disconnected.
const CONNECTION_STATUS_UPDATE = 'DIRECT_LINE/CONNECTION_STATUS_UPDATE';

export default function connectionStatusUpdate(connectionStatus) {
  return {
    type: CONNECTION_STATUS_UPDATE,
    payload: { connectionStatus }
  };
}

export { CONNECTION_STATUS_UPDATE };
