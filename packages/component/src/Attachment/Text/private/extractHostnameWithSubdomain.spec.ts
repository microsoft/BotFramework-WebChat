import extractHostnameWithSubdomain from './extractHostnameWithSubdomain';

test.each([
  ['https://www.example.com/', 'example.com'],
  ['https://www.example.com/index.html', 'example.com'],
  ['HTTPS://WWW.EXAMPLE.COM/index.html', 'example.com'],
  ['https://www.example.co.jp/index.html', 'example.co.jp'],
  ['https://www.example.com:443/index.html', 'example.com'],
  ['http://www.example.com:80/index.html', 'example.com'],
  ['https://www.support.example.com/index.html', 'support.example.com'],
  ['https://www.microsoft/index.html', 'microsoft'],
  ['https://www.例子.com/index.html', 'xn--fsqu00a.com'],
  ['https://www.example.com:8443/index.html', 'www.example.com:8443'],
  ['https://www.example.com:8080', 'www.example.com:8080'],
  ['https://support.example.com/index.html', 'support.example.com'],
  ['https://www2.example.com/index.html', 'www2.example.com'],
  ['ftp://www.example.com/', 'ftp://www.example.com/'],
  ['www/index.html', 'www/index.html']
])('should extract %s into %s', (url, expected) => {
  expect(extractHostnameWithSubdomain(url)).toBe(expected);
});
