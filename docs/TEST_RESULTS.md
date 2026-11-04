# Actual verification — 4 November 2026 (Asia/Colombo)

| Check | Actual result |
|---|---|
| Maven clean verify | BUILD SUCCESS, 41 tests, 0 failures/errors/skips |
| Original backend regression/service tests | 33 passed, including legacy null-crop menu update and image/restaurant isolation |
| Random-port cross-portal HTTP tests | 3 passed: DB workflow, policy authorization, CSRF |
| Embedded server/public routes/static assets tests | 2 passed |
| Mock Cloudinary provider tests | 3 passed |
| Customer JS contracts | 3 passed |
| Independent React production builds | Customer, Merchant, Driver, Admin all passed |
| Actual browser workflow | Customer cash order → Merchant Preparing/Ready → Driver Accept/Pickup/Complete → Customer Delivered; Admin matching records |
| Final browser data | Test restaurant/menu/order ID1; menu1050 + DB delivery150 = total1200; cash PENDING |
| One-server HTTP probes | Eight page/deep-link routes plus all referenced JS/CSS assets passed; original Driver PNG200 |
| Browser production check | Driver production login/dashboard/refresh and Merchant production login render observed |
| Frontend preservation | Original CSS/public assets/images/fonts/dist hash-identical; authorized JS/config changes documented |
| Java package limit | 79 Java sources including tests, 25 exact packages, max5 files per package |

The first isolated browser run also saved a completed-order review and exercised Admin Customer suspend/reactivate, Customer favourites, Driver earnings, Merchant wallet and Admin restaurant oversight. Final run repeated the order workflow after repairing the menu form; price/availability changes propagated into Customer. All were explicit H2 test records, not live business data. Test coordinates and fixture amounts are not shipped production business defaults.

Integration bugs actually found/fixed: stale demo card wording and unreachable demo card persistence; checkout CASH quote mapping; incorrect restaurant cuisine fallback; legacy null image-crop save500; Merchant production asset base404. Production asset tests now check the referenced JS/CSS as well as HTML, so an HTML-only route pass cannot hide broken assets.

The four source apps remain independent. Current build/ output is integrated; original dist/ remains unchanged for reference. Vite native config loader and Node no-isolation tests were used to avoid this Windows environment's process-spawn restriction. package manifests/locks were not replaced.

Test suite/case inventory is in TEST_RESULTS.json; command logs in build-logs/. Surefire XML system/environment properties and private browser passwords/cookies are excluded from delivery. Some tests intentionally exercise failed SMTP/provider calls; warnings in their logs are expected negative-test evidence, not a claim of delivery.

No Aiven migration/data change, Cloudinary upload/delete, real email, payment or bank transfer was executed. Live Aiven/Cloudinary/SMTP/device GPS/HTTPS and external financial services remain unverified. H2 MySQL mode does not prove MySQL dialect/schema compatibility. Full registration/email/document browser onboarding and every Admin/export/date combination remain unverified. See REMAINING_INTEGRATION.md for API-only controls and incomplete analytics; this is not a claim that every frontend action or live service is fully verified.

## Additional approved controls and GitHub preparation

Admin Dashboard policy editor: real GET/PUT, changed isolated delivery fee150→200, reloaded200, new checkout1250, previous delivered order1200 unchanged. Customer charge control: Merchant proposed75 on order2; Customer accepted explicitly; total1325 persisted after refresh and matched Merchant/Admin. Guest-token charge consent and invalid/replayed/stale/null requests are covered by the 33-service-test suite. New controls use existing CSS/classes; no stylesheet or image was changed.

Root .gitignore passed20 checks (12 excluded private/generated/dependency examples and8 required tracked source/config examples) using a Git-ignore-compatible parser without initializing a repository. Six module handoff packs include relevant Java/React files plus clearly labeled shared context. They are not standalone deployables; no standalone compilation is claimed. No repository, commit, branch, push, PR or fabricated authorship/history was created. GitHub publishing/authentication itself is not tested.

## Source-only checkout simulation and final Merchant readouts

Copied266 source/documentation files using the root .gitignore, omitting node_modules/build/dist/target/JARs, without creating a Git repository/history. With cached dependencies, all4 frontends rebuilt and Maven clean verify passed41 tests with0 failures/errors/skips. This is a source-only simulation, not a remote GitHub clone or a new npm dependency download. Logs: build-logs/source-only-*. The GitHub guide explains rebuilding all frontend build/ outputs before server/asset tests.

Merchant original metric/readout controls now show persisted values:2 orders, average1262.5 including approved charge,1 repeat customer, completed item quantities and Customer's actual saved review. Sales stays0 because cash was not marked collected. Existing CSS/layout/components were retained; no time-series graph/sample analytics was invented. Actual browser metric switches and cross-portal feedback were observed.
