import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let testFolderId: number;
let testObjectId: number;
const timestamp = Date.now();

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    // Create test data object so search has something to find
    testFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        `do-search-test-${timestamp}`,
        1,
        'data-object'
    );

    const createResponse = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: {
            key: `do-search-item-${timestamp}`,
            classId: 'test_ATS',
            type: 'object'
        }
    });
    expect(createResponse.status()).toBe(200);
    testObjectId = (await createResponse.json()).id;
});

test.afterAll(async () => {
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testFolderId, 'data-object');
    } catch (e) { /* ignore */ }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetDataObjectSearchConfiguration', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/search/configuration/data-objects');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('columns');
    expect(Array.isArray(data.columns)).toBe(true);
    expect(data).toHaveProperty('pageSize');
});

test('GetDataObjectSearchConfigurationWithClassId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/search/configuration/data-objects?classId=test_ATS');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('columns');
    expect(data).toHaveProperty('pageSize');
});

test('GetDataObjectSearchConfigurationWithInvalidClassId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/search/configuration/data-objects?classId=nonexistent_xyz');
    // May return 200 with defaults or error
    expect([200, 404, 500]).toContain(response.status());
});

test('SearchDataObjects', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/search/data-objects', {
        data: {
            columns: [
                { key: 'id', type: 'system.id', group: ['system'], locale: null, config: [] },
                { key: 'key', type: 'system.string', group: ['system'], locale: null, config: [] },
                { key: 'fullpath', type: 'system.string', group: ['system'], locale: null, config: [] }
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
    expect(data.totalItems).toBeGreaterThan(0);

    if (data.items.length > 0) {
        const item = data.items[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('columns');
        expect(item).toHaveProperty('permissions');
        expect(item.permissions).toHaveProperty('list');
        expect(item.permissions).toHaveProperty('view');
    }
});

test('SearchDataObjectsWithClassFilter', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/search/data-objects?classId=test_ATS', {
        data: {
            columns: [
                { key: 'id', type: 'system.id', group: ['system'], locale: null, config: [] },
                { key: 'key', type: 'system.string', group: ['system'], locale: null, config: [] }
            ],
            filters: {
                page: 1,
                pageSize: 50,
                includeDescendants: true
            }
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
});

test('SearchDataObjectsPagination', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/search/data-objects', {
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

test('SearchDataObjectsMissingBody', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/search/data-objects', {
        data: {}
    });
    expect([400, 422, 500]).toContain(response.status());
});
