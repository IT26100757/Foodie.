# IntelliJ IDEA setup — new backend

This delivery contains a newly authored Spring Boot backend plus unchanged original UI files. It is NOT a completed frontend/backend integration. See FRONTEND_INTEGRATION_APPROVAL.md before authorizing UI handler changes. The backend serves APIs; the four existing builds are included as original artifacts, not wired into one production server. SPA direct-navigation/refresh integration is not claimed.

1. Extract the full ZIP to a new folder. Do not overwrite an older Foodie checkout. Install JDK 17 and IntelliJ IDEA.
2. In IntelliJ choose Open and select the extracted Foodie root folder. You will see backend/ and frontend/. Right-click backend/pom.xml and choose Add as Maven Project (or use the Maven tool window to link that pom). Set Project SDK and Maven runner JRE to Java 17. Allow Maven to download dependencies. No previous backend or JWT configuration is needed.
3. Run Maven Lifecycle > clean, then verify (or `mvn clean verify`). The tests use isolated H2 databases and do not require Aiven or email credentials. Expected result for this delivery: 31 tests, no failures/errors/skips. H2 verifies migration syntax and ORM validation in MySQL compatibility mode; it does not prove live MySQL compatibility.
4. For live deployment, create a NEW dedicated MySQL database/schema in your existing Aiven service. Obtain your host, port, database name, username and password from Aiven. Preserve existing records and take a backup. Do not point a first run at an old nonempty schema, enable baseline-on-migrate, run clean, or delete migration history. The backend uses nf_ tables and nf_schema_history. Flyway refuses unsafe initial baselining by default. No existing Aiven records were accessed or modified during verification.
5. Open Run > Edit Configurations > Application. Main class: com.foodie.FoodieApplication (select the actual application class in src/main/java if IntelliJ completes it). Use the backend module and JDK17. Add these environment variables using your own values:

```
AIVEN_MYSQL_URL=jdbc:mysql://YOUR_HOST:YOUR_PORT/YOUR_NEW_DATABASE?sslMode=VERIFY_IDENTITY
AIVEN_MYSQL_USER=YOUR_USER
AIVEN_MYSQL_PASSWORD=YOUR_PASSWORD
PORT=8081
SMTP_ENABLED=true
SMTP_HOST=YOUR_SMTP_HOST
SMTP_PORT=587
SMTP_USER=YOUR_SMTP_LOGIN
SMTP_PASSWORD=YOUR_SMTP_APP_PASSWORD
SMTP_FROM=YOUR_VERIFIED_SENDER
BANK_ENCRYPTION_KEY=YOUR_BASE64_ENCODED_RANDOM_32_BYTE_KEY
FOODIE_ADMIN_EMAIL=YOUR_ADMIN_EMAIL
FOODIE_ADMIN_PASSWORD=YOUR_UNIQUE_STRONG_PASSWORD
SESSION_COOKIE_SECURE=false
```

These are instructions, not supplied credentials. Use IntelliJ's local environment editor; never commit them or export a run configuration containing secrets. A .env file is not automatically loaded. Aiven TLS must validate the host and trusted certificate chain; install the actual Aiven CA in a private Java trust store if required by your service. Do not disable TLS verification. Admin bootstrap password must contain 14–72 UTF-8 bytes. Bootstrap creates an admin only when configured and not already present; remove bootstrap password from the environment after initial setup.

6. Generate a bank key once using a cryptographically secure generator (32 random bytes, Base64). Store it privately and back it up; losing/changing it prevents decryption of saved bank details. Never use a sample key. Bank APIs refuse to save account numbers without a configured key.
7. For Gmail SMTP use your own account's app password if supported, not the account login password. Other providers may use different SMTP settings. With SMTP_ENABLED=false notification records are persisted as DISABLED; this is not email delivery. With credentials, verify a real registration, approval and rejection in your inbox and inspect notification status. Live SMTP delivery was not verified in this delivery.
8. Run the application, check startup reports Flyway success and JPA validation, then open http://localhost:8081/login or GET /api/csrf. Default port is 8081. APIs use session cookies, not bearer JWT. Cross-origin frontend development requests need an approved proxy/cookie/CSRF configuration; no wildcard CORS is enabled. Same-origin unsafe requests are accepted only with an exact matching Origin; otherwise obtain /api/csrf and submit its token/header with the session cookie.
9. For deployed HTTPS set SESSION_COOKIE_SECURE=true. Keep secrets outside project and ZIP. Stop the application normally in IntelliJ.
10. The existing Customer/Merchant/Driver/Admin sources and dist files are preserved. Run their own package.json scripts only in a separate working copy if rebuilding; recovered source snapshots have not been proven to reproduce the supplied dist commits. No frontend build or API wiring is claimed tested. Review the integration document first.

Optional packaged startup: `java -jar backend/foodie-new-backend-1.0.0.jar` with the same private environment variables. This starts the API backend, not an integrated four-portal host. Card payments return unavailable until a real gateway is configured; the original card UI remains in the untouched frontend. No bank transfer is executed automatically; settlement endpoints record verified manual settlement only.


## Four independent frontend projects

All four portals are under Foodie/frontend. Open each package.json from the IntelliJ Project pane and run its scripts in a separate npm run configuration. Use Node.js 24 (the verified runtime was 24.22.1) and npm 11. The original package.json and package-lock.json files are unchanged. Install with `npm ci` in each portal folder before running:

| Portal | Working directory | Development URL |
|---|---|---|
| Customer | frontend/customer | http://localhost:5174 |
| Merchant | frontend/merchant | http://localhost:5173 |
| Driver | frontend/driver | http://localhost:5175 |
| Admin | frontend/admin | http://localhost:5176 |

Run `npm run dev -- --configLoader native` in each folder. Run `npm run build -- --configLoader native` to build that portal independently. Native config loading was used to avoid a Windows process-launch restriction affecting Vite's bundled config loader in the verification environment. No package scripts or package versions were changed. Output is build/; supplied original dist/ remains preserved. To preview a new build, use `npm run preview -- --configLoader native --port 5274` (choose a distinct preview port for each portal).

Every development /api request proxies to http://localhost:8081; Admin /login and /logout also proxy there. This preserves session cookies on the development origin. These proxy settings provide a backend address; disconnected original click handlers still require the approved integration work described separately. This reorganization does not complete API integration. No combined production server or visual regression run is claimed for this folder-only update. Images, CSS, React components and source JavaScript are hash-identical to the delivered baseline.

The full project is four independent React apps plus one Spring Boot backend. It is not one merged React app. Do not move any portal into another frontend/ subfolder. No credentials, node_modules or IDE secret-bearing run configurations are included in the ZIP.
