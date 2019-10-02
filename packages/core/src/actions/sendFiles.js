const SEND_FILES = 'WEB_CHAT/SEND_FILES';

export default function sendFiles(files) {
  return {
    type: SEND_FILES,
    payload: { files }
  };
}

export { SEND_FILES };
