import { toByteArray } from 'base64-js';

const PATTERN = /^data:([^,]*?)(;(base64)){0,1},([A-Za-z0-9+/=]+)/u;

const DEFAULT_CONTENT_TYPE = 'text/plain;charset=US-ASCII';

export function parse(dataURI) {
  const match = PATTERN.exec(dataURI);

  if (!match) {
    return;
  }

  const [, contentType, , encoding, base64] = match;

  if (encoding !== 'base64') {
    return;
  }

  return { base64, contentType: contentType || DEFAULT_CONTENT_TYPE, encoding };
}

export default function readDataURIToBlob(dataURI) {
  const parsed = parse(dataURI);

  if (!parsed) {
    return;
  }

  return new Blob([toByteArray(parsed.base64)], { type: parsed.contentType });
}
