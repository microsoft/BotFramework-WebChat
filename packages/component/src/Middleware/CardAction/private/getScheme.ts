// This code is adopted from sanitize-html/naughtyScheme.
// sanitize-html is a dependency of Web Chat but the naughtScheme function is neither exposed nor reusable.
// https://github.com/apostrophecms/sanitize-html/
export default function getScheme(href: string): string | undefined {
  // Browsers ignore character codes of 32 (space) and below in a surprising
  // number of situations. Start reading here:
  // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet#Embedded_tab

  /* eslint-disable-next-line no-control-regex */
  href = href.replace(/[\x00-\x20]+/gu, '');

  // Clobber any comments in URLs, which the browser might
  // interpret inside an XML data island, allowing
  // a javascript: URL to be snuck through
  href = href.replace(/<!--.*?-->/gu, '');

  // Case insensitive so we don't get faked out by JAVASCRIPT #1
  const matches = href.match(/^([a-zA-Z]+):/u);

  if (!matches) {
    // Protocol-relative URL or no scheme
    return;
  }

  return matches[1].toLowerCase();
}
