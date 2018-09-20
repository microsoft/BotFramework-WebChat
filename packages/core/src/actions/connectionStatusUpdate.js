const CONNECTION_STATUS_UPDATE = 'DIRECT_LINE/CONNECTION_STATUS_UPDATE';

export default function (readyState) {
  return {
    type: CONNECTION_STATUS_UPDATE,
    payload: { readyState }
  };
}

export { CONNECTION_STATUS_UPDATE }
