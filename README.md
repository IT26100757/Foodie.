# Foodie — original four portals and the new backend

Open Foodie in IntelliJ IDEA and link backend/pom.xml. Java 17, Spring Boot 3.5.7, Maven, Aiven MySQL and Cloudinary are retained. Four independent original React apps remain under frontend/customer, merchant, driver and admin.

Start with [IntelliJ setup](docs/INTELLIJ_SETUP.md). Current integrated production files are in each build/ folder; untouched dist/ folders are historical references. CSS, public assets, images and fonts are unchanged.

Actual browser tests completed Customer → Merchant → Driver → Customer delivery, with matching Admin oversight, against isolated H2 records. Full verification: 41 backend tests, 3 Customer contract tests and 4 frontend builds. This is not live Aiven/Cloudinary/SMTP/GPS/payment/bank verification. No live cloud data was changed.

Spring Boot serves Customer /, Merchant /merchant/, Driver /driver/, Admin /admin/. On the production origin use separate browser profiles for different roles: one session represents one account. Development ports isolate portal cookies through their proxies.

See docs/TEST_RESULTS.md, REMAINING_INTEGRATION.md, API_ENDPOINTS.md, MODIFIED_FILES.md, INTEGRATION_HASH_VERIFICATION.json, OOP_DIAGRAMS.md and VISUAL_REPORT.html. docs/history contains superseded baseline reports.

GitHub handoff: [GitHub/IntelliJ guide](docs/GITHUB_INTELLIJ_GUIDE.md), [six-member responsibilities](docs/TEAM_MODULES.md), and [exact module manifests](docs/MODULE_FILE_MANIFEST.json). No repository, commits or branches were created for you. Build outputs included in this delivery ZIP are ignored by Git; rebuild all portals after cloning.
