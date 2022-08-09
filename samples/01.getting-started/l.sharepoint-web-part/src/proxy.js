const { createProxyMiddleware } = require('http-proxy-middleware');
const { createServer } = require('https');
const selfSigned = require('selfsigned');

const { cert, private: key } = selfSigned.generate([{ name: 'commonName', value: 'localhost:4321' }], { days: 14 });

createServer(
  { cert, key },
  createProxyMiddleware({
    secure: false,
    target: 'https://localhost:4321'
  })
).listen(54321, () => {
  console.log('Proxy listening to 54321');
});
