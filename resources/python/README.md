# Sandbox assets placeholder

This repository does not include Python runtime binaries or wheel files by default.

Populate the following before packaging:
- `runtime/<platform-arch>/` with Python executable (`python.exe` on Windows, `bin/python3` on Linux/macOS)
- `wheels/<platform-arch>/` with `.whl` files that satisfy `requirements.txt`
- `assistant_env.py` copied from `src/main/python/assistant_env.py` if missing

Then run:

```bash
npm run verify:sandbox-assets
```
