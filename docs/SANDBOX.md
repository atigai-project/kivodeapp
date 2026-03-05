# Python Sandbox Guide

This document is the implementation-focused companion to `README.md` for sandbox runtime behavior.

## Runtime model

- Bundled runtime source: `resources/python/runtime/<platform-arch>/...`
- Offline wheels source: `resources/python/wheels/<platform-arch>/...`
- Bootstrap script: `resources/python/bootstrap/ensure_env.py`
- Assistant helper: packaged from `src/main/python/assistant_env.py` (optional duplicate in `resources/python/assistant_env.py`)
- Requirements: `resources/python/requirements.txt`

`SandboxService` enforces bundled runtime in packaged mode.
In development mode only, a minimal fallback to system `python3/python` is allowed when bundled runtime is missing.

## Fresh-clone bootstrap

```bash
npm install
npm run init:sandbox-assets
npm run verify:sandbox-assets
```

`npm run init:sandbox-assets` creates missing directories for the current platform key and places a placeholder README under `resources/python/`.

## Required paths by platform key

- `win32-x64` / `win32-arm64`: `resources/python/runtime/<platform-arch>/python.exe`
- `linux-x64` / `linux-arm64`: `resources/python/runtime/<platform-arch>/bin/python3`
- `darwin-x64` / `darwin-arm64`: `resources/python/runtime/<platform-arch>/bin/python3`

Wheels location for every target:
- `resources/python/wheels/<platform-arch>/*.whl`

## Environment bootstrapping flow

1. `SandboxService.ensureEnvironment()` resolves required asset paths.
2. If venv already exists in app data, it is reused.
3. Otherwise `ensure_env.py` runs with:
   - `--runtime-python`
   - `--venv-root`
   - `--requirements`
   - `--wheels-dir`
4. `ensure_env.py` creates venv then installs wheels offline (`--no-index --find-links`).

## Diagnostics added

Main-process logs now include:
- detected platform key,
- resources root,
- runtime path,
- wheels path,
- exact missing paths on failure.

When initialization fails, the cached init promise is cleared to allow retry after fixing files.

## Verify command output

`npm run verify:sandbox-assets` now prints:
- platform and arch,
- expected runtime path,
- expected wheels path,
- python version expectation,
- wheel ABI hints (for example `cp311`).

If assets are missing, it prints exact missing paths and exits non-zero.

## Related docs

- [README.md](../README.md)
- [ARCHITECTURE_OVERVIEW.md](../ARCHITECTURE_OVERVIEW.md)
- [docs/SECURITY.md](./SECURITY.md)
