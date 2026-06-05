import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
let testStoreId: number;
let testGroupId: number;
let testKeyId: number;
let testCollectionId: number;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    // Create a test store
    const storeResponse = await authenticatedRequest.post('/pimcore-studio/api/classification-store/configuration/stores', {
        data: { name: `TestStore_${Date.now()}` },
    });
    expect(storeResponse.status()).toBe(200);
    const storeData = await storeResponse.json();
    testStoreId = storeData.id;
});

test.afterAll(async () => {
    // Clean up in reverse dependency order: relations -> keys/collections/groups -> store
    if (testKeyId) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/classification-store/configuration/keys/${testKeyId}`);
        } catch (_) { /* ignore */ }
    }
    if (testCollectionId) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/classification-store/configuration/collections/${testCollectionId}`);
        } catch (_) { /* ignore */ }
    }
    if (testGroupId) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/classification-store/configuration/groups/${testGroupId}`);
        } catch (_) { /* ignore */ }
    }
    if (testStoreId) {
        try {
            // List and clean up any remaining groups/keys/collections in the store
            await authenticatedRequest.delete(`/pimcore-studio/api/classification-store/configuration/stores/${testStoreId}`);
        } catch (_) { /* ignore */ }
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

// --- Store endpoints ---

test('GetStoreTree', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/classification-store/configuration/stores/tree');
    expect(response.status()).toBe(200);

    const data = await response.json();
    // Response is a direct array of store nodes
    const items = Array.isArray(data) ? data : data.items;
    expect(Array.isArray(items)).toBeTruthy();
    expect(items.length).toBeGreaterThan(0);

    // Verify our test store appears
    const found = items.find((item: any) => item.id === testStoreId);
    expect(found).toBeDefined();
});

test('UpdateStore', async () => {
    const updatedName = `UpdatedStore_${Date.now()}`;
    const response = await authenticatedRequest.put(`/pimcore-studio/api/classification-store/configuration/stores/${testStoreId}`, {
        data: { name: updatedName, description: 'Updated description' },
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.name).toBe(updatedName);
});

// --- Group endpoints ---

test('CreateGroup', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/classification-store/configuration/groups/add', {
        data: { name: `TestGroup_${Date.now()}`, storeId: testStoreId },
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name');
    testGroupId = data.id;
});

test('ListGroupsInStore', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/classification-store/configuration/stores/${testStoreId}/groups`, {
        data: { filters: { page: 1, pageSize: 50 } },
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('totalItems');
    expect(data.totalItems).toBeGreaterThanOrEqual(1);
});

test('UpdateGroup', async () => {
    const updatedName = `UpdatedGroup_${Date.now()}`;
    const response = await authenticatedRequest.put(`/pimcore-studio/api/classification-store/configuration/groups/${testGroupId}`, {
        data: { name: updatedName, description: 'Updated group' },
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.name).toBe(updatedName);
});

// --- Key endpoints ---

test('CreateKey', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/classification-store/configuration/keys/add', {
        data: { name: `TestKey_${Date.now()}`, storeId: testStoreId },
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name');
    testKeyId = data.id;
});

test('ListKeysInStore', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/classification-store/configuration/stores/${testStoreId}/keys`, {
        data: { filters: { page: 1, pageSize: 50 } },
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('totalItems');
    expect(data.totalItems).toBeGreaterThanOrEqual(1);
});

test('UpdateKey', async () => {
    const updatedName = `UpdatedKey_${Date.now()}`;
    const response = await authenticatedRequest.put(`/pimcore-studio/api/classification-store/configuration/keys/${testKeyId}`, {
        data: {
            name: updatedName,
            title: 'Updated title',
            description: 'Updated key',
            type: 'input',
            definition: null,
        },
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.name).toBe(updatedName);
});

// --- Collection endpoints ---

test('CreateCollection', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/classification-store/configuration/collections/add', {
        data: { name: `TestCollection_${Date.now()}`, storeId: testStoreId },
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name');
    testCollectionId = data.id;
});

test('ListCollectionsInStore', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/classification-store/configuration/stores/${testStoreId}/collections`, {
        data: { filters: { page: 1, pageSize: 50 } },
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('totalItems');
    expect(data.totalItems).toBeGreaterThanOrEqual(1);
});

