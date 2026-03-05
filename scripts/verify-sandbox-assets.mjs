#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

function platformKey() {
  const p = process.platform;
  const a = process.arch;
  if (p === 'win32') return a === 'arm64' ? 'win32-arm64' : 'win32-x64';
  if (p === 'darwin') return a === 'arm64' ? 'darwin-arm64' : 'darwin-x64';
  if (p === 'linux') return a === 'arm64' ? 'linux-arm64' : 'linux-x64';
  return `${p}-${a}`;
}

function normalizePkg(name) {
  return name.toLowerCase().replace(/[-_.]+/g, '-');
}

function expectedRuntimePath(runtimeRoot, platform) {
  return platform.startsWith('win32-')
    ? path.join(runtimeRoot, 'python.exe')
    : path.join(runtimeRoot, 'bin', 'python3');
}

const args = process.argv.slice(2);
const explicitPlatform = args.find((a) => a.startsWith('--platform='))?.split('=')[1];
const rootArg = args.find((a) => a.startsWith('--root='))?.split('=')[1];
const root = rootArg ? path.resolve(rootArg) : process.cwd();
const plat = explicitPlatform || platformKey();

const pythonRoot = path.join(root, 'resources', 'python');
const reqPath = path.join(pythonRoot, 'requirements.txt');
const assistantResourcePath = path.join(pythonRoot, 'assistant_env.py');
const assistantSourcePath = path.join(root, 'src', 'main', 'python', 'assistant_env.py');
const runtimeRoot = path.join(pythonRoot, 'runtime', plat);
const wheelsRoot = path.join(pythonRoot, 'wheels', plat);

if (!fs.existsSync(runtimeRoot) || !fs.existsSync(wheelsRoot)) {
  console.warn(`[verify:sandbox-assets] Missing base directories for ${plat}. Running init:sandbox-assets layout setup...`);
  fs.mkdirSync(runtimeRoot, { recursive: true });
  fs.mkdirSync(wheelsRoot, { recursive: true });
}

const runtimeExe = expectedRuntimePath(runtimeRoot, plat);
const missing = [];

if (!fs.existsSync(reqPath)) missing.push(reqPath);
const assistantPath = fs.existsSync(assistantResourcePath) ? assistantResourcePath : assistantSourcePath;
if (!fs.existsSync(assistantPath)) missing.push(`${assistantResourcePath} (or ${assistantSourcePath})`);
if (!fs.existsSync(runtimeExe)) missing.push(runtimeExe);
if (!fs.existsSync(wheelsRoot)) missing.push(wheelsRoot);

console.log(`platform: ${plat}`);
console.log(`arch: ${process.arch}`);
console.log(`python root: ${pythonRoot}`);
console.log(`expected runtime: ${runtimeExe}`);
console.log(`expected wheels dir: ${wheelsRoot}`);
console.log('python version expectation: runtime should be Python 3.11.x and wheel tags should match that ABI (for example cp311).');

if (missing.length > 0) {
  console.error('Missing required sandbox paths:');
  for (const entry of missing) console.error(`- ${entry}`);
  console.error('Run `npm run init:sandbox-assets` and populate runtime/wheels before retrying.');
  process.exit(2);
}

const requirements = fs.readFileSync(reqPath, 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => line.split(/[<>=!~]/)[0].trim())
  .map(normalizePkg);

const wheelFiles = fs.readdirSync(wheelsRoot)
  .filter((name) => name.endsWith('.whl'))
  .map((name) => normalizePkg(name));

const missingWheels = requirements.filter((pkg) => !wheelFiles.some((file) => file.startsWith(`${pkg}-`)));
if (missingWheels.length > 0) {
  console.error(`Missing wheels for platform ${plat}:`);
  for (const wheel of missingWheels) console.error(`- ${wheel}`);
  console.error(`wheels dir scanned: ${wheelsRoot}`);
  process.exit(3);
}

const abiHints = Array.from(new Set(
  wheelFiles
    .map((file) => {
      const match = file.match(/-(cp\d{2,3}|py3|py2\.py3)-/);
      return match ? match[1] : null;
    })
    .filter(Boolean)
));

console.log(`Sandbox assets verified for ${plat}`);
console.log(`assistant script candidate: ${assistantPath}`);
console.log(`runtime: ${runtimeExe}`);
console.log(`wheels: ${wheelsRoot}`);
console.log(`wheel ABI hints: ${abiHints.length ? abiHints.join(', ') : 'none detected (pure wheels or unexpected names)'}`);
