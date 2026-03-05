# Kivode+ Desktop

Secure AI-assisted desktop code workspace built with Electron + React + TypeScript, with a bundled/offline Python sandbox for controlled task execution.

## 1) Requirements

- Node.js **20+**
- npm **10+**
- Git **2.40+**
- OS: Windows, Linux, or macOS

## Fresh clone checklist (mandatory)

> This repository does **not** include Python runtime binaries and wheel files by default.

1. `npm install`
2. `npm run init:sandbox-assets`
3. Download/populate runtime + wheels for your OS/arch (see [Sandbox Python setup](#4-sandbox-python-setup-step-by-step)).
4. `npm run verify:sandbox-assets`
5. `npm run build`

## 2) Development Run

```bash
npm run dev
```

Useful alternatives:

```bash
npm run dev:renderer
npm run dev:main
```

## 3) Architecture quick pointers

- Main process: `src/main`
- Renderer: `src/renderer`
- Python helpers: `src/main/python`
- Bundled sandbox assets: `resources/python`

See full docs:
- [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)
- [docs/SANDBOX.md](./docs/SANDBOX.md)
- [SECURITY.md](./SECURITY.md)

## 4) Sandbox Python setup (step by step)

### Concept

Packaged builds use:
- bundled runtime executable under `resources/python/runtime/<platform-arch>/...`
- offline wheel files under `resources/python/wheels/<platform-arch>/...`
- helper script `resources/python/assistant_env.py`
- bootstrap script `resources/python/bootstrap/ensure_env.py`

In packaged mode there is no system-Python fallback.

In development mode only, `SandboxService` can fallback to system `python3/python` when runtime assets are missing.

### Required folder layout

```text
resources/python/
  README.md
  requirements.txt
  assistant_env.py
  bootstrap/
    ensure_env.py
  runtime/
    win32-x64/
      python.exe
    win32-arm64/
      python.exe
    linux-x64/
      bin/python3
    linux-arm64/
      bin/python3
    darwin-x64/
      bin/python3
    darwin-arm64/
      bin/python3
  wheels/
    <platform-arch>/
      PyYAML-....whl
      beautifulsoup4-....whl
      toml-....whl
      jedi-....whl
      radon-....whl
      pygments-....whl
```

### Windows

- Python official downloads: https://www.python.org/downloads/windows/
- Put runtime executable at: `resources/python/runtime/win32-x64/python.exe` (or `win32-arm64`).
- Download wheels:

```powershell
python -m pip download -r resources/python/requirements.txt -d resources/python/wheels/win32-x64
```

- Verify runtime version:

```powershell
resources/python/runtime/win32-x64/python.exe --version
```

### Linux

- Python official downloads: https://www.python.org/downloads/source/
- Put runtime executable at: `resources/python/runtime/linux-x64/bin/python3` (or `linux-arm64`).
- Download wheels:

```bash
python3 -m pip download -r resources/python/requirements.txt -d resources/python/wheels/linux-x64
```

- Verify runtime version:

```bash
resources/python/runtime/linux-x64/bin/python3 --version
```

### macOS

- Python official downloads: https://www.python.org/downloads/macos/
- Put runtime executable at: `resources/python/runtime/darwin-arm64/bin/python3` (or `darwin-x64`).
- Download wheels:

```bash
python3 -m pip download -r resources/python/requirements.txt -d resources/python/wheels/darwin-arm64
```

- Verify runtime version:

```bash
resources/python/runtime/darwin-arm64/bin/python3 --version
```

### Wheel/Python compatibility note

- If runtime is Python 3.11, wheel tags should generally include `cp311` (unless package is pure-python universal wheel).
- Verify quickly by filename inspection in `resources/python/wheels/<platform-arch>`.

## 5) Verification commands

```bash
npm run init:sandbox-assets
npm run verify:sandbox-assets
```

Expected success:
- prints platform/arch
- prints expected runtime/wheels paths
- prints wheel ABI hints
- exits with code `0`

Troubleshooting summary:

| Symptom | Cause | Fix |
|---|---|---|
| Missing required sandbox paths | Fresh clone without assets | `npm run init:sandbox-assets`, then populate runtime/wheels and retry |
| Missing wheels for package | Incomplete wheel directory | Re-run `pip download` into exact platform folder |
| Runtime executable missing | Wrong path or wrong platform key | Move runtime binary to exact expected path |
| Sandbox shows Unavailable after one failure | Failed init cache | Retry `sandbox:ensureEnvironment` after fixing files; failure cache is now cleared automatically |

## 6) Build commands

```bash
npm run build
npm run build:windows
npm run build:linux
npm run build:mac
npm run build:all
```

`electron-builder` targets are configured in `package.json` + `electron-builder.config.js`.

## 7) Troubleshooting “Sandbox Unavailable”

Common causes:
1. runtime path missing for current platform/arch.
2. wheel directory exists but required wheels are missing.
3. `resources/python/assistant_env.py` is missing.
4. platform/arch mismatch (for example `win32-x64` assets while building arm64).
5. stale app-data venv from previous failed bootstrap.

How to identify cause:
- Run `npm run verify:sandbox-assets`.
- Check main-process logs from `SandboxService` (it now logs searched paths + missing files + failure reason).

Recovery steps:
1. Fix missing files under `resources/python/runtime/<platform-arch>` and `resources/python/wheels/<platform-arch>`.
2. Re-run `npm run verify:sandbox-assets`.
3. Delete sandbox venv cache if needed:
   - Windows: `%APPDATA%/Kivode+/python-sandbox/<platform-arch>/venv`
   - macOS: `~/Library/Application Support/Kivode+/python-sandbox/<platform-arch>/venv`
   - Linux: `~/.local/share/Kivode+/python-sandbox/<platform-arch>/venv`
4. Retry the action that triggers `sandbox:ensureEnvironment`.

## 8) Licenses / Credits / Links / Social

- License: [LICENSE](./LICENSE)
- Contribution Guide: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Security Policy: [SECURITY.md](./SECURITY.md)
- Changelog: [CHANGELOG.md](./CHANGELOG.md)

Community links and socials:
- https://kivode.com/apps/submit
- https://github.com/aymantaha-dev
- https://instagram.com/aymantaha.dev
- https://discord.gg/rUdaR8PG
