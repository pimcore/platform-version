import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let testFolderId: number;
const timestamp = Date.now();
const testFolderName = `do-delete-test-${timestamp}`;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    testFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        testFolderName,
        1,
        'data-object'
    );
});

test.afterAll(async () => {
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testFolderId, 'data-object');
    } catch (e) {
        // Ignore cleanup errors
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('DeleteSingleDataObject', async () => {
    // Create an object to delete
    const createResponse = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: { key: `delete-single-${timestamp}`, classId: 'test_ATS', type: 'object' }
    });
    expect(createResponse.status()).toBe(200);
    const objectId = (await createResponse.json()).id;

    // Delete via element delete endpoint (same as FolderHelper uses)
    const deleteResponse = await authenticatedRequest.delete(
        `/pimcore-studio/api/elements/data-object/delete/${objectId}`
    );
    expect([200, 201]).toContain(deleteResponse.status());

    // Verify object no longer accessible
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/data-objects/${objectId}`);
    expect(getResponse.status()).toBe(404);
});

test('DeleteMultipleDataObjects', async () => {
    // Create two objects to delete
    const create1 = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: { key: `delete-multi-1-${timestamp}`, classId: 'test_ATS', type: 'object' }
    });
    expect(create1.status()).toBe(200);
    const id1 = (await create1.json()).id;

    const create2 = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: { key: `delete-multi-2-${timestamp}`, classId: 'test_ATS', type: 'object' }
    });
    expect(create2.status()).toBe(200);
    const id2 = (await create2.json()).id;

    // Delete both individually
    for (const id of [id1, id2]) {
        const deleteResponse = await authenticatedRequest.delete(
            `/pimcore-studio/api/elements/data-object/delete/${id}`
        );
        expect([200, 201]).toContain(deleteResponse.status());
    }

    // Verify both gone
    for (const id of [id1, id2]) {
        const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/data-objects/${id}`);
        expect(getResponse.status()).toBe(404);
    }
});

test('DeleteNonExistentDataObject', async () => {
    const deleteResponse = await authenticatedRequest.delete(
        '/pimcore-studio/api/elements/data-object/delete/999999'
    );
    expect([404, 500]).toContain(deleteResponse.status());
});
