# GitHub Pages Setup Required

## Status
✅ Prototype files deployed to `docs/prototype/` on `main`  
✅ GitHub Actions workflow created and working  
✅ `gh-pages` branch created with content  
❌ Pages needs manual enablement (API token lacks admin permissions)

## Quick Manual Step Required

1. Go to: https://github.com/tylerprobst/ata--tournament-app/settings/pages
2. Under "Build and deployment":
   - **Source**: Select "Deploy from a branch"
   - **Branch**: Select `gh-pages` and `/ (root)`
3. Click **Save**

GitHub will build and deploy in ~30-60 seconds.

## Expected URLs
- **Prototype hub**: https://tylerprobst.github.io/ata--tournament-app/prototype/
- **Direct index**: https://tylerprobst.github.io/ata--tournament-app/prototype/index.html
- **Registration start**: https://tylerprobst.github.io/ata--tournament-app/prototype/R1-registration-start.html

## Verification
Once enabled, the workflow will auto-deploy future changes to `main`.

To verify it's live:
```bash
curl -I https://tylerprobst.github.io/ata--tournament-app/prototype/
```

Should return `HTTP/2 200` instead of `404`.

## Files Deployed
- Registration: R1-R6.html
- Director: D1-D4.html  
- Judge: J1-J3.html
- Hub: index.html
- README.md

All files preserved as-is with Ring Day CSS inlined and relative links intact.
