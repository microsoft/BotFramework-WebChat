export default function concatArrayBuffer(...arrayBuffers) {
  const byteLength = arrayBuffers.reduce((totalByteLength, { byteLength }) => byteLength + totalByteLength, 0);
  const final = new Uint8Array(byteLength);
  let offset = 0;

  arrayBuffers.forEach(arrayBuffer => {
    final.set(new Uint8Array(arrayBuffer), offset);
    offset += arrayBuffer.byteLength;
  });

  return final.buffer;
}
