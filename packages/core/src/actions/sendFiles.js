const SEND_FILES = 'WEB_CHAT/SEND_FILES';

export default function sendFiles(files, text) {
  return {
    type: SEND_FILES,
    payload: { files, text }
  };
}

export { SEND_FILES };
