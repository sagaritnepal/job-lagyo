// Custom production entry point for hosts (e.g. Hostinger's Node.js App
// feature) that expect a plain Node script to require() or spawn, rather
// than running `next start` directly. Always serves the production build
// in ./.next — run `next build` before starting this.
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Job Lagyo server listening on port ${port}`);
  });
});
