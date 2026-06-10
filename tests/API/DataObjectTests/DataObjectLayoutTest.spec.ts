import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let testFolderId: number;
let objectId: number;
const timestamp = Date.now();
const testFolderName = `do-layout-test-${timestamp}`;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    testFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        testFolderName,
        1,
        'data-object'
    );

    // Create a data object with the full class to test layout
    const createResponse = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: { key: `layout-obj-${timestamp}`, classId: 'test_ATF', type: 'object' }
    });
    expect(createResponse.status()).toBe(200);
    objectId = (await createResponse.json()).id;
});

test.afterAll(async () => {
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testFolderId, 'data-object');
    } catch (e) { /* ignore */ }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetDataObjectLayout', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/data-objects/${objectId}/layout`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.name).toBeDefined();
    expect(data.fieldtype).toBeDefined();
    expect(data.children).toBeDefined();
    expect(Array.isArray(data.children)).toBe(true);
});

test('GetLayoutWithInvalidId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/data-objects/999999/layout');
    expect(response.status()).toBe(404);
});
