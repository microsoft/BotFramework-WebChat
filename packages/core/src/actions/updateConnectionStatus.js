const UPDATE_CONNECTION_STATUS = 'DIRECT_LINE/UPDATE_CONNECTION_STATUS';

export default function updateConnectionStatus(connectionStatus) {
  return {
    type: UPDATE_CONNECTION_STATUS,
    payload: { connectionStatus }
  };
}

export { UPDATE_CONNECTION_STATUS };
