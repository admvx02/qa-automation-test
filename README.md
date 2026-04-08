# QA Automation API Testing — Playwright + TypeScript

A professional API test automation suite built with **Playwright Test** and **TypeScript**, targeting the [JSONPlaceholder](https://jsonplaceholder.typicode.com) REST API. This project demonstrates real-world QA engineering practices including positive, negative, and edge-case test coverage.

---

## 🛠 Tools & Technologies

| Tool | Version | Purpose |
|------|---------|---------|
| [Playwright Test](https://playwright.dev/docs/test-api-testing) | ^1.43.1 | API testing framework & runner |
| [TypeScript](https://www.typescriptlang.org/) | ^5.4.5 | Type-safe test authoring |
| Node.js | ≥18.x | Runtime environment |
| JSONPlaceholder | – | Free fake REST API (base URL) |

---

## 📁 Project Structure

```
qa-automation-test/
├── tests/
│   └── api.spec.ts       # All API test cases
├── playwright.config.ts  # Playwright configuration
├── tsconfig.json         # TypeScript compiler options
├── package.json          # Dependencies & npm scripts
└── README.md             # Project documentation
```

---

## ⚙️ Installation

> **Prerequisites:** Node.js ≥ 18 must be installed.

```bash
# 1. Install npm dependencies
npm install

# 2. Install Playwright (no browsers needed for API-only testing)
npx playwright install
```

---

## ▶️ Running Tests

```bash
# Run all tests (default: list reporter in terminal)
npm test

# Run tests and generate an HTML report
npm run test:report

# Open the HTML report in your browser
npm run show-report
```

---

## 🗂 Endpoints Under Test

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/posts` | Fetch all posts |
| `GET` | `/posts/{id}` | Fetch a single post by ID |
| `POST` | `/posts` | Create a new post |

---

## 🧪 Testing Approach

### ✅ Positive Tests
Verify that the API returns the correct HTTP status codes, response schemas, and data values for valid requests.

- `GET /posts` → 200, array of 100 posts, each with `userId`, `id`, `title`, `body`
- `GET /posts/{id}` → 200, correct post ID echoed back, valid schema
- `POST /posts` → 201, auto-generated `id`, echoed `title`, `body`, `userId`

### ❌ Negative Tests
Ensure the API handles invalid or incomplete requests gracefully without crashing.

- `POST` with missing fields → 201 (mock) or 400 (strict API)
- `POST` with an empty body `{}` → 201 (mock) or 400
- `GET /invalid-endpoint` → 404
- `POST /nonexistent/resource` → 404
- `GET /posts/9999` → 404 or empty object (handled conditionally)

### ⚠️ Edge Cases
Stress-test for boundary conditions and unexpected input types.

- Very long `title` string (5 000 chars) — should not cause 5xx
- Very long `body` string (10 000 chars) — should not cause 5xx
- Special characters in payload (`!@#$%^&*`, XSS strings) — preserved correctly
- `userId` sent as a string instead of a number — type coercion handling
- Query-parameter filtering (`/posts?userId=1`) — only matching posts returned

---

## 🏗 Design Decisions

- **`request` fixture** — Playwright's built-in `APIRequestContext` is used directly via the `request` fixture; no third-party HTTP client is needed.
- **`async/await`** — All network calls use `async/await` for readability and reliable error propagation.
- **`test.describe` grouping** — Tests are organised into four logical groups for clear reporting.
- **Typed interfaces** — A `Post` TypeScript interface enforces correct shapes throughout every test.
- **`assertPostSchema` helper** — A reusable utility validates the Post schema, avoiding repetition across suites.
- **Conditional negative assertions** — Where JSONPlaceholder behaves differently from a production API (e.g. returning 201 for empty bodies), tests document both valid outcomes with `expect([200, 201, 400]).toContain(...)`.

---

## 📊 Expected Results

All **21 tests** should pass. The HTML report (`playwright-report/index.html`) provides a detailed breakdown per suite.

---
## Video Demo Automation API Testing
https://github.com/user-attachments/assets/99e34b02-caeb-49f5-a6a0-50a1e62b9e4e

## 👤 Author

Muhammad Adam Romadhon
Framework: **Playwright Test** | Language: **TypeScript** | API: **JSONPlaceholder**
