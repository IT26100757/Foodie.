# Six-member module ownership and shared dependencies

The six module ZIPs are reference/handoff packs, not six independent applications or fabricated contribution histories. Every feature branch contains the complete repository. Assign the actual six people yourselves; this document assigns responsibilities, not authorship. The new repo must preserve acknowledgement of original UI sources and the imported backend baseline.

| Branch/module | Primary backend responsibility | Relevant React responsibility |
|---|---|---|
| user-management | user account/auth/approval/profile/documents, Customer favourites, notifications | Customer AccountCenter; auth/onboarding/management sections of the four shared App.jsx files |
| restaurant-menu-management | restaurant/model/repository ownership, menu IDs/sizes/availability/images | Merchant MenuPage; Customer catalogue/restaurant menu; Merchant settings/Admin restaurant sections in shared files |
| order-management | order controllers/service/entities/lines, guest access, quotes/checkout and extra-charge acceptance | Customer CheckoutPage/customerApi; Merchant OrdersPage/merchantApi; shared HomePage/Admin orders |
| payment-management | payments, encrypted banks, wallet/payout/refund safeguards | Merchant WalletPage/WalletReports/exports; card/bank/refund/earnings sections in shared Customer/Driver/Admin files |
| delivery-management | delivery assignment/state/availability/location; Driver service/vehicle review | Merchant DeliveryPage; Customer OrderTracking/service; Driver App.jsx delivery/profile sections |
| review-management | Review controller/service/repository/model and completed-order ownership | Review form/list in shared Customer RestaurantExperience.jsx; Merchant feedback/Admin related sections |

## Shared files: coordinate, do not copy whole files

* frontend/admin/src/App.jsx includes authentication, approvals, customers, orders, restaurants, drivers, payments/refunds, offers/complaints and policy editing. It cannot honestly belong exclusively to one module. Assign one coordinator/reviewer; make small section-level diffs.
* frontend/driver/src/App.jsx similarly contains auth, registration, settings, vehicles, deliveries, earnings, banks and complaints. Coordinate user/delivery/payment edits.
* frontend/merchant/src/App.jsx contains login/onboarding/dashboard/settings and view routing. Coordinate user/restaurant/order/payment work. MenuPage/OrdersPage/WalletPage/DeliveryPage are more isolated.
* frontend/customer/src/HomePage.jsx handles catalogue/cart/favourites/orders/profile routing; RestaurantExperience.jsx combines menu and reviews; customerApi.js includes order adapters and tracking helpers. Agree which member edits each function before simultaneous work.
* All src/api.js clients, Vite configs, package manifests/locks, shared App.css/index.css/assets and entry points are shared infrastructure. Preserve session-cookie/CSRF behaviour and original styles. No member should reinstall unrelated dependencies or reformat whole shared files in a feature PR.
* Backend common/config/media/settings/operations packages, pom.xml, application.properties, FoodieApplication, migrations and full integration tests are shared. Media/Cloudinary serves both account photos and restaurant/menu images. BusinessPolicyService feeds order/payment/delivery/rewards. Operations serves offers/complaints/reports/notifications across roles.
* AppUser/RiderUser and vehicle-document contracts are shared dependencies of auth/restaurant/order/delivery services. PaymentService reads order/delivery state. Reviews depend on completed owned orders. Catalogue prices and Cloudinary references are restaurant-ID scoped.
* Existing Flyway migration versions/checksums must not be edited after application. Coordinate a unique next migration version; review SQL and obtain owner permission before Aiven execution. Never merge private credentials or provider test images into source.

## Safe handoff process

1. Owner imports the complete verified baseline once on main, creates develop and feature branches.
2. Each member clones the complete repo, checks out their branch, reads their handoff manifest and compares files. Do not add duplicate backend/frontend folders or copy module ZIP roots into the repository.
3. module-files/ paths identify primary relevant files. shared-context/ copies are for reading/comparing; they are intentionally duplicated between packs and must not overwrite others' edits. Each file's exact source hash is recorded. A review module has no separate original React component file; its real UI lives in the shared RestaurantExperience.jsx, which is included as context.
4. Agree shared-file edits before work; PRs include exact section changes and tests. Merge one feature at a time to develop; fetch/merge latest develop into the next feature and resolve conflicts together. Zero-conflict guarantees are impossible for shared files.
5. Build all four frontends before backend clean verify after a fresh Git clone because build outputs are correctly ignored. Test only H2/mocks unless the cloud owner explicitly authorizes writes. See the current test report for verified limits.

MODULE_FILE_MANIFEST.json lists every handoff file, section and SHA-256. Handoff README files explain dependencies. These archives are not independently tested deployables; the full project is the tested unit. No GitHub repository/commit/branch/push was created by this preparation.
