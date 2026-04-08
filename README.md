# QA Automation API Testing — Playwright + TypeScript

A professional API test automation suite built with **Playwright Test** and **TypeScript**, targeting the [JSONPlaceholder](https://jsonplaceholder.typicode.com) REST API. This project demonstrates real-world QA engineering practices including positive, negative, and edge-case test coverage.


## 📋 Test Scenarios

### Suite 1 — GET /posts

| No | Test Case | Input | Expected Result | Type |
|----|-----------|-------|-----------------|------|
| TC-01 | Status code is 200 | `GET /posts` | HTTP 200 OK | ✅ Positive |
| TC-02 | Response is a non-empty array | `GET /posts` | `Array.isArray` = true, length > 0 | ✅ Positive |
| TC-03 | Each post has correct field types | `GET /posts` | All posts have `userId` (number), `id` (number), `title` (string), `body` (string) | ✅ Positive |
| TC-04 | Full dataset returns exactly 100 posts | `GET /posts` | `posts.length === 100` | ✅ Positive |

---

### Suite 2 — GET /posts/{id}

| No | Test Case | Input | Expected Result | Type |
|----|-----------|-------|-----------------|------|
| TC-05 | Valid ID returns status 200 | `GET /posts/1` | HTTP 200 OK | ✅ Positive |
| TC-06 | Response contains correct post ID | `GET /posts/5` | `post.id === 5` | ✅ Positive |
| TC-07 | Response matches Post schema | `GET /posts/1` | Fields `userId`, `id`, `title`, `body` present with correct types | ✅ Positive |
| TC-08 | Invalid ID (9999) returns 404 or empty object | `GET /posts/9999` | HTTP 404 OR empty object `{}` | ❌ Negative |
| TC-09 | Multiple valid IDs return correct data | `GET /posts/1,10,50,100` | Each response returns HTTP 200 with matching `id` | ✅ Positive |

---

### Suite 3 — POST /posts

| No | Test Case | Input | Expected Result | Type |
|----|-----------|-------|-----------------|------|
| TC-10 | Valid payload returns status 201 | `{ title, body, userId: 1 }` | HTTP 201 Created | ✅ Positive |
| TC-11 | Response contains auto-generated id | `{ title, body, userId: 1 }` | `post.id` is a number > 0 | ✅ Positive |
| TC-12 | Response echoes back title, body, userId | `{ title: "test title", body: "test body", userId: 1 }` | Response matches all three fields exactly | ✅ Positive |

---

### Suite 4 — Negative Test Cases

| No | Test Case | Input | Expected Result | Type |
|----|-----------|-------|-----------------|------|
| TC-13 | POST with missing fields | `{ title: "only title" }` — no `body` or `userId` | HTTP 201 (mock) or 400 (strict) | ❌ Negative |
| TC-14 | POST with empty body object | `{}` | HTTP 201 (mock) or 400 (strict) | ❌ Negative |
| TC-15 | GET invalid endpoint returns 404 | `GET /invalid-endpoint-xyz` | HTTP 404 Not Found | ❌ Negative |
| TC-16 | POST to non-existent resource returns 404 | `POST /nonexistent/resource` | HTTP 404 Not Found | ❌ Negative |

---

### Suite 5 — Edge Cases

| No | Test Case | Input | Expected Result | Type |
|----|-----------|-------|-----------------|------|
| TC-17 | Very long title (5 000 chars) | `title: "A".repeat(5000)` | Status < 500; if 201, title echoed back correctly | ⚠️ Edge |
| TC-18 | Very long body (10 000 chars) | `body: "B".repeat(10000)` | Status < 500 | ⚠️ Edge |
| TC-19 | Special characters in title | `title: "!@#$%^&*()..."` | HTTP 201, special chars preserved in response | ⚠️ Edge |
| TC-20 | XSS / HTML injection in body | `body: "<script>alert('xss')</script>"` | HTTP 201, raw string preserved (not executed) | ⚠️ Edge |
| TC-21 | userId as string instead of number | `userId: "1"` (string) | HTTP 201 (type coercion) or 400 (strict) | ⚠️ Edge |
| TC-22 | Query parameter filter `?userId=1` | `GET /posts?userId=1` | HTTP 200, all returned posts have `userId === 1` | ⚠️ Edge |

---

## 🛠 Tools & Technologies

| Tool | Version | Purpose |
|------|---------|---------|
| [Playwright Test](https://playwright.dev/docs/test-api-testing) | ^1.43.1 | API testing framework & runner |
| [TypeScript](https://www.typescriptlang.org/) | ^5.4.5 | Type-safe test authoring |
| Node.js | ≥18.x | Runtime environment |
| JSONPlaceholder | – | Free fake REST API (base URL) |

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
- **`test.describe` grouping** — Tests are organised into five logical groups for clear reporting.
- **Typed interfaces** — A `Post` TypeScript interface enforces correct shapes throughout every test.
- **`assertPostSchema` helper** — A reusable utility validates the Post schema, avoiding repetition across suites.
- **Conditional negative assertions** — Where JSONPlaceholder behaves differently from a production API (e.g. returning 201 for empty bodies), tests document both valid outcomes with `expect([200, 201, 400]).toContain(...)`.

---

## 📊 Expected Results

All **22 tests** should pass. The HTML report (`playwright-report/index.html`) provides a detailed breakdown per suite.

---
## Video Demo Automation API Testing
https://github.com/user-attachments/assets/99e34b02-caeb-49f5-a6a0-50a1e62b9e4e

