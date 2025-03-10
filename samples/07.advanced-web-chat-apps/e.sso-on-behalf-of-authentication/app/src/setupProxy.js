const { createProxyMiddleware } = require('http-proxy-middleware');

// Passthru-ing API traffic to /rest-api/
module.exports = app => {
  app.use(createProxyMiddleware('/api', { target: 'http://localhost:5000/' }));
};
