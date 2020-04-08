import { encode } from 'base64-arraybuffer';

import { post } from '../jobs';

export default async function saveFile(filename, arrayBuffer) {
  await post({
    payload: {
      base64: encode(arrayBuffer),
      filename
    },
    type: 'save file'
  });
}
