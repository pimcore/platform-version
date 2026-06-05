import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let testFolderId: number;
let testObjectId: number;
let testAssetFolderId: number;
const timestamp = Date.now();

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    // Create a data-object folder and object so we have something to search for
    testFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        `search-test-${timestamp}`,
        1,
        'data-object'
    );

    const createResponse = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: {
            key: `searchable-obj-${timestamp}`,
            classId: 'test_ATS',
            type: 'object'
        }
    });
    expect(createResponse.status()).toBe(200);
    const createData = await createResponse.json();
    testObjectId = createData.id;

    // Create an asset folder for asset search preview
    testAssetFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        `search-asset-${timestamp}`,
        1,
        'asset'
    );
});

test.afterAll(async () => {
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testAssetFolderId, 'asset');
    } catch (e) { /* ignore */ }
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testFolderId, 'data-object');
    } catch (e) { /* ignore */ }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('SimpleSearchWithDefaults', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/search?page=1&pageSize=10');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
    expect(typeof data.totalItems).toBe('number');
});

test('SimpleSearchWithSearchTerm', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/search?page=1&pageSize=10&searchTerm=searchable-obj-${timestamp}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('SimpleSearchWithLargePageSize', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/search?page=1&pageSize=100');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data.items.length).toBeLessThanOrEqual(100);
});

test('SimpleSearchPagination', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/search?page=2&pageSize=5');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
});

test('SimpleSearchWithNonExistentTerm', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/search?page=1&pageSize=10&searchTerm=xyznonexistent99999');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.totalItems).toBe(0);
    expect(data.items).toHaveLength(0);
});

test('SimpleSearchMissingRequiredParams', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/search');
    // May return defaults or reject
    expect([200, 400, 422]).toContain(response.status());
});

test('SimpleSearchInvalidPage', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/search?page=0&pageSize=10');
    expect([400, 422]).toContain(response.status());
});

test('SearchPreviewDataObject', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/search/preview/data-object/${testObjectId}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id', testObjectId);
    expect(data).toHaveProperty('elementType');
    expect(data).toHaveProperty('type');
    expect(data).toHaveProperty('creationDate');
    expect(data).toHaveProperty('modificationDate');
});

test('SearchPreviewAssetFolder', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/search/preview/asset/${testAssetFolderId}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id', testAssetFolderId);
    expect(data).toHaveProperty('elementType');
});

test('SearchPreviewInvalidId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/search/preview/data-object/999999');
    expect([404, 500]).toContain(response.status());
});

test('SearchPreviewInvalidElementType', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/search/preview/invalid-type/1');
    expect([400, 403, 404, 422, 500]).toContain(response.status());
});
