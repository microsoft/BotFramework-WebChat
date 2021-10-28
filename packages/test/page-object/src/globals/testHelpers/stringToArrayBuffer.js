export default function stringToArrayBuffer(value) {
  const buffer = new ArrayBuffer(value.length * 2); // 2 bytes for each char
  const view = new Uint16Array(buffer);

  for (let i = 0, { length } = value; i < length; i++) {
    const charCode = value.charCodeAt(i);

    if (charCode > 0xffff) {
      throw new Error('Only characters up to 16-bit are supported.');
    }

    // "0 + index" to prevent object injection attack.
    view[0 + i] = charCode;
  }

  return buffer;
}
