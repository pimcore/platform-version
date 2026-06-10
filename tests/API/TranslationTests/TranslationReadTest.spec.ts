import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetAvailableLocales', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/translations/available-locales');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    // Locales are objects with locale and displayName
    expect(data[0]).toHaveProperty('locale');
    expect(data[0]).toHaveProperty('displayName');
});

test('GetTranslationDomains', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/translations/domains');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
});

test('GetTranslationsByKeys', async () => {
    // POST /translations - get translations by locale and keys
    const response = await authenticatedRequest.post('/pimcore-studio/api/translations', {
        data: {
            locale: 'en',
            keys: ['save', 'delete']
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
});

test('GetTranslationsByKeysWithFallback', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/translations', {
        data: {
            locale: 'en',
            keys: ['save'],
            useFallback: true
        }
    });
    expect(response.status()).toBe(200);
});
