const { app, BrowserWindow, Menu, dialog, shell } = require("electron");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = 47823;
const HOST = "127.0.0.1";
const OUT_DIR = path.join(app.getAppPath(), "out");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

let server = null;
let win = null;

function resolveFile(urlPath) {
  let pathname;
  try {
    pathname = decodeURIComponent((urlPath || "/").split("?")[0]);
  } catch {
    return null;
  }

  if (pathname === "/" || pathname === "") pathname = "/index.html";
  if (!path.extname(pathname)) pathname = pathname.replace(/\/?$/, "/index.html");

  const filePath = path.normalize(path.join(OUT_DIR, pathname));
  if (!filePath.startsWith(OUT_DIR + path.sep)) return null;
  return filePath;
}

function startServer() {
  return new Promise((resolve, reject) => {
    server = http.createServer(async (request, response) => {
      let filePath = resolveFile(request.url);
      if (!filePath) {
        response.writeHead(403, { "Content-Type": "text/plain" });
        response.end("Forbidden");
        return;
      }

      let stat = await fs.promises.stat(filePath).catch(() => null);
      if (!stat || stat.isDirectory()) {
        filePath = path.join(OUT_DIR, "index.html");
        stat = await fs.promises.stat(filePath).catch(() => null);
      }

      if (!stat || !stat.isFile()) {
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.end("Not found");
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      response.writeHead(200, {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control":
          ext === ".html"
            ? "no-store"
            : "public, max-age=31536000, immutable",
      });
      fs.createReadStream(filePath).pipe(response);
    });

    server.once("error", reject);
    server.listen(PORT, HOST, () => resolve());
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1240,
    height: 860,
    minWidth: 900,
    minHeight: 640,
    backgroundColor: "#1c1209",
    title: "My Library",
    icon: path.join(__dirname, "icon.png"),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.loadURL(`http://${HOST}:${PORT}/`);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(`http://${HOST}:${PORT}/`)) {
      event.preventDefault();
      if (url.startsWith("http://") || url.startsWith("https://")) {
        shell.openExternal(url);
      }
    }
  });

  win.on("closed", () => {
    win = null;
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
  });

  app.whenReady().then(async () => {
    if (process.platform === "win32") {
      app.setAppUserModelId("com.olcanaskar.mylibrary");
    }
    Menu.setApplicationMenu(null);

    try {
      await startServer();
    } catch (error) {
      dialog.showErrorBox(
        "My Library could not start",
        `The local notebook server could not start on ${HOST}:${PORT}.\n\n${error.message}`,
      );
      app.quit();
      return;
    }

    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on("window-all-closed", () => {
    if (server) server.close();
    server = null;
    app.quit();
  });
}
