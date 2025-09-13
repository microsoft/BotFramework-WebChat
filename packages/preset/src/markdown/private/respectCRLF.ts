// TODO: We should find some other ways to do this.
const pre = (markdown: string): string =>
  // IE11 does not support "u" flag and Babel could not remove it. We intentionally omitting the "u" flag here.
  // eslint-disable-next-line require-unicode-regexp
  markdown.replace(/\n\r|\r\n/g, carriageReturn => (carriageReturn === '\n\r' ? '\r\n' : '\n\r'));

export { pre };
