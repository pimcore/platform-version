import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let sourceFolderId: number;
let targetFolderId: number;
let sourceObjectId: number;
const timestamp = Date.now();

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    // Create source and target folders
    sourceFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        `do-clone-source-${timestamp}`,
        1,
        'data-object'
    );

    targetFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        `do-clone-target-${timestamp}`,
        1,
        'data-object'
    );

    // Create a data object in source folder
    const createResponse = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${sourceFolderId}`, {
        data: { key: `clone-source-${timestamp}`, classId: 'test_ATS', type: 'object' }
    });
    expect(createResponse.status()).toBe(200);
    sourceObjectId = (await createResponse.json()).id;
});

test.afterAll(async () => {
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, sourceFolderId, 'data-object');
    } catch (e) { /* ignore */ }
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, targetFolderId, 'data-object');
    } catch (e) { /* ignore */ }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('CloneDataObjectToAnotherFolder', async () => {
    const cloneResponse = await authenticatedRequest.post(
        `/pimcore-studio/api/data-objects/${sourceObjectId}/clone/${targetFolderId}`, {
            data: {
                recursive: false,
                updateReferences: false
            }
        }
    );
    expect([200, 201]).toContain(cloneResponse.status());

    // Verify original still exists
    const originalResponse = await authenticatedRequest.get(`/pimcore-studio/api/data-objects/${sourceObjectId}`);
    expect(originalResponse.status()).toBe(200);
    const originalData = await originalResponse.json();
    expect(originalData.parentId).toBe(sourceFolderId);

    // Verify cloned object exists in target folder
    const treeResponse = await authenticatedRequest.get(
        `/pimcore-studio/api/data-objects/tree?parentId=${targetFolderId}&page=1&pageSize=50`
    );
    expect(treeResponse.status()).toBe(200);
    const treeData = await treeResponse.json();
    expect(treeData.totalItems).toBeGreaterThanOrEqual(1);

    const clonedItem = treeData.items[0];
    expect(clonedItem.id).not.toBe(sourceObjectId);
    expect(clonedItem.parentId).toBe(targetFolderId);
});

test('CloneNonExistentObject', async () => {
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/data-objects/999999/clone/${targetFolderId}`, {
            data: {
                recursive: false,
                updateReferences: false
            }
        }
    );
    expect([404, 500]).toContain(response.status());
});

test('CloneToNonExistentParent', async () => {
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/data-objects/${sourceObjectId}/clone/999999`, {
            data: {
                recursive: false,
                updateReferences: false
            }
        }
    );
    expect([404, 500]).toContain(response.status());
});
