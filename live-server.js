var liveServer = require("live-server");

var params = {
  port: 8000, // Set the server port. Defaults to 8080.
  host: "localhost", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
  root: "./", // Set root directory that's being served. Defaults to cwd.
  file: "",
  open: true, // When false, it won't load your browser by default.
  logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
  proxy: [
    [
      "/api/bot_menu_items", "http://cms.kia-dev.car-labs.com/api/bot_menu_items?environment=live&is_published=true"
    ]
  ]
};

liveServer.start(params);