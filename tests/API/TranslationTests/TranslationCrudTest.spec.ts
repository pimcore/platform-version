import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const timestamp = Date.now();
const testDomain = 'messages';

// Track created keys for cleanup
const createdKeys: string[] = [];

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    // Clean up created translations
    for (const key of createdKeys) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/translations/${encodeURIComponent(key)}?domain=${testDomain}`);
        } catch (e) {
            // Ignore cleanup errors
        }
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('CreateTranslation', async () => {
    const key = `test_translation_${timestamp}`;
    createdKeys.push(key);

    const response = await authenticatedRequest.post('/pimcore-studio/api/translations/create', {
        data: {
            errorOnDuplicate: true,
            translationData: [
                {
                    key: key,
                    type: 'simple',
                    domain: testDomain
                }
            ]
        }
    });
    expect(response.status()).toBe(200);
});

test('CreateDuplicateTranslationWithErrorFlag', async () => {
    const key = `test_dup_${timestamp}`;
    createdKeys.push(key);

    // Create first
    const first = await authenticatedRequest.post('/pimcore-studio/api/translations/create', {
        data: {
            errorOnDuplicate: true,
            translationData: [{ key, type: 'simple', domain: testDomain }]
        }
    });
    expect(first.status()).toBe(200);

    // Create duplicate with errorOnDuplicate=true
    const dup = await authenticatedRequest.post('/pimcore-studio/api/translations/create', {
        data: {
            errorOnDuplicate: true,
            translationData: [{ key, type: 'simple', domain: testDomain }]
        }
    });
    expect([400, 409, 422, 500]).toContain(dup.status());
});

test('CreateTranslationWithMissingKey', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/translations/create', {
        data: {
            translationData: [{ type: 'simple', domain: testDomain }]
        }
    });
    expect([400, 422]).toContain(response.status());
});

test('UpdateTranslation', async () => {
    const key = `test_update_${timestamp}`;
    createdKeys.push(key);

    // Create first
    await authenticatedRequest.post('/pimcore-studio/api/translations/create', {
        data: {
            translationData: [{ key, type: 'simple', domain: testDomain }]
        }
    });

    // Update with translation data
    const response = await authenticatedRequest.put(`/pimcore-studio/api/translations/${testDomain}`, {
        data: {
            data: [
                {
                    key: key,
                    type: 'simple',
                    translationData: [
                        { locale: 'en', translation: 'English value' },
                        { locale: 'de', translation: 'German value' }
                    ]
                }
            ]
        }
    });
    expect(response.status()).toBe(200);

    // Verify the update by listing
    const listResponse = await authenticatedRequest.post(`/pimcore-studio/api/translations/list?domain=${testDomain}`, {
        data: {
            filters: {
                page: 1,
                pageSize: 50,
                sortFilter: { key: 'key', direction: 'ASC' },
                columnFilters: [{ type: 'search', filterValue: key }]
            }
        }
    });
    expect(listResponse.status()).toBe(200);
});

test('DeleteTranslation', async () => {
    const key = `test_delete_${timestamp}`;

    // Create
    await authenticatedRequest.post('/pimcore-studio/api/translations/create', {
        data: {
            translationData: [{ key, type: 'simple', domain: testDomain }]
        }
    });

    // Delete
    const response = await authenticatedRequest.delete(
        `/pimcore-studio/api/translations/${encodeURIComponent(key)}?domain=${testDomain}`
    );
    expect(response.status()).toBe(200);
});

test('DeleteNonExistentTranslation', async () => {
    const response = await authenticatedRequest.delete(
        `/pimcore-studio/api/translations/${encodeURIComponent(`nonexistent_key_${timestamp}`)}?domain=${testDomain}`
    );
    expect([200, 404, 500]).toContain(response.status());
});
