# IntelliJ IDEA setup — current integrated delivery

## 1. Extract and open

1. Extract Foodie-API-Integrated.zip into a new folder; do not overwrite an older checkout.
2. Open its Foodie folder in IntelliJ. Right-click backend/pom.xml → Add as Maven Project. Set Project SDK and Maven runner JRE to Java 17. Reload Maven dependencies. Maven 3.9 is recommended.
3. Use Node 24/npm 11 when rebuilding (verified: Node24.22.1/npm11.19.1). No VS Code is required.

## 2. Private Aiven configuration

Create an Application run configuration for com.foodie.FoodieApplication, classpath module foodie-new-backend, working directory the extracted Foodie/backend folder. Set these privately under Run → Edit Configurations → Environment variables:

| Variable | Meaning |
|---|---|
| AIVEN_MYSQL_URL | jdbc:mysql://YOUR_AIVEN_HOST:PORT/EXISTING_DATABASE — no credentials in URL |
| AIVEN_MYSQL_USER | Your Aiven username |
| AIVEN_MYSQL_PASSWORD | Your Aiven password |
| AIVEN_MYSQL_SSL_MODE | VERIFY_IDENTITY (default) |
| FOODIE_MIGRATIONS_ENABLED | false until you explicitly approve the reviewed migrations |
| BANK_ENCRYPTION_KEY | Base64 encoding of exactly 32 random bytes; keep stable across restarts |
| FOODIE_FRONTEND_ROOT | Absolute path to extracted Foodie/frontend; optional when working directory is backend |
| PORT | 8081 (default) |

If Aiven requires a private CA, obtain its CA certificate and import it into a dedicated JVM truststore with keytool; configure javax.net.ssl.trustStore and its password privately. Do not disable identity verification or use trustServerCertificate=true. No live SSL connection was verified. Never paste credentials into chat, React, Git or exported IDE run configurations.

The application has NO localhost database fallback. H2 is test-scoped. Do not activate browser-test for ordinary use; its launcher/fixtures are excluded from the application JAR.

## 3. Review schema before first live launch

Read DATABASE_AND_CLOUD.md. Flyway defaults OFF, clean and automatic baseline are disabled, and Hibernate only validates the schema. Missing nf_ tables must fail startup instead of silently creating data. Back up Aiven and review V1–V13 and existing nf_schema_history with the owner. Do not turn on migrations merely to suppress startup errors.

Only after your explicit permission and backup, an approved one-time run with FOODIE_MIGRATIONS_ENABLED=true may apply approved pending migrations. Set it back to false afterward. Existing tables without this history require a deliberate migration/history plan, not a guessed baseline. No migration was applied to Aiven here.

No production business policies are seeded. An authenticated Admin supplies actual fees/rates/reward values in Dashboard → Edit business policies (GET/PUT /api/admin/policies; keys in DATABASE_AND_CLOUD.md). Missing configuration returns an error, not invented fees.

Optional first Admin provisioning uses FOODIE_ADMIN_EMAIL and FOODIE_ADMIN_PASSWORD (14–72 UTF-8 bytes). This creates an account only if absent and therefore requires your authorization for the live write. Remove bootstrap variables afterward. No password is shipped.

## 4. Cloudinary

Set backend-only CLOUDINARY_URL, OR CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET. Never expose secrets through VITE_ variables. CLOUDINARY_UPLOADS_ENABLED defaults false; enable only after authorizing real uploads. Existing image URLs still render. New logos/menu images/profile pictures use scoped uploads and persist URL/public ID in Aiven. No automatic overwrite/delete or live test upload occurs. See DATABASE_AND_CLOUD.md for failure/orphan limitations.

## 5. Email

Set SMTP_ENABLED=true when ready for real sends. Configure SMTP_HOST, SMTP_PORT (usually587), SMTP_USER, SMTP_PASSWORD and SMTP_FROM according to your provider. Authenticated STARTTLS is enabled. Set FOODIE_CUSTOMER_URL, FOODIE_MERCHANT_URL, FOODIE_DRIVER_URL and FOODIE_ADMIN_URL to the real portal URLs for setup/recovery links. One-server local values are http://localhost:8081, http://localhost:8081/merchant/, http://localhost:8081/driver/, http://localhost:8081/admin/.

Notifications record DISABLED/QUEUED/SENT/FAILED. SENT means the SMTP send call succeeded, not proof of inbox delivery. Automated tests mock SMTP. Actual approval/rejection/setup/recovery email delivery is unverified.

## 6. Run one Spring Boot server

1. The ZIP includes four current build/ directories and backend/foodie-new-backend-1.0.0.jar.
2. After approved schema setup and private environment configuration, run FoodieApplication in IntelliJ.
3. Open Customer http://localhost:8081/ ; Merchant http://localhost:8081/merchant/ ; Driver http://localhost:8081/driver/ ; Admin http://localhost:8081/admin/ .
4. Customer /login, /store/ID, /checkout and /track-order support direct navigation/refresh. Other apps retain original internal view state and return to their default view after refresh.
5. One production-origin session represents one account. Use separate browser profiles/private contexts for different roles concurrently. Signing into another role replaces that browser's account; role restrictions still apply. Four simultaneous roles on one production cookie are not claimed.
6. For deployed HTTPS set SESSION_COOKIE_SECURE=true, correct public portal URLs and a trusted reverse proxy. HTTPS/proxy deployment is not verified here.

Alternative from the backend working directory: java -jar foodie-new-backend-1.0.0.jar with the same environment. Frontends resolve through FOODIE_FRONTEND_ROOT or ../frontend.

## 7. Rebuild/run independent portals

In EACH frontend/customer, frontend/merchant, frontend/driver and frontend/admin folder, run in IntelliJ Terminal:

```powershell
npm ci
npm run build -- --configLoader native
```

Output is build/. Do not edit/use dist/ as the integrated version. Merchant/Driver/Admin production asset bases are /merchant/, /driver/, /admin/. Native config loading avoids the Windows process-launch restriction encountered during verification. Dependency manifests/locks remain unchanged.

For development run npm run dev -- --configLoader native separately: Customer5174, Merchant5173, Driver5175, Admin5176. All /api calls proxy to the SAME Spring Boot at http://localhost:8081. FOODIE_BACKEND_URL optionally changes the proxy target. Portal-specific development cookies are translated to backend sessions so localhost port sharing does not overwrite roles. Use Spring Boot to preview production; plain vite preview does not provide API proxies.

## 8. Safe tests

From backend: mvn clean verify. Frontend build/ files are needed by the one-server asset tests and are included. Tests use isolated H2/mock providers, never live Aiven. From Foodie root: node --test --test-isolation=none frontend/customer/test/api-contracts.test.mjs . No-isolation avoids this environment's child-process restriction.

Card UI stays visible but unavailable without a real gateway; no card storage/simulated success. Payouts create requests pending review, not bank transfers. Delivery completion does not mark cash collected. See TEST_RESULTS.md and REMAINING_INTEGRATION.md.
