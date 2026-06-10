const http = require("http");
const fs = require("fs");
const path = require("path");

const host = "127.0.0.1";
const port = Number(process.env.PORT) || 3000;
const rootDir = __dirname;
const publicDir = path.join(rootDir, "public");
const indexFile = path.join(rootDir, "coach-site_1.html");
const trainingFile = path.join(rootDir, "training.html");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

function sendFile(filePath, response) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        response.writeHead(404, {
          "Content-Type": "text/plain; charset=utf-8",
        });
        response.end("Not found");
        return;
      }

      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Internal server error");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extension] || "application/octet-stream";

    response.writeHead(200, { "Content-Type": contentType });
    response.end(content);
  });
}

function resolvePublicAsset(requestPath) {
  const relativePath = requestPath.replace(/^\/public\//, "");
  const assetPath = path.normalize(path.join(publicDir, relativePath));

  if (!assetPath.startsWith(publicDir)) {
    return null;
  }

  return assetPath;
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(
    request.url,
    `http://${request.headers.host || `${host}:${port}`}`,
  );
  const requestPath = decodeURIComponent(requestUrl.pathname);

  if (requestPath === "/" || requestPath === "/coach-site_1.html") {
    sendFile(indexFile, response);
    return;
  }

  if (requestPath === "/training" || requestPath === "/training.html") {
    sendFile(trainingFile, response);
    return;
  }

  if (requestPath.startsWith("/public/")) {
    const assetPath = resolvePublicAsset(requestPath);

    if (!assetPath) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    sendFile(assetPath, response);
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found");
});

server.listen(port, host, () => {
  console.log(`Coach Baagii site available at http://${host}:${port}`);
});
