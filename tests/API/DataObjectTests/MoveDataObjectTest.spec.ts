import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let folder1Id: number;
let folder2Id: number;
const timestamp = Date.now();

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    [folder1Id, folder2Id] = await FolderHelper.createFoldersAndGetIds(
        authenticatedRequest,
        [`do-move-src-${timestamp}`, `do-move-tgt-${timestamp}`],
        1,
        'data-object'
    );
});

test.afterAll(async () => {
    try {
        await FolderHelper.deleteFolders(authenticatedRequest, [folder1Id, folder2Id], 'data-object');
    } catch (e) { /* ignore */ }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('MoveDataObjectToAnotherFolder', async () => {
    // Create an object in folder1
    const createResponse = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${folder1Id}`, {
        data: { key: `move-obj-${timestamp}`, classId: 'test_ATS', type: 'object' }
    });
    expect(createResponse.status()).toBe(200);
    const objectId = (await createResponse.json()).id;

    // Verify it's in folder1
    const beforeResponse = await authenticatedRequest.get(`/pimcore-studio/api/data-objects/${objectId}`);
    expect(beforeResponse.status()).toBe(200);
    expect((await beforeResponse.json()).parentId).toBe(folder1Id);

    // Move to folder2 via PATCH
    const moveResponse = await authenticatedRequest.patch('/pimcore-studio/api/data-objects', {
        data: {
            data: [{ id: objectId, parentId: folder2Id }]
        }
    });
    expect(moveResponse.status()).toBe(200);

    // Verify it's now in folder2
    const afterResponse = await authenticatedRequest.get(`/pimcore-studio/api/data-objects/${objectId}`);
    expect(afterResponse.status()).toBe(200);
    expect((await afterResponse.json()).parentId).toBe(folder2Id);
});

test('MoveDataObjectWithIndexChange', async () => {
    // Migrates k6 testMoveDataObjectIntoFolder (C3061) — move with index
    const createResponse = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${folder1Id}`, {
        data: { key: `move-idx-obj-${timestamp}`, classId: 'test_ATS', type: 'object' }
    });
    expect(createResponse.status()).toBe(200);
    const objectId = (await createResponse.json()).id;

    // Move with index
    const moveResponse = await authenticatedRequest.patch('/pimcore-studio/api/data-objects', {
        data: {
            data: [{ id: objectId, parentId: folder2Id, index: 1 }]
        }
    });
    expect(moveResponse.status()).toBe(200);

    const afterResponse = await authenticatedRequest.get(`/pimcore-studio/api/data-objects/${objectId}`);
    expect(afterResponse.status()).toBe(200);
    expect((await afterResponse.json()).parentId).toBe(folder2Id);
});

test('MoveToNonExistentParent', async () => {
    const createResponse = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${folder1Id}`, {
        data: { key: `move-invalid-${timestamp}`, classId: 'test_ATS', type: 'object' }
    });
    expect(createResponse.status()).toBe(200);
    const objectId = (await createResponse.json()).id;

    const moveResponse = await authenticatedRequest.patch('/pimcore-studio/api/data-objects', {
        data: {
            data: [{ id: objectId, parentId: 999999 }]
        }
    });
    expect([404, 500]).toContain(moveResponse.status());
});
