// This code is adopted from sanitize-html/naughtyScheme.
// sanitize-html is a dependency of Web Chat but the naughtScheme function is neither exposed nor reusable.
// https://github.com/apostrophecms/sanitize-html/

// Strip characters browsers ignore inside URLs (control chars and
// embedded HTML comments) that are commonly used to sneak XSS
// payloads past simple scheme checks.
export default function cleanHref(href: string): string {
  // Browsers ignore character codes of 32 (space) and below in a surprising
  // number of situations. Start reading here:
  // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet#Embedded_tab
  // eslint-disable-next-line no-control-regex, require-unicode-regexp
  href = href.replace(/[\x00-\x20]+/g, '');
  // Clobber any comments in URLs, which the browser might
  // interpret inside an XML data island, allowing
  // a javascript: URL to be snuck through
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const firstIndex = href.indexOf('<!--');
    // eslint-disable-next-line no-magic-numbers
    if (firstIndex === -1) {
      break;
    }
    // eslint-disable-next-line no-magic-numbers
    const lastIndex = href.indexOf('-->', firstIndex + 4);
    // eslint-disable-next-line no-magic-numbers
    if (lastIndex === -1) {
      break;
    }
    // eslint-disable-next-line no-magic-numbers
    href = href.substring(0, firstIndex) + href.substring(lastIndex + 3);
  }
  return href;
}
