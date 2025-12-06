# Node.js API - Project Rules

## [api-naming-001] RESTful endpoint naming convention

**Area:** api
**Severity:** warn
**Tags:** api, rest, naming, conventions

**Description:**
All REST endpoints must use plural nouns and follow `/api/v1/{resource}` pattern.

**Rationale:**
Consistent API structure makes it easier for clients to discover and use endpoints. Following REST conventions improves interoperability.

**Good Example:**
```javascript
app.get('/api/v1/users', getUsers);
app.post('/api/v1/orders', createOrder);
app.get('/api/v1/products/:id', getProduct);
```

**Bad Example:**
```javascript
app.get('/api/getUser', getUser);
app.post('/api/create-order', createOrder);
app.get('/api/product', getProduct);
```

---

## [security-001] No hardcoded secrets

**Area:** security
**Severity:** blocker
**Tags:** security, secrets, credentials

**Description:**
Never hardcode API keys, passwords, or other secrets in source code. Use environment variables or a secrets management service.

**Rationale:**
Hardcoded secrets can be accidentally committed to version control and exposed. This is a critical security vulnerability.

**Good Example:**
```javascript
const apiKey = process.env.API_KEY;
const dbPassword = process.env.DB_PASSWORD;
```

**Bad Example:**
```javascript
const apiKey = 'sk_live_abc123def456';
const dbPassword = 'MyP@ssw0rd123';
```

---

## [testing-001] All API endpoints must have tests

**Area:** testing
**Severity:** error
**Tags:** testing, api, quality

**Description:**
Every API endpoint must have corresponding integration tests covering success and error cases.

**Rationale:**
Comprehensive testing prevents regressions and ensures API reliability.

**Good Example:**
```javascript
describe('GET /api/v1/users', () => {
  it('should return 200 with user list', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users');
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(401);
  });
});
```
