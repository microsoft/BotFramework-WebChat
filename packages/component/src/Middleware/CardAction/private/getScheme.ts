import cleanHref from './cleanHref.js';

export default function getScheme(href: string): string | undefined {
  // Case insensitive so we don't get faked out by JAVASCRIPT #1
  const matches = cleanHref(href).match(/^([a-zA-Z]+):/u);

  if (!matches) {
    // Protocol-relative URL or no scheme
    return;
  }

  return matches[1].toLowerCase();
}
