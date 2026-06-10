import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let testFolderId: number;
const timestamp = Date.now();
const testFolderName = `recycle-bin-test-${timestamp}`;

// Track IDs for cleanup
let recycleBinItemId: number | undefined;

async function createAndDeleteDataObject(
    request: APIRequestContext,
    parentId: number,
    key: string
): Promise<number> {
    const createResponse = await request.post(`/pimcore-studio/api/data-objects/add/${parentId}`, {
        data: { key, classId: 'test_ATS', type: 'object' }
    });
    expect(createResponse.status()).toBe(200);
    const createData = await createResponse.json();
    const objectId = createData.id;

    // Delete the object via element delete endpoint — this sends it to the recycle bin
    const deleteResponse = await request.delete(`/pimcore-studio/api/elements/data-object/delete/${objectId}`);
    expect([200, 201]).toContain(deleteResponse.status());

    return objectId;
}

async function getRecycleBinItems(request: APIRequestContext): Promise<any> {
    const response = await request.post('/pimcore-studio/api/recycle-bin/items', {
        data: {
            filters: {
                page: 1,
                pageSize: 50
            }
        }
    });
    expect(response.status()).toBe(200);
    return response.json();
}

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    // Create a folder for test data objects
    testFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        testFolderName,
        1,
        'data-object'
    );
});

test.afterAll(async () => {
    // Flush recycle bin to clean up any remaining items we created
    try {
        await authenticatedRequest.delete('/pimcore-studio/api/recycle-bin/flush');
    } catch (e) {
        // Ignore cleanup errors
    }

    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testFolderId, 'data-object');
    } catch (e) {
        // Ignore cleanup errors
    }

    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('ListRecycleBinItems', async () => {
    // Create a data object and delete it to populate the recycle bin
    await createAndDeleteDataObject(authenticatedRequest, testFolderId, `list-test-${timestamp}`);

    // List recycle bin items
    const data = await getRecycleBinItems(authenticatedRequest);

    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('totalItems');
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.totalItems).toBeGreaterThanOrEqual(1);

    // Verify item structure
    const item = data.items[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('type');
    expect(item).toHaveProperty('subtype');
    expect(item).toHaveProperty('path');
    expect(item).toHaveProperty('deletedBy');
    expect(item).toHaveProperty('date');

    // Save the recycle bin item ID for subsequent tests
    recycleBinItemId = item.id;
});

test('ListRecycleBinItemsWithPagination', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/recycle-bin/items', {
        data: {
            filters: {
                page: 1,
                pageSize: 1
            }
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.items.length).toBeLessThanOrEqual(1);
});

test('RestoreRecycleBinItem', async () => {
    // Flush first to ensure clean state
    await authenticatedRequest.delete('/pimcore-studio/api/recycle-bin/flush');

    // Create and delete a new object specifically for restore testing
    const objectKey = `restore-test-${timestamp}`;
    await createAndDeleteDataObject(authenticatedRequest, testFolderId, objectKey);

    // Get the recycle bin item — should be the only one after flush
    const binData = await getRecycleBinItems(authenticatedRequest);
    expect(binData.items.length).toBeGreaterThanOrEqual(1);
    const restoreItem = binData.items[0];

    // Restore the item
    const restoreResponse = await authenticatedRequest.post('/pimcore-studio/api/recycle-bin/restore', {
        data: {
            items: [restoreItem.id]
        }
    });
    expect([200, 201]).toContain(restoreResponse.status());

    // 201 returns a jobRunId for async processing, 200 means completed immediately
    if (restoreResponse.status() === 201) {
        const restoreData = await restoreResponse.json();
        expect(restoreData).toHaveProperty('jobRunId');
    }

    // Clean up the restored object — find it by key
    // Wait briefly for async restore to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify it's no longer in the recycle bin
    const afterBinData = await getRecycleBinItems(authenticatedRequest);
    const stillInBin = afterBinData.items.find((item: any) => item.id === restoreItem.id);
    // It should be removed from recycle bin after restore
    expect(stillInBin).toBeUndefined();
});

test('DeleteRecycleBinItem', async () => {
    // Create and delete an object to get a recycle bin entry
    await createAndDeleteDataObject(authenticatedRequest, testFolderId, `delete-bin-test-${timestamp}`);

    const binData = await getRecycleBinItems(authenticatedRequest);
    expect(binData.items.length).toBeGreaterThanOrEqual(1);

    const itemToDelete = binData.items[0];

    // Permanently delete from recycle bin
    const deleteResponse = await authenticatedRequest.delete('/pimcore-studio/api/recycle-bin/delete', {
        data: {
            items: [itemToDelete.id]
        }
    });
    expect([200, 201]).toContain(deleteResponse.status());

    if (deleteResponse.status() === 201) {
        const deleteData = await deleteResponse.json();
        expect(deleteData).toHaveProperty('jobRunId');
    }
});

test('FlushRecycleBin', async () => {
    // Create some items in recycle bin
    await createAndDeleteDataObject(authenticatedRequest, testFolderId, `flush-test-1-${timestamp}`);
    await createAndDeleteDataObject(authenticatedRequest, testFolderId, `flush-test-2-${timestamp}`);

    // Flush the entire recycle bin
    const flushResponse = await authenticatedRequest.delete('/pimcore-studio/api/recycle-bin/flush');
    expect([200, 204]).toContain(flushResponse.status());

    // Wait for flush to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify recycle bin is empty
    const binData = await getRecycleBinItems(authenticatedRequest);
    expect(binData.totalItems).toBe(0);
});

test('RestoreWithInvalidId', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/recycle-bin/restore', {
        data: {
            items: [999999]
        }
    });
    expect([400, 404, 422, 500]).toContain(response.status());
});

test('DeleteWithInvalidId', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/recycle-bin/delete', {
        data: {
            items: [999999]
        }
    });
    expect([400, 404, 422, 500]).toContain(response.status());
});

test('RestoreWithEmptyItems', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/recycle-bin/restore', {
        data: {
            items: []
        }
    });
    expect([400, 422]).toContain(response.status());
});

test('DeleteWithEmptyItems', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/recycle-bin/delete', {
        data: {
            items: []
        }
    });
    expect([400, 422]).toContain(response.status());
});
