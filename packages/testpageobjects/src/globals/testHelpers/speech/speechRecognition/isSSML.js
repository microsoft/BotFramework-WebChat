const SPEAK_TAG_PATTERN = /^\s*<speak(\s|\/?>)/u;
const XML_PROLOG_PATTERN = /^\s*<\?xml\s/u;

export default function isSSML(text) {
  return SPEAK_TAG_PATTERN.test(text) || XML_PROLOG_PATTERN.test(text);
}
