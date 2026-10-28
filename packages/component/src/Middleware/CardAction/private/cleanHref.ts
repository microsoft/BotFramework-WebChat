// TODO: [P1] Should move to [launder](https://www.npmjs.com/package/launder) package.

/*!
 * (launder@1.7.1 is MIT but does not have license file, we are using the license file from sanitize-html instead.)
 *
 * Copyright (c) 2013, 2014, 2015 P'unk Avenue LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// This code is adopted from sanitize-html/launder.
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