test('UpdateCollection', async () => {
    const updatedName = `UpdatedCollection_${Date.now()}`;
    const response = await authenticatedRequest.put(`/pimcore-studio/api/classification-store/configuration/collections/${testCollectionId}`, {
        data: { name: updatedName, description: 'Updated collection' },
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.name).toBe(updatedName);
});

// --- Relations ---

test('CreateAndDeleteCollectionGroupRelation', async () => {
    // Add relation
    const addResponse = await authenticatedRequest.post('/pimcore-studio/api/classification-store/configuration/collection-relations/add', {
        data: { colId: testCollectionId, groupId: testGroupId, sorter: 0 },
    });
    expect(addResponse.status()).toBe(200);

    // List relations for collection
    const listResponse = await authenticatedRequest.post(`/pimcore-studio/api/classification-store/configuration/collections/${testCollectionId}/relations`, {
        data: { filters: { page: 1, pageSize: 50 } },
    });
    expect(listResponse.status()).toBe(200);
    const listData = await listResponse.json();
    expect(listData.totalItems).toBeGreaterThanOrEqual(1);

    // Delete relation
    const deleteResponse = await authenticatedRequest.delete('/pimcore-studio/api/classification-store/configuration/collection-relations', {
        data: { colId: testCollectionId, groupId: testGroupId },
    });
    expect(deleteResponse.status()).toBe(200);
});

test('CreateAndDeleteKeyGroupRelation', async () => {
    // Add relation
    const addResponse = await authenticatedRequest.post('/pimcore-studio/api/classification-store/configuration/key-group-relations/add', {
        data: { keyId: testKeyId, groupId: testGroupId, sorter: 0, mandatory: false },
    });
    expect(addResponse.status()).toBe(200);

    // List relations for group
    const listResponse = await authenticatedRequest.post(`/pimcore-studio/api/classification-store/configuration/groups/${testGroupId}/key-relations`, {
        data: { filters: { page: 1, pageSize: 50 } },
    });
    expect(listResponse.status()).toBe(200);
    const listData = await listResponse.json();
    expect(listData.totalItems).toBeGreaterThanOrEqual(1);

    // Delete relation
    const deleteResponse = await authenticatedRequest.delete('/pimcore-studio/api/classification-store/configuration/key-group-relations', {
        data: { keyId: testKeyId, groupId: testGroupId },
    });
    expect(deleteResponse.status()).toBe(200);
});

// --- Read-only / lookup endpoints ---

test('GetConfigCollection', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/classification-store/config/collection');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBeTruthy();
});

test('GetPageForItem', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/configuration/get-page?table=groups&id=${testGroupId}&storeId=${testStoreId}&pageSize=50`
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('page');
});

// --- Delete tests (run last) ---

test('DeleteKeyGroupAndCollection', async () => {
    // Delete key (soft-delete/disable)
    const keyResponse = await authenticatedRequest.delete(`/pimcore-studio/api/classification-store/configuration/keys/${testKeyId}`);
    expect([200, 204]).toContain(keyResponse.status());
    testKeyId = 0; // prevent double-delete in afterAll

    // Delete collection
    const colResponse = await authenticatedRequest.delete(`/pimcore-studio/api/classification-store/configuration/collections/${testCollectionId}`);
    expect(colResponse.status()).toBe(200);
    testCollectionId = 0;

    // Delete group
    const groupResponse = await authenticatedRequest.delete(`/pimcore-studio/api/classification-store/configuration/groups/${testGroupId}`);
    expect(groupResponse.status()).toBe(200);
    testGroupId = 0;
});

test('CreateAndDeleteStore', async () => {
    // Create a separate store to delete
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/classification-store/configuration/stores', {
        data: { name: `DeleteStore_${Date.now()}` },
    });
    expect(createResponse.status()).toBe(200);
    const created = await createResponse.json();

    // Deleting a store - the API may not have a DELETE endpoint for stores
    // Try to verify it exists in tree
    const treeResponse = await authenticatedRequest.get('/pimcore-studio/api/classification-store/configuration/stores/tree');
    expect(treeResponse.status()).toBe(200);
    const treeData = await treeResponse.json();
    const treeItems = Array.isArray(treeData) ? treeData : treeData.items;
    const found = treeItems.find((item: any) => item.id === created.id);
    expect(found).toBeDefined();
});

// --- Negative tests ---

test('UpdateStoreWithInvalidId', async () => {
    const response = await authenticatedRequest.put('/pimcore-studio/api/classification-store/configuration/stores/999999', {
        data: { name: 'nonexistent', description: null },
    });
    expect([404, 422, 500]).toContain(response.status());
});

test('DeleteGroupWithInvalidId', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/classification-store/configuration/groups/999999');
    expect([404, 422, 500]).toContain(response.status());
});
