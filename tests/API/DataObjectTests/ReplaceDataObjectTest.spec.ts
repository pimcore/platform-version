import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let testFolderId: number;
let sourceObjectId: number;
let targetObjectId: number;
const timestamp = Date.now();
const testFolderName = `do-replace-test-${timestamp}`;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    testFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        testFolderName,
        1,
        'data-object'
    );

    // Create source and target objects
    const create1 = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: { key: `replace-source-${timestamp}`, classId: 'test_ATS', type: 'object' }
    });
    expect(create1.status()).toBe(200);
    sourceObjectId = (await create1.json()).id;

    const create2 = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: { key: `replace-target-${timestamp}`, classId: 'test_ATS', type: 'object' }
    });
    expect(create2.status()).toBe(200);
    targetObjectId = (await create2.json()).id;
});

test.afterAll(async () => {
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testFolderId, 'data-object');
    } catch (e) { /* ignore */ }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('ReplaceDataObjectContent', async () => {
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/data-objects/${sourceObjectId}/replace/${targetObjectId}`
    );
    expect(response.status()).toBe(200);

    // Verify both objects still exist
    const sourceResponse = await authenticatedRequest.get(`/pimcore-studio/api/data-objects/${sourceObjectId}`);
    expect(sourceResponse.status()).toBe(200);

    const targetResponse = await authenticatedRequest.get(`/pimcore-studio/api/data-objects/${targetObjectId}`);
    expect(targetResponse.status()).toBe(200);
});

test('ReplaceWithInvalidSourceId', async () => {
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/data-objects/999999/replace/${targetObjectId}`
    );
    expect([404, 500]).toContain(response.status());
});

test('ReplaceWithInvalidTargetId', async () => {
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/data-objects/${sourceObjectId}/replace/999999`
    );
    expect([404, 500]).toContain(response.status());
});
