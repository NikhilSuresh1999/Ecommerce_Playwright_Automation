# Enterprise Test Scenario Catalog — 382 Automated Test Cases

Target Application: **Practice Software Testing — Toolshop v5.0** (`https://practicesoftwaretesting.com`)

| Suite # | Suite Directory | Spec File | Scenarios | ID Range | Core Coverage Area |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **01** | `tests/01-catalog-filtering-sorting` | `catalog.spec.ts` | **38** | `CAT-001` – `CAT-038` | Pagination, 6-option sorting, 14 category/subcategory checkboxes, 4 brands, eco-friendly filter, keyword search |
| **02** | `tests/02-product-details-specs` | `product-details.spec.ts` | **40** | `PDP-001` – `PDP-040` | All 12 tool PDPs, CO2 rating badges (`A`–`E`), technical specs table, quantity stepper, out-of-stock guardrails, wishlist |
| **03** | `tests/03-equipment-rentals` | `rentals.spec.ts` | **24** | `RNT-001` – `RNT-024` | Heavy equipment rentals (Excavator, Bulldozer, Crane), hourly duration slider (1–5h), rental cart aggregation |
| **04** | `tests/04-authentication-login` | `auth-login.spec.ts` | **34** | `AUTH-001` – `AUTH-034` | Customer/Admin JWT auth, 15 invalid credential matrix tests, 4-attempt brute-force lockout (HTTP 423), password recovery |
| **05** | `tests/05-user-registration` | `registration.spec.ts` | **32** | `REG-001` – `REG-032` | 10 international customer profiles, country-aware postcode regex validation, password complexity, underage DOB rejection |
| **06** | `tests/06-shopping-cart-checkout-wizard` | `checkout-wizard.spec.ts` | **38** | `CHK-001` – `CHK-038` | 4-step Angular checkout wizard, 8 payment scenarios (Bank Transfer, COD, Credit Card, BNPL 3/6/9/12m, Gift Card), cart math |
| **07** | `tests/07-contact-support-tickets` | `contact.spec.ts` | **28** | `CNT-001` – `CNT-028` | 6 support subjects, 50-char minimum message boundary matrix, `.txt` 0-byte attachment rules, authenticated prefill |
| **08** | `tests/08-customer-account-portal` | `account-portal.spec.ts` | **26** | `ACC-001` – `ACC-026` | Dashboard navigation, profile updates, password change validation, wishlist management, invoice details & PDF button |
| **09** | `tests/09-navigation-i18n-widgets` | `navigation-i18n.spec.ts` | **30** | `NAV-001` – `NAV-030` | 6-language switcher (`EN, DE, ES, FR, NL, TR`), category routes, product comparison bar (`/comparison`), AI chat & live feed |
| **10** | `tests/10-security-access-control` | `security.spec.ts` | **26** | `SEC-001` – `SEC-026` | 13 OWASP XSS/SQLi payloads, unauthenticated `UserAuthGuard` redirects, RBAC `AdminAuthGuard` enforcement, JWT tampering |
| **11** | `tests/11-accessibility-responsive-network` | `a11y-responsive-network.spec.ts` | **28** | `A11Y-001` – `NET-028` | WCAG 2.1 Axe-Core audits across 6 routes, 12 responsive viewport checks (1080p to iPhone SE), API latency & 500 resilience |
| **12** | `tests/12-api-contract-suite` | `toolshop-api.spec.ts` | **38** | `API-001` – `API-038` | Zod schema contract checks for products, categories, brands, carts, auth, brute-force 423, payments, invoices, messages |
| **Total** | **12 Enterprise Suites** | **12 Spec Files** | **382** | **100% Automated** | **Full-Stack E2E UI + Security + Accessibility + Responsive + REST/GraphQL API Contracts** |
