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

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    root: args.find((a) => a.startsWith('--root='))?.split('=')[1],
    platform: args.find((a) => a.startsWith('--platform='))?.split('=')[1] || platformKey(),
  };
}

const { root: rootArg, platform } = parseArgs();
const root = rootArg ? path.resolve(rootArg) : process.cwd();
const pythonRoot = path.join(root, 'resources', 'python');
const runtimeRoot = path.join(pythonRoot, 'runtime', platform);
const wheelsRoot = path.join(pythonRoot, 'wheels', platform);
const bootstrapRoot = path.join(pythonRoot, 'bootstrap');
const helperSource = path.join(root, 'src', 'main', 'python', 'assistant_env.py');
const helperTarget = path.join(pythonRoot, 'assistant_env.py');

for (const dir of [pythonRoot, bootstrapRoot, runtimeRoot, wheelsRoot]) {
  fs.mkdirSync(dir, { recursive: true });
}

const placeholderPath = path.join(pythonRoot, 'README.md');
if (!fs.existsSync(placeholderPath)) {
  fs.writeFileSync(
    placeholderPath,
    [
      '# Sandbox assets placeholder',
      '',
      'This repository does not include Python runtime binaries or wheel files by default.',
      `Populate these folders for ${platform}:`,
      `- runtime/${platform}/ (python executable for your target OS/arch)`,
      `- wheels/${platform}/ (*.whl files matching resources/python/requirements.txt)`,
      '',
      'Run `npm run verify:sandbox-assets` after populating assets.',
      '',
    ].join('\n'),
    'utf-8'
  );
}

if (!fs.existsSync(helperTarget) && fs.existsSync(helperSource)) {
  fs.copyFileSync(helperSource, helperTarget);
}

console.log(`Initialized sandbox asset layout for ${platform}`);
console.log(`python root: ${pythonRoot}`);
console.log(`runtime dir: ${runtimeRoot}`);
console.log(`wheels dir: ${wheelsRoot}`);
console.log(`assistant helper: ${helperTarget}${fs.existsSync(helperTarget) ? ' (exists)' : ' (missing source file)'}`);
