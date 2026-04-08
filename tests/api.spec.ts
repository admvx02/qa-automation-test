import { test, expect, APIRequestContext } from '@playwright/test';

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}
function assertPostSchema(post: Post): void {
  expect(typeof post.userId).toBe('number');
  expect(typeof post.id).toBe('number');
  expect(typeof post.title).toBe('string');
  expect(typeof post.body).toBe('string');
}

// Test Suite: GET /posts

test.describe('GET /posts', () => {

  test('should return status 200', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.get('/posts');
    expect(response.status()).toBe(200);
  });

  test('should return an array of posts', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.get('/posts');
    const body: Post[] = await response.json();

    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
  });

  test('each post should contain required fields with correct types', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.get('/posts');
    const posts: Post[] = await response.json();

    for (const post of posts) {
      assertPostSchema(post);
    }
  });

  test('should return exactly 100 posts (full dataset)', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.get('/posts');
    const posts: Post[] = await response.json();

    expect(posts.length).toBe(100);
  });
});

// Test Suite: GET /posts/{id}

test.describe('GET /posts/{id}', () => {

  test('valid ID should return status 200', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.get('/posts/1');
    expect(response.status()).toBe(200);
  });

  test('response should contain the correct post ID', async ({ request }: { request: APIRequestContext }) => {
    const targetId = 5;
    const response = await request.get(`/posts/${targetId}`);
    const post: Post = await response.json();

    expect(post.id).toBe(targetId);
  });

  test('response should have valid Post schema', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.get('/posts/1');
    const post: Post = await response.json();

    assertPostSchema(post);
  });

  test('invalid ID (9999) should return 404 or empty object', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.get('/posts/9999');
    const status = response.status();
    const body: Record<string, unknown> = await response.json();


    if (status === 404) {
      expect(status).toBe(404);
    } else {
      expect(Object.keys(body).length).toBe(0);
    }
  });

  test('should return posts for multiple valid IDs', async ({ request }: { request: APIRequestContext }) => {
    const ids = [1, 10, 50, 100];

    for (const id of ids) {
      const response = await request.get(`/posts/${id}`);
      expect(response.status()).toBe(200);

      const post: Post = await response.json();
      expect(post.id).toBe(id);
    }
  });
});

// Test Suite: POST /posts

test.describe('POST /posts', () => {
  const validPayload = {
    title: 'test title',
    body: 'test body',
    userId: 1,
  };

  test('should return status 201 on valid payload', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.post('/posts', { data: validPayload });
    expect(response.status()).toBe(201);
  });

  test('response should contain a generated id', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.post('/posts', { data: validPayload });
    const post: Post = await response.json();
    expect(typeof post.id).toBe('number');
    expect(post.id).toBeGreaterThan(0);
  });

  test('response should echo back the same title, body, and userId', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.post('/posts', { data: validPayload });
    const post: Post = await response.json();

    expect(post.title).toBe(validPayload.title);
    expect(post.body).toBe(validPayload.body);
    expect(post.userId).toBe(validPayload.userId);
  });
});

// Test Suite: Negative Test Cases

test.describe('Negative Test Cases', () => {

  test('POST with missing fields should still return a response (graceful handling)', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.post('/posts', {
      data: { title: 'only title' },
    });

    expect([200, 201, 400]).toContain(response.status());
  });

  test('POST with an empty body object should return 201 or 400', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.post('/posts', { data: {} });

    expect([200, 201, 400]).toContain(response.status());
  });

  test('GET on a non-existent endpoint should return 404', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.get('/invalid-endpoint-xyz');
    expect(response.status()).toBe(404);
  });

  test('POST to a non-existent endpoint should return 404', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.post('/nonexistent/resource', {
      data: { key: 'value' },
    });
    expect(response.status()).toBe(404);
  });
});

// Test Suite: Edge Cases

test.describe('Edge Cases', () => {

  test('POST with a very long title string should be handled gracefully', async ({ request }: { request: APIRequestContext }) => {
    const longTitle = 'A'.repeat(5000); // 5 000-character string

    const response = await request.post('/posts', {
      data: {
        title: longTitle,
        body: 'normal body',
        userId: 1,
      },
    });

    expect(response.status()).toBeLessThan(500);

    if (response.status() === 201) {
      const post: Post = await response.json();
      expect(post.title).toBe(longTitle);
    }
  });

  test('POST with a very long body string should be handled gracefully', async ({ request }: { request: APIRequestContext }) => {
    const longBody = 'B'.repeat(10_000);

    const response = await request.post('/posts', {
      data: {
        title: 'normal title',
        body: longBody,
        userId: 1,
      },
    });

    expect(response.status()).toBeLessThan(500);
  });

  test('POST with special characters in title should be handled correctly', async ({ request }: { request: APIRequestContext }) => {
    const specialTitle = '!@#$%^&*()_+=-[]{}|;:\'",.<>?/`~\\';

    const response = await request.post('/posts', {
      data: {
        title: specialTitle,
        body: 'body with special chars',
        userId: 1,
      },
    });

    expect(response.status()).toBe(201);

    const post: Post = await response.json();
    expect(post.title).toBe(specialTitle);
  });

  test('POST with special characters in body should be handled correctly', async ({ request }: { request: APIRequestContext }) => {
    const specialBody = '<script>alert("xss")</script> & "quoted" & \'apostrophe\'';

    const response = await request.post('/posts', {
      data: {
        title: 'XSS & Encoding Test',
        body: specialBody,
        userId: 1,
      },
    });

    expect(response.status()).toBe(201);

    const post: Post = await response.json();
    expect(post.body).toBe(specialBody);
  });

  test('POST with userId as string instead of number should be handled', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.post('/posts', {
      data: {
        title: 'type coercion test',
        body: 'testing userId type',
        userId: '1',
      },
    });

    expect([200, 201, 400]).toContain(response.status());
  });

  test('GET /posts with query param filter should return matching results', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.get('/posts?userId=1');
    expect(response.status()).toBe(200);

    const posts: Post[] = await response.json();
    expect(Array.isArray(posts)).toBeTruthy();

    for (const post of posts) {
      expect(post.userId).toBe(1);
    }
  });
});
