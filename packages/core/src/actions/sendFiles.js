const SEND_FILES = 'WEB_CHAT/SEND_FILES';

export default function sendFiles(files, thumbnails) {
  return {
    type: SEND_FILES,
    payload: { files, thumbnails }
  };
}

export { SEND_FILES };
