const SEND_FILES = 'INPUT/SEND_FILES';

export default function sendFiles(files) {
  return {
    type: SEND_FILES,
    payload: { files }
  };
}

export { SEND_FILES }
