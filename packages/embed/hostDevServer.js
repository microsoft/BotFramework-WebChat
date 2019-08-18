const {
  createServer,
  plugins: { queryParser, serveStatic }
} = require('restify');
const { join } = require('path');
const fetch = require('node-fetch');
const proxy = require('http-proxy-middleware');

const { PORT = 5000 } = process.env;
const server = createServer();

server.use(queryParser());

server.get('/', async (req, res, next) => {
  if (!req.query.b) {
    const tokenRes = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', {
      headers: {
        origin: 'http://localhost:5000'
      },
      method: 'POST'
    });

    if (!tokenRes.ok) {
      return res.send(500);
    }

    const { token } = await tokenRes.json();

    return res.send(302, null, {
      location: `/?b=webchat-mockbot&t=${encodeURIComponent(token)}`
    });
  }

  return serveStatic({
    directory: join(__dirname, 'dist'),
    file: 'index.html'
  })(req, res, next);
});

server.get('/embed/*/config', proxy({ changeOrigin: true, target: 'https://webchat.botframework.com/' }));

server.listen(PORT, () => console.log(`Embed dev server is listening to port ${PORT}`));
