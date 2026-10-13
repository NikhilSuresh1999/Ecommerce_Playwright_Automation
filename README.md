# 🏗️ Enterprise Playwright TypeScript Test Automation Framework (Toolshop v5.0)

[![Playwright](https://img.shields.io/badge/Playwright-1.52+-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Zod](https://img.shields.io/badge/Zod-Contract_Validation-3E67B1?style=for-the-badge)](https://zod.dev/)
[![Axe-Core](https://img.shields.io/badge/WCAG_2.1_AA-Axe_Core-005A9C?style=for-the-badge)](https://github.com/dequelabs/axe-core)

An **Enterprise-Grade End-to-End (E2E), API Contract, Security, and Accessibility Test Automation Framework** engineered from scratch in **Playwright + TypeScript** targeting **Practice Software Testing — Toolshop v5.0** (`https://practicesoftwaretesting.com` + `https://api.practicesoftwaretesting.com`).

Designed as a production-ready portfolio architecture covering **380+ automated test scenarios across 12 specialized domain suites** with **100% deterministic pass rates**.

---

## 🎯 Target Application Under Test (AUT)

| Layer | Technology Stack | Endpoint |
| :--- | :--- | :--- |
| **Frontend Web SPA** | Angular 20 / Bootstrap 5 / Transloco i18n / Ngx-Slider | `https://practicesoftwaretesting.com` |
| **Backend REST API** | Laravel REST API / JWT Auth / OpenAPI Schema | `https://api.practicesoftwaretesting.com` |

### Key Application Capabilities Covered
- **Multi-Faceted Product Catalog**: Real-time search, 6-way sorting (Name A-Z/Z-A, Price Low-High/High-Low, CO₂ Rating A-E/E-A), dynamic price range slider, nested category tree filters (`Hand Tools`, `Power Tools`, `Other`), brand filters (`ForgeFlex Tools`, `MightyCraft Hardware`), Eco-Friendly badge filter, and multi-page pagination.
- **Product Details & Engineering Specifications**: Technical specifications table (`Handle Material`, `Length`, `Material`, `Warranty`, `Weight`), CO₂ sustainability rating scale (`A`–`E`), out-of-stock guardrails, quantity steppers, product comparison bar, and wishlist favorites.
- **Heavy Equipment Rentals**: Dedicated `/rentals` catalog (`Excavator`, `Bulldozer`, `Crane`) with hourly duration sliders and rental cart integration.
- **4-Step Checkout Wizard & 5 Payment Gateways**: Cart review & reactive line math $\rightarrow$ Sign-In verification $\rightarrow$ International Billing Address $\rightarrow$ Payment Processing (`Bank Transfer`, `Cash on Delivery`, `Credit Card`, `Buy Now Pay Later` 3/6/9/12 monthly installments, and `Enterprise Gift Card`).
- **Role-Based Authentication & Account Portal**: JWT `Bearer` authentication (`user` & `admin` roles), brute-force account lockout (`HTTP 423`), password reset, international customer registration, profile editing, favorites management, PDF invoice history, and support ticket threads.
- **Global Navigation, 6-Locale i18n, Security & Accessibility**: Multi-language switcher (`EN`, `DE`, `ES`, `FR`, `NL`, `TR`), AI Chat assistant widget, Live Shop Activity feed, OWASP XSS/SQLi/RBAC security testing, WCAG 2.1 AA `@axe-core/playwright` audits, and Zod REST API schema validation.

---

## 🏛️ Enterprise Framework Architecture

```text
enterprise-playwright-framework/
├── .github/
│   └── workflows/
│       └── playwright-enterprise-ci.yml      # 4-Shard Matrix GitHub Actions CI/CD Pipeline
├── docs/
│   ├── ARCHITECTURE.md                       # Layered system design & engineering patterns
│   └── TEST_SCENARIO_CATALOG.md              # Full 380+ test case traceability matrix
├── src/
│   ├── api/
│   │   ├── schemas/
│   │   │   └── toolshop.schema.ts            # Zod runtime schemas (Product, Cart, Auth, Invoice)
│   │   └── ToolshopApiInterceptor.ts         # Deterministic REST API Engine & Route Interceptor
│   ├── config/
│   │   └── env.config.ts                     # Typed environment & execution configuration
│   ├── data/
│   │   ├── toolshop.catalog.data.ts          # 12 hardware products, 3 rentals, categories, brands
│   │   ├── toolshop.checkout.data.ts         # 8 payment scenarios, 6 support tickets, 6 locales
│   │   └── toolshop.users.data.ts            # Customer/Admin/Locked accounts, JWT builder, 10 reg profiles
│   ├── fixtures/
│   │   └── base.fixture.ts                   # Dependency-injected POM fixtures & 2-tier asset cache
│   ├── pages/
│   │   ├── components/
│   │   │   └── NavbarComponent.ts            # Top navbar, category menu, i18n switcher, chat/activity widgets
│   │   ├── BasePage.ts                       # Abstract base POM with storage, navigation & wait helpers
│   │   ├── CatalogPage.ts                    # Home catalog, search, sort, brand/category/eco filters
│   │   ├── ProductDetailsPage.ts             # PDP metadata, technical specs table, quantity & cart actions
│   │   ├── RentalsPage.ts                    # Heavy equipment rental catalog & hourly slider page
│   │   ├── AuthPage.ts                       # Login, Registration, Forgot Password & fast JWT injection
│   │   ├── CheckoutWizardPage.ts             # 4-step checkout stepper & 5 payment method forms
│   │   ├── ContactPage.ts                    # Support ticket form, subject routing & file upload validation
│   │   └── AccountPortalPage.ts              # Customer dashboard, profile, favorites, invoices & messages
│   └── utils/
│       ├── custom-reporter.ts                # Executive JSON/Markdown/Console summary reporter
│       ├── logger.ts                         # Structured step & assertion telemetry logger
│       ├── math.helper.ts                    # Currency parsing & financial rounding utilities
│       └── security.helper.ts                # 13 OWASP XSS/SQLi/Injection payloads & session purger
├── tests/
│   ├── 01-catalog-filtering-sorting/         # Suite 01: Catalog Grid, Pagination, Sort, Search & Filters
│   ├── 02-product-details-specs/             # Suite 02: PDP Metadata, Specs Table, CO2 & Cart Actions
│   ├── 03-equipment-rentals/                 # Suite 03: Heavy Equipment Rentals & Duration Slider
│   ├── 04-authentication-login/              # Suite 04: RBAC Login, 16 Negative Cases, Lockout & Reset
│   ├── 05-user-registration/                 # Suite 05: 10 International Profiles & Form Validations
│   ├── 06-shopping-cart-checkout-wizard/     # Suite 06: 4-Step Checkout Wizard & 8 Payment Scenarios
│   ├── 07-contact-support-tickets/           # Suite 07: Support Tickets, 6 Subjects & File Attachments
│   ├── 08-customer-account-portal/           # Suite 08: Profile, Favorites, Invoices & Messages
│   ├── 09-navigation-i18n-widgets/           # Suite 09: Navbar, Category Routes, 6-Locale i18n & Widgets
│   ├── 10-security-access-control/           # Suite 10: OWASP XSS/SQLi, JWT Tampering & Route Guards
│   ├── 11-accessibility-responsive-network/  # Suite 11: Axe-Core WCAG 2.1, 6 Viewports & Fault Tolerance
│   └── 12-api-contract-suite/                # Suite 12: Zod Schema Contract & Microservice Lifecycle
├── .env.example
├── package.json
├── playwright.config.ts
└── tsconfig.json
```

---

## 🚀 Quick Start & Execution Commands

### 1. Install Dependencies & Browser Binaries
```bash
cd enterprise-playwright-framework
npm install
npx playwright install chromium
```

### 2. Run Full 380+ Enterprise Test Suite
```bash
npm test
```

### 3. Run Individual Domain Test Suites
```bash
npm run test:catalog        # Suite 01: Catalog, Filtering, Sorting & Search
npm run test:pdp            # Suite 02: Product Details, Specs & Cart Actions
npm run test:rentals        # Suite 03: Heavy Equipment Rentals
npm run test:auth           # Suite 04: Authentication, Lockout & Password Reset
npm run test:register       # Suite 05: International User Registration
npm run test:checkout       # Suite 06: 4-Step Checkout Wizard & 5 Payment Methods
npm run test:contact        # Suite 07: Support Tickets & File Attachments
npm run test:account        # Suite 08: Customer Account Portal, Favorites & Invoices
npm run test:navigation     # Suite 09: Global Navigation, 6-Locale i18n & Widgets
npm run test:security       # Suite 10: OWASP Security & RBAC Access Control
npm run test:a11y-network   # Suite 11: WCAG Accessibility, Responsive & Network Resilience
npm run test:api            # Suite 12: REST API Contract & Zod Schema Validation
```

### 4. TypeScript Typecheck & HTML Reports
```bash
npm run typecheck           # Zero-warning TypeScript 5.8 compiler check
npm run report              # Open interactive Playwright HTML report
```
