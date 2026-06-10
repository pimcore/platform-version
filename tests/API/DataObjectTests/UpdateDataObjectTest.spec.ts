import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let testFolderId: number;
let objectId: number;
let secondObjectId: number;
const timestamp = Date.now();
const testFolderName = `do-update-test-${timestamp}`;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    testFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        testFolderName,
        1,
        'data-object'
    );

    // Create two data objects for testing
    const createResponse = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: { key: `update-obj-${timestamp}`, classId: 'test_ATS', type: 'object' }
    });
    expect(createResponse.status()).toBe(200);
    objectId = (await createResponse.json()).id;

    const createResponse2 = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: { key: `publish-obj-${timestamp}`, classId: 'test_ATS', type: 'object' }
    });
    expect(createResponse2.status()).toBe(200);
    secondObjectId = (await createResponse2.json()).id;
});

test.afterAll(async () => {
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testFolderId, 'data-object');
    } catch (e) {
        // Ignore cleanup errors
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('RenameDataObjectViaPatch', async () => {
    const newKey = `renamed-obj-${timestamp}`;

    const patchResponse = await authenticatedRequest.patch('/pimcore-studio/api/data-objects', {
        data: {
            data: [{ id: objectId, key: newKey }]
        }
    });
    expect(patchResponse.status()).toBe(200);

    // Verify rename via GET
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/data-objects/${objectId}`);
    expect(getResponse.status()).toBe(200);
    const objectData = await getResponse.json();
    expect(objectData.key).toBe(newKey);
});

test('PublishDataObjectViaPut', async () => {
    const putResponse = await authenticatedRequest.put(`/pimcore-studio/api/data-objects/${secondObjectId}`, {
        data: {
            data: { task: 'publish' }
        }
    });
    expect(putResponse.status()).toBe(200);

    // Verify published state
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/data-objects/${secondObjectId}`);
    expect(getResponse.status()).toBe(200);
    const objectData = await getResponse.json();
    expect(objectData.published).toBe(true);
});

test('UnpublishDataObjectViaPut', async () => {
    const putResponse = await authenticatedRequest.put(`/pimcore-studio/api/data-objects/${secondObjectId}`, {
        data: {
            data: { task: 'unpublish' }
        }
    });
    expect(putResponse.status()).toBe(200);

    // Verify unpublished state
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/data-objects/${secondObjectId}`);
    expect(getResponse.status()).toBe(200);
    const objectData = await getResponse.json();
    expect(objectData.published).toBe(false);
});

test('PublishDataObjectViaPatch', async () => {
    const patchResponse = await authenticatedRequest.patch('/pimcore-studio/api/data-objects', {
        data: {
            data: [{ id: secondObjectId, task: 'publish' }]
        }
    });
    expect(patchResponse.status()).toBe(200);

    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/data-objects/${secondObjectId}`);
    expect(getResponse.status()).toBe(200);
    const objectData = await getResponse.json();
    expect(objectData.published).toBe(true);
});

test('SaveDraftViaPut', async () => {
    const putResponse = await authenticatedRequest.put(`/pimcore-studio/api/data-objects/${objectId}`, {
        data: {
            data: { task: 'version' }
        }
    });
    // version/draft save should succeed
    expect([200, 201]).toContain(putResponse.status());
});

test('UpdateNonExistentDataObject', async () => {
    const putResponse = await authenticatedRequest.put('/pimcore-studio/api/data-objects/999999', {
        data: {
            data: { task: 'publish' }
        }
    });
    expect(putResponse.status()).toBe(404);
});
