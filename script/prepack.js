const fs = require("fs");
const path = require("path");
const child_process = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const buildDir = path.resolve(rootDir, "build");
const zipPath = path.resolve(rootDir, "packed.zip");

const filesToCopy = [
  "manifest.json",
  "logo/icon-16.png",
  "logo/icon-64.png",
  "logo/icon-128.png",
];

try {
    fs.rmdirSync(buildDir, { recursive: true });
    console.log("Delete " + buildDir + " done.");
} catch {
    console.log("Delete " + buildDir + " failed.");
}

console.log("Build started.");
child_process.execSync("yarn build", { stdio: "inherit" });
console.log("Build done.");

fs.mkdirSync(path.resolve(buildDir, "logo"));

filesToCopy.forEach((file) => {
  fs.copyFileSync(path.resolve(rootDir, file), path.resolve(buildDir, file));
  console.log("Copying " + file + " done.");
});

try {
    fs.rmdirSync(zipPath);
    console.log("Delete " + zipPath + " done.");
} catch {
    console.log("Delete " + zipPath + " failed.");
}
