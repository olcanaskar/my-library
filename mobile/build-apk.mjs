import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const isWindows = process.platform === "win32";

const capBin = path.join(
  root,
  "node_modules",
  ".bin",
  isWindows ? "cap.cmd" : "cap",
);
const sync = spawnSync(capBin, ["sync", "android"], {
  cwd: root,
  stdio: "inherit",
  shell: isWindows,
});
if (sync.status !== 0) process.exit(sync.status ?? 1);

const gradle = spawnSync(
  isWindows ? "gradlew.bat" : "sh",
  isWindows ? ["assembleDebug"] : ["gradlew", "assembleDebug"],
  {
    cwd: path.join(root, "android"),
    stdio: "inherit",
    shell: isWindows,
  },
);
if (gradle.status !== 0) process.exit(gradle.status ?? 1);

const apk = path.join(
  root,
  "android",
  "app",
  "build",
  "outputs",
  "apk",
  "debug",
  "app-debug.apk",
);
if (!existsSync(apk)) {
  console.error(`APK not found at ${apk}`);
  process.exit(1);
}

const releaseDir = path.join(root, "release");
mkdirSync(releaseDir, { recursive: true });
const artifact = path.join(
  releaseDir,
  `MyLibrary-${packageJson.version}-debug.apk`,
);
copyFileSync(apk, artifact);
console.log(`APK: ${artifact}`);
