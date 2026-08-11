const path = require("path");
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

// cPanel LiteSpeed Node sets PWD to nodevenv/bin; Next must run from the app root.
const appDir = (process.env.LSNODE_ROOT || __dirname).replace(/\/$/, "");
process.chdir(appDir);

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port, dir: appDir });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error:", err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port} (dir=${appDir})`);
  });
});
