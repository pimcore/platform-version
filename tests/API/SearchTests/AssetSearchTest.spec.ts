import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetAssetSearchConfiguration', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/search/configuration/assets');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('columns');
    expect(Array.isArray(data.columns)).toBe(true);
    expect(data).toHaveProperty('pageSize');
    expect(typeof data.pageSize).toBe('number');
});

test('SearchAssets', async () => {
    // Use proper grid column format with system types
    const response = await authenticatedRequest.post('/pimcore-studio/api/search/assets', {
        data: {
            columns: [
                { key: 'id', type: 'system.id', group: ['system'], locale: null, config: [] },
                { key: 'fullpath', type: 'system.string', group: ['system'], locale: null, config: [] },
                { key: 'type', type: 'system.string', group: ['system'], locale: null, config: [] }
            ],
            filters: {
                page: 1,
                pageSize: 10,
                includeDescendants: true
            }
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
    expect(typeof data.totalItems).toBe('number');

    if (data.items.length > 0) {
        const item = data.items[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('columns');
        expect(item).toHaveProperty('permissions');
    }
});

test('SearchAssetsWithPagination', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/search/assets', {
        data: {
            columns: [
                { key: 'id', type: 'system.id', group: ['system'], locale: null, config: [] }
            ],
            filters: {
                page: 1,
                pageSize: 2,
                includeDescendants: true
            }
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.items.length).toBeLessThanOrEqual(2);
});

test('SearchAssetsEmptyColumns', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/search/assets', {
        data: {
            columns: [],
            filters: {
                page: 1,
                pageSize: 10,
                includeDescendants: true
            }
        }
    });
    expect([200, 400, 422]).toContain(response.status());
});

test('SearchAssetsMissingBody', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/search/assets', {
        data: {}
    });
    expect([400, 422, 500]).toContain(response.status());
});
