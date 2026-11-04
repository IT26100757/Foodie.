# Aiven database policy — user correction, 4 November 2026

Normal application startup uses only AIVEN_MYSQL_URL, AIVEN_MYSQL_USER and AIVEN_MYSQL_PASSWORD. No local database fallback exists in main configuration. All four portal proxies use the same Spring Boot backend; portals never hold database credentials.

Use AIVEN_MYSQL_SSL_MODE=VERIFY_IDENTITY (the default). Obtain the exact connection URL and SSL/CA requirements from your Aiven service. Use a private Java trust store when the service CA is not already trusted; never disable certificate verification for Aiven. Do not place passwords or trust-store secrets in source, Git, ZIP files or shared IntelliJ run configurations.

Flyway execution is disabled by default with FOODIE_MIGRATIONS_ENABLED=false. Flyway clean is disabled and Hibernate uses ddl-auto=validate. Review the complete migration scripts and obtain explicit user approval before enabling migrations against Aiven. Do not baseline, reset, clean or overwrite an existing database. Existing non-Foodie tables are not migration targets. Pending schema changes may prevent startup until reviewed and approved; they must not be applied silently.

Automated tests use isolated in-memory H2 databases in MySQL compatibility mode. Test-only fixtures refuse other databases and are excluded from the application JAR. Never use existing Aiven records for destructive tests. Ask before using a separate Aiven test database.

A separate local MySQL instance had already been initialized for testing before this correction. It was stopped after the correction and is no longer used. Its workspace data files are outside the Foodie project, are not deliverables, and will not be packaged. No Aiven connection or data operation was performed during this setup.
