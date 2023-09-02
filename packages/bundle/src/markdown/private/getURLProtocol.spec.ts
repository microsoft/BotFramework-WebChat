import getURLProtocol from './getURLProtocol';

test('"./abc.txt" should return undefined', () => expect(getURLProtocol('./abc.txt')).toBeUndefined());
test('"http://bing.com/" should return "http:"', () => expect(getURLProtocol('http://bing.com/')).toBe('http:'));
test('"https://bing.com/" should return "https:"', () => expect(getURLProtocol('https://bing.com/')).toBe('https:'));
test('"ms-teams://bing.com/" should return "ms-teams:"', () =>
  expect(getURLProtocol('ms-teams://bing.com/')).toBe('ms-teams:'));
