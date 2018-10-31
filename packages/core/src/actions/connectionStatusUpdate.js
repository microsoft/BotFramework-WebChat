const CONNECTION_STATUS_UPDATE = 'DIRECT_LINE/CONNECTION_STATUS_UPDATE';

export default function (connectionStatus) {
  return {
    type: CONNECTION_STATUS_UPDATE,
    payload: { connectionStatus }
  };
}

export { CONNECTION_STATUS_UPDATE }
