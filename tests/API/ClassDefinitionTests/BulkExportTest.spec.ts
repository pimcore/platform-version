import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetBulkExportAvailableItems', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/bulk-export/available');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeGreaterThan(0);
});

test('BulkExportClassDefinitions', async () => {
    // First get available items
    const availableResponse = await authenticatedRequest.get('/pimcore-studio/api/class/bulk-export/available');
    const availableData = await availableResponse.json();
    expect(availableData.items.length).toBeGreaterThan(0);

    // Pick the first available item to export
    const firstItem = availableData.items[0];

    const response = await authenticatedRequest.post('/pimcore-studio/api/class/bulk-export', {
        data: {
            items: [
                {
                    type: firstItem.type,
                    name: firstItem.name
                }
            ]
        }
    });
    expect(response.status()).toBe(200);

    const contentDisposition = response.headers()['content-disposition'];
    expect(contentDisposition).toContain('attachment');
});

test('BulkExportWithEmptyItems', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/class/bulk-export', {
        data: {
            items: []
        }
    });
    // Could be 200 with empty export or 400/422
    expect([200, 400, 422]).toContain(response.status());
});

test('BulkExportWithInvalidType', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/class/bulk-export', {
        data: {
            items: [
                {
                    type: 'invalid_type',
                    name: 'NonExistent'
                }
            ]
        }
    });
    expect([200, 400, 404, 422, 500]).toContain(response.status());
});
