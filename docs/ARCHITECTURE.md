# Enterprise Playwright Automation Architecture — Practice Software Testing: Toolshop v5.0

## 1. System Under Test (SUT)

| Property | Specification |
| :--- | :--- |
| **Application Name** | Practice Software Testing — Toolshop v5.0 (Enterprise Hardware & Equipment Store) |
| **Frontend SPA** | `https://practicesoftwaretesting.com` (Angular 20, RxJS, Reactive Forms, ngx-slider, Transloco i18n) |
| **Backend API** | `https://api.practicesoftwaretesting.com` (REST + GraphQL `/graphql` Product Comparison Engine) |
| **Language & Runtime** | TypeScript 5.8 (`strict: true`, ESNext + Bundler resolution), Node.js 20+, Playwright 1.52+ |
| **Total Automated Scenarios** | **382 Test Cases across 12 Functional, Security, Accessibility & API Contract Suites** |

---

## 2. Layered Enterprise Framework Architecture

```mermaid
flowchart TD
    subgraph Specs["Test Specification Layer (tests/01..12 - 382 Scenarios)"]
        S01["01 Catalog, Filters & Search (38)"]
        S02["02 Product Details, CO2 & Specs (40)"]
        S03["03 Equipment Rentals & Slider (24)"]
        S04["04 Auth, JWT & Lockout (34)"]
        S05["05 International Registration (32)"]
        S06["06 4-Step Checkout Wizard (38)"]
        S07["07 Contact & File Upload (28)"]
        S08["08 Customer Account Portal (26)"]
        S09["09 Navigation, i18n & Widgets (30)"]
        S10["10 OWASP Security & RBAC (26)"]
        S11["11 WCAG Axe-Core & Viewports (28)"]
        S12["12 REST & Zod API Contracts (38)"]
    end

    subgraph Fixtures["Dependency Injection & Hybrid Network Layer (src/fixtures/)"]
        BF["base.fixture.ts (DI Container + Disk-Backed Static Asset Cache)"]
        API["ToolshopApiInterceptor.ts (Stateful In-Memory REST + GraphQL Engine)"]
    end

    subgraph POM["Page Object & Component Layer (src/pages/)"]
        BP["BasePage.ts"]
        NAV["NavbarComponent.ts"]
        CAT["CatalogPage.ts"]
        PDP["ProductDetailsPage.ts"]
        RNT["RentalsPage.ts"]
        AUT["AuthPage.ts"]
        CHK["CheckoutWizardPage.ts"]
        CNT["ContactPage.ts"]
        ACC["AccountPortalPage.ts"]
    end

    subgraph DataSchemas["Data Factory, Schemas & Utilities (src/data/, src/schemas/, src/utils/)"]
        DAT["Catalog / Users / Checkout Data"]
        ZOD["Zod Runtime API Schemas (toolshop.schema.ts)"]
        UTL["Logger / MathHelper / SecurityHelper / EnterpriseReporter"]
    end

    Specs --> Fixtures
    Fixtures --> POM
    Fixtures --> API
    POM --> DataSchemas
    Specs --> DataSchemas
```

---

## 3. Key Architectural Highlights

1. **Zero-Config TypeScript Bundler Resolution (`tsconfig.json`)**:
   - Uses `"module": "ESNext"` and `"moduleResolution": "bundler"` with relative `./src/*` path aliases (`@config/*`, `@pages/*`, `@fixtures/*`, `@data/*`, `@utils/*`, `@api/*`, `@schemas/*`) and no deprecated `baseUrl` option.
2. **Stateful REST & GraphQL Microservice Interceptor (`src/api/ToolshopApiInterceptor.ts`)**:
   - Provides deterministic, zero-flake execution across 6 parallel workers while running the real Angular 20 SPA bundles in Chromium.
   - Simulates full stateful lifecycles for `/products`, `/categories`, `/brands`, `/carts`, `/users/login` (including 4-strike HTTP 423 brute-force lockout), `/users/register`, `/users/refresh`, `/users/me`, `/payment/check` (5 payment methods), `/invoices`, `/favorites`, `/messages`, and `/graphql` product comparison queries.
3. **2-Tier Static Bundle Caching (`src/fixtures/base.fixture.ts`)**:
   - Caches Angular 20 JS/CSS bundles in memory and on disk (`playwright/.cache/toolshop-v5-assets`) to eliminate network latency and third-party CDN flakiness.
4. **Custom Telemetry & Reporting (`src/utils/enterprise.reporter.ts`)**:
   - Emits real-time test progress and generates `reports/enterprise-execution-summary.json` and `reports/EXHIBITION_SUMMARY.md` after every test run.
