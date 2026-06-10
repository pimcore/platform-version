import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const timestamp = Date.now();
const testDomain = 'messages';
const testKey = `test_list_${timestamp}`;
const defaultSort = { key: 'key', direction: 'ASC' };

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    // Create a test translation for listing/export tests
    await authenticatedRequest.post('/pimcore-studio/api/translations/create', {
        data: {
            translationData: [{ key: testKey, type: 'simple', domain: testDomain }]
        }
    });

    // Update with actual values
    await authenticatedRequest.put(`/pimcore-studio/api/translations/${testDomain}`, {
        data: {
            data: [{
                key: testKey,
                type: 'simple',
                translationData: [
                    { locale: 'en', translation: `Test English ${timestamp}` },
                    { locale: 'de', translation: `Test German ${timestamp}` }
                ]
            }]
        }
    });
});

test.afterAll(async () => {
    try {
        await authenticatedRequest.delete(
            `/pimcore-studio/api/translations/${encodeURIComponent(testKey)}?domain=${testDomain}`
        );
    } catch (e) {
        // Ignore cleanup errors
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('ListTranslations', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/translations/list?domain=${testDomain}`, {
        data: {
            filters: {
                page: 1,
                pageSize: 50,
                sortFilter: defaultSort
            }
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('totalItems');
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.totalItems).toBeGreaterThanOrEqual(1);

    // Verify item structure
    const item = data.items[0];
    expect(item).toHaveProperty('key');
    expect(item).toHaveProperty('translations');
    expect(item).toHaveProperty('type');
});

test('ListTranslationsWithPagination', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/translations/list?domain=${testDomain}`, {
        data: {
            filters: {
                page: 1,
                pageSize: 1,
                sortFilter: defaultSort
            }
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.items.length).toBeLessThanOrEqual(1);
});

test('ListTranslationsWithSearchFilter', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/translations/list?domain=${testDomain}`, {
        data: {
            filters: {
                page: 1,
                pageSize: 50,
                sortFilter: defaultSort,
                columnFilters: [{ type: 'search', filterValue: testKey }]
            }
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.totalItems).toBeGreaterThanOrEqual(1);
});

test('ListTranslationsWithSortDesc', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/translations/list?domain=${testDomain}`, {
        data: {
            filters: {
                page: 1,
                pageSize: 10,
                sortFilter: { key: 'key', direction: 'DESC' }
            }
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
});

test('ExportTranslations', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/translations/export?domain=${testDomain}`, {
        data: {
            filters: {
                sortFilter: defaultSort
            }
        }
    });
    expect(response.status()).toBe(200);

    // Export returns CSV
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('text/csv');
});

test('CsvSettings', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/translations/csv-settings', {
        data: {
            sample: 'name,value\n"John Doe",123\n"Jane Smith",456'
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
});

test('CleanupTranslations', async () => {
    const response = await authenticatedRequest.delete(`/pimcore-studio/api/translations/${testDomain}/cleanup`);
    expect(response.status()).toBe(200);
});
