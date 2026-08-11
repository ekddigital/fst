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

      // Live .next may still emit /_next/image URLs; TMD cannot run the optimizer (glibc/LVE).
      if (
        parsedUrl.pathname === "/_next/image" &&
        typeof parsedUrl.query.url === "string"
      ) {
        const raw = parsedUrl.query.url;
        let target;
        try {
          target = decodeURIComponent(raw);
        } catch {
          target = raw;
        }
        if (
          target.startsWith("/") &&
          !target.startsWith("//") &&
          !target.includes("..")
        ) {
          res.writeHead(307, { Location: target });
          res.end();
          return;
        }
      }

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
