# Folder reorganization — actual results

The completed Foodie-Original-UIs-New-Backend.zip was extracted as the baseline. No old backend was imported, no application source was rewritten and no live database or payment service was used.

```
Foodie/
  backend/
    src/
    pom.xml
    foodie-new-backend-1.0.0.jar
  frontend/
    customer/  (public, src, package.json, package-lock.json, vite.config.js, dist, build)
    merchant/  (public, src, package.json, package-lock.json, vite.config.js, dist, build)
    driver/    (public, src, package.json, package-lock.json, vite.config.js, dist, build)
    admin/     (public, src, package.json, package-lock.json, vite.config.js, dist, build)
  docs/
  README.md
```

No customer/frontend, driver/frontend, admin/frontend or frontend/customer/frontend nesting remains. Each portal retains its own independent package, source, public files and configuration.

## Changed files

Only frontend/customer/vite.config.js, frontend/merchant/vite.config.js, frontend/driver/vite.config.js and frontend/admin/vite.config.js changed among the original frontend files. They retain the original React plugin and Merchant Tailwind plugin; define unique development ports 5174/5173/5175/5176; proxy APIs to port 8081; preserve Admin login/logout proxying; and write new build output into build/ to preserve supplied dist/ artifacts. New generated build files are additional outputs, not replacements for original source. Documentation paths and setup instructions were updated. No package.json, lockfile, React component, CSS, image, asset or backend source file changed.

## Verification

| Portal | Original files compared | Unchanged | Documented Vite change | Build |
|---|---:|---:|---:|---|
| Customer | 51 | 50 | 1 | Passed |
| Merchant | 35 | 34 | 1 | Passed |
| Driver | 25 | 24 | 1 | Passed |
| Admin | 21 | 20 | 1 | Passed |

All original src/, public/, images, CSS and dist/ hashes match. The four configuration hash differences are expected and recorded in FOLDER_VERIFICATION.json. Hashes confirm unchanged UI implementation; no new before/after screenshot test was performed for this relocation.

All four npm ci installs passed using the original lockfiles. All four `npm run build -- --configLoader native` commands exited 0. Initial default-config-loader attempts failed with spawn EPERM in Vite's Windows network-drive detection; switching to Vite's supported native loader succeeded without changing dependencies or application code. Node 24.22.1 and npm 11.19.1 used. Logs are included under docs/build-logs/.

Backend full Maven clean verify: exit 0; 31 tests, 0 failures, 0 errors, 0 skipped. All 79 backend source/resource/pom files match the baseline. Java: 71 files, 22 packages, maximum 5 files in a package. Tests used isolated H2 MySQL-mode databases. No Aiven records were accessed, changed, removed or overwritten.

## Integration status

Completed in this update: folder organization, development API addresses, all four independent production builds, source/asset hash verification, clean backend build/test rerun and updated IntelliJ setup. Backend business features remain covered by their existing tests. Frontend browser handlers were intentionally unchanged during this folder-only update and are still not fully connected to backend APIs. Customer-first integration remains authorized but incomplete; no four-portal integration, live MySQL, SMTP inbox delivery, card gateway, bank execution or combined production server is claimed tested.
