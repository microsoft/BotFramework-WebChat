const SEND_FILES = 'WEB_CHAT/SEND_FILES';

// TODO: [P1] We could obsolete this or dispatch { type: SEND_MESSAGE } insetad.
export default function sendFiles(
  files: readonly Readonly<{
    name: string;
    size: number;
    url: string;
    thumbnail?: string;
  }>[]
) {
  return {
    type: SEND_FILES,
    payload: { files }
  };
}

export { SEND_FILES };
