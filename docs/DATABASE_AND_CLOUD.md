# Cloud configuration and migration review

Aiven MySQL is the only intended application database. Four portals call one backend. Browser/automated tests used H2 memory in MySQL mode with cloud credentials removed/overridden. No Aiven test database was created or used. A briefly started isolated local MySQL process from earlier work was stopped when instructed; it was not used by this application and is excluded from this project/delivery. Do not restart it.

Main datasource uses AIVEN_MYSQL_URL/USER/PASSWORD and VERIFY_IDENTITY. Flyway defaults disabled, clean disabled, baseline disabled, Hibernate validate only. No live SQL was executed. Enabling migrations, Admin bootstrap or policies would write to Aiven and needs owner permission first.

| Migration | Purpose |
|---|---|
| V1 | Newly authored nf_ schema for account/documents, restaurant/menu, orders, payments/wallet, delivery, review and operations |
| V2 | Driver contracts/onboarding |
| V3 | Checkout/rewards |
| V4 | Email change/refunds |
| V5 | Guest token hashes/idempotency and favourites |
| V6 | Persisted monetary/reward policies, no production seeds |
| V7–V8 | Profile/restaurant image capacity |
| V9–V10 | Complaint type and order-line instructions |
| V11 | Discount breakdown, legacy values preserved |
| V12 | Delivery service-rate snapshot |
| V13 | Cloudinary public IDs beside restaurant/menu/user image URLs |

Review actual SQL in backend/src/main/resources/db/migration against existing schema, history, backup, indexes, SQL modes and column types. These include ALTER statements and were tested only on H2, not your Aiven schema. Do not delete records, guess a baseline, repair checksums or use ddl-auto=update/create. Old backend tables are not silently imported; existing-schema mappings require separate review. V1–V5 were not rewritten in this phase.

Required database policy keys: delivery_fee, commission_rate, driver_service_rate, reward_discount_rate, reward_minimum_points, reward_tier_one, reward_tier_two, reward_tier_three, reward_points_base, reward_points_one, reward_points_two, reward_points_three. Owner supplies real values through the approved Admin Dashboard policy editor or authenticated API; missing settings fail explicitly. Test values exist only under src/test.

Cloudinary credentials stay backend-only. New uploads default disabled. Provider tests are mocked; no upload/overwrite/delete or account-management API was called. Original branding URLs remain public assets. New image scopes use DB IDs plus unique suffixes: foodie/restaurants/RESTAURANT_ID/logos, banners, menu/MENU_ITEM_ID; foodie/profiles/USER_ID. overwrite=false; no destroy API. Product names never determine asset identity. Ownership and size/menu validation precede upload. Unchanged URLs/public IDs are retained; arbitrary foreign URLs cannot attach another restaurant's image.

Image removal detaches the database reference without deleting the provider asset. An upload followed by a DB failure may leave an orphan requiring owner-approved cleanup; automatic deletion is intentionally absent. Existing URLs do not receive guessed public IDs or automatic backfills. V13 is pending Aiven approval. Private identity documents remain DB-backed, not public Cloudinary images.

Live connectivity/CA, actual MySQL migration compatibility, real Cloudinary credentials/upload limits and email inbox delivery remain unverified and need owner-approved checks.
