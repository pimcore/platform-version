import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
const ts = Date['now']();

// IDs created during setup - cleaned up in afterAll
let testStoreId: number;
let testGroupId: number;
let testKeyId: number;
let testCollectionId: number;
let testObjectId: number;
let testFolderId: number;

// Classification store field name in test_ATF class
const CS_FIELD_NAME = 'classificationStoreField';

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    // Create a dedicated test store
    const storeResp = await authenticatedRequest.post(
        '/pimcore-studio/api/classification-store/configuration/stores',
        { data: { name: `RuntimeTestStore_${ts}` } }
    );
    expect(storeResp.status()).toBe(200);
    testStoreId = (await storeResp.json()).id;

    // Create a group in the store
    const groupResp = await authenticatedRequest.post(
        '/pimcore-studio/api/classification-store/configuration/groups/add',
        { data: { name: `RuntimeTestGroup_${ts}`, storeId: testStoreId } }
    );
    expect(groupResp.status()).toBe(200);
    testGroupId = (await groupResp.json()).id;

    // Create a key in the store
    const keyResp = await authenticatedRequest.post(
        '/pimcore-studio/api/classification-store/configuration/keys/add',
        { data: { name: `RuntimeTestKey_${ts}`, storeId: testStoreId } }
    );
    expect(keyResp.status()).toBe(200);
    testKeyId = (await keyResp.json()).id;

    // Create a collection in the store
    const collResp = await authenticatedRequest.post(
        '/pimcore-studio/api/classification-store/configuration/collections/add',
        { data: { name: `RuntimeTestCollection_${ts}`, storeId: testStoreId } }
    );
    expect(collResp.status()).toBe(200);
    testCollectionId = (await collResp.json()).id;

    // Link key to group
    const kgrResp = await authenticatedRequest.post(
        '/pimcore-studio/api/classification-store/configuration/key-group-relations/add',
        { data: { keyId: testKeyId, groupId: testGroupId, sorter: 0, mandatory: false } }
    );
    expect(kgrResp.status()).toBe(200);

    // Link collection to group
    const cgrResp = await authenticatedRequest.post(
        '/pimcore-studio/api/classification-store/configuration/collection-relations/add',
        { data: { colId: testCollectionId, groupId: testGroupId, sorter: 0 } }
    );
    expect(cgrResp.status()).toBe(200);

    // Create a test folder and data object (test_ATF class has classificationStoreField)
    testFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        `cs-runtime-test-${ts}`,
        1,
        'data-object'
    );

    const objResp = await authenticatedRequest.post(
        `/pimcore-studio/api/data-objects/add/${testFolderId}`,
        { data: { key: `cs-runtime-obj-${ts}`, classId: 'test_ATF', type: 'object' } }
    );
    expect(objResp.status()).toBe(200);
    testObjectId = (await objResp.json()).id;
});

test.afterAll(async () => {
    // Remove key-group relation
    try {
        await authenticatedRequest.delete(
            '/pimcore-studio/api/classification-store/configuration/key-group-relations',
            { data: { keyId: testKeyId, groupId: testGroupId } }
        );
    } catch (_) {}

    // Remove collection-group relation
    try {
        await authenticatedRequest.delete(
            '/pimcore-studio/api/classification-store/configuration/collection-relations',
            { data: { colId: testCollectionId, groupId: testGroupId } }
        );
    } catch (_) {}

    // Delete key
    try {
        await authenticatedRequest.delete(
            `/pimcore-studio/api/classification-store/configuration/keys/${testKeyId}`
        );
    } catch (_) {}

    // Delete collection
    try {
        await authenticatedRequest.delete(
            `/pimcore-studio/api/classification-store/configuration/collections/${testCollectionId}`
        );
    } catch (_) {}

    // Delete group
    try {
        await authenticatedRequest.delete(
            `/pimcore-studio/api/classification-store/configuration/groups/${testGroupId}`
        );
    } catch (_) {}

    // Delete data object folder (includes the test object)
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testFolderId, 'data-object');
    } catch (_) {}

    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

// --- GET /classification-store/collections ---

test('GetCollectionsReturnsItems', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/collections?storeId=${testStoreId}&fieldName=${CS_FIELD_NAME}&page=1&pageSize=10`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.totalItems).toBeGreaterThanOrEqual(1);
    const found = data.items.find((item: any) => item.id === testCollectionId);
    expect(found).toBeDefined();
});

test('GetCollectionsWithClassIdFilter', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/collections?storeId=${testStoreId}&fieldName=${CS_FIELD_NAME}&page=1&pageSize=10&classId=test_ATF`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetCollectionsWithSearchTerm', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/collections?storeId=${testStoreId}&fieldName=${CS_FIELD_NAME}&page=1&pageSize=10&searchTerm=RuntimeTestCollection`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(data.totalItems).toBeGreaterThanOrEqual(1);
});

test('GetCollectionsPagination', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/collections?storeId=${testStoreId}&fieldName=${CS_FIELD_NAME}&page=1&pageSize=1`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.items.length).toBeLessThanOrEqual(1);
});

test('GetCollectionsMissingRequiredFieldNameReturns422', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/collections?storeId=${testStoreId}&page=1&pageSize=10`
    );
    expect([400, 404, 422]).toContain(response.status());
});

test('GetCollectionsMissingStoreIdReturns422', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/collections?fieldName=${CS_FIELD_NAME}&page=1&pageSize=10`
    );
    expect([400, 404, 422]).toContain(response.status());
});

// --- GET /classification-store/groups ---

test('GetGroupsReturnsItems', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/groups?storeId=${testStoreId}&fieldName=${CS_FIELD_NAME}&page=1&pageSize=10`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.totalItems).toBeGreaterThanOrEqual(1);
    const found = data.items.find((item: any) => item.id === testGroupId);
    expect(found).toBeDefined();
});

test('GetGroupsWithClassIdFilter', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/groups?storeId=${testStoreId}&fieldName=${CS_FIELD_NAME}&page=1&pageSize=10&classId=test_ATF`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
});

test('GetGroupsWithSearchTerm', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/groups?storeId=${testStoreId}&fieldName=${CS_FIELD_NAME}&page=1&pageSize=10&searchTerm=RuntimeTestGroup`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.totalItems).toBeGreaterThanOrEqual(1);
});

test('GetGroupsMissingFieldNameReturns422', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/groups?storeId=${testStoreId}&page=1&pageSize=10`
    );
    expect([400, 404, 422]).toContain(response.status());
});

test('GetGroupsMissingStoreIdReturns422', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/groups?fieldName=${CS_FIELD_NAME}&page=1&pageSize=10`
    );
    expect([400, 404, 422]).toContain(response.status());
});

// --- GET /classification-store/key-group-relations ---

test('GetKeyGroupRelationsReturnsItems', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/key-group-relations?storeId=${testStoreId}&fieldName=${CS_FIELD_NAME}&page=1&pageSize=10`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.totalItems).toBeGreaterThanOrEqual(1);
    const found = data.items.find((item: any) => item.keyId === testKeyId && item.groupId === testGroupId);
    expect(found).toBeDefined();
});

test('GetKeyGroupRelationsResponseShape', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/key-group-relations?storeId=${testStoreId}&fieldName=${CS_FIELD_NAME}&page=1&pageSize=10`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.items.length).toBeGreaterThanOrEqual(1);
    const relation = data.items[0];
    expect(relation).toHaveProperty('keyId');
    expect(relation).toHaveProperty('groupId');
    expect(relation).toHaveProperty('keyName');
    expect(relation).toHaveProperty('groupName');
});

test('GetKeyGroupRelationsWithClassIdFilter', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/key-group-relations?storeId=${testStoreId}&fieldName=${CS_FIELD_NAME}&page=1&pageSize=10&classId=test_ATF`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('items');
});

test('GetKeyGroupRelationsMissingFieldNameReturns422', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/key-group-relations?storeId=${testStoreId}&page=1&pageSize=10`
    );
    expect([400, 404, 422]).toContain(response.status());
});

// --- GET /classification-store/layout-by-collection/{collectionId} ---

test('GetLayoutByCollectionReturnsGroups', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/layout-by-collection/${testCollectionId}?objectId=${testObjectId}&fieldName=${CS_FIELD_NAME}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('groups');
    expect(Array.isArray(data.groups)).toBe(true);
    expect(data.groups.length).toBeGreaterThanOrEqual(1);
});

test('GetLayoutByCollectionGroupShape', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/layout-by-collection/${testCollectionId}?objectId=${testObjectId}&fieldName=${CS_FIELD_NAME}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    const group = data.groups[0];
    expect(group).toHaveProperty('id');
    expect(group).toHaveProperty('name');
    expect(group).toHaveProperty('keys');
    expect(Array.isArray(group.keys)).toBe(true);
});

test('GetLayoutByCollectionInvalidIdReturns404', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/layout-by-collection/999999?objectId=${testObjectId}&fieldName=${CS_FIELD_NAME}`
    );
    expect([200, 404, 422]).toContain(response.status());
});

test('GetLayoutByCollectionMissingFieldNameReturns422', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/layout-by-collection/${testCollectionId}?objectId=${testObjectId}`
    );
    expect([400, 404, 422]).toContain(response.status());
});

test('GetLayoutByCollectionInvalidObjectIdReturns404', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/layout-by-collection/${testCollectionId}?objectId=999999&fieldName=${CS_FIELD_NAME}`
    );
    expect([404, 422]).toContain(response.status());
});

// --- GET /classification-store/layout-by-group/{groupId} ---

test('GetLayoutByGroupReturnsGroupLayout', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/layout-by-group/${testGroupId}?objectId=${testObjectId}&fieldName=${CS_FIELD_NAME}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('keys');
    expect(Array.isArray(data.keys)).toBe(true);
    expect(data.id).toBe(testGroupId);
});

test('GetLayoutByGroupContainsKeys', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/layout-by-group/${testGroupId}?objectId=${testObjectId}&fieldName=${CS_FIELD_NAME}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.keys.length).toBeGreaterThanOrEqual(1);
    const key = data.keys[0];
    expect(key).toHaveProperty('id');
    expect(key).toHaveProperty('name');
    expect(key).toHaveProperty('definition');
});

test('GetLayoutByGroupInvalidIdReturns404', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/layout-by-group/999999?objectId=${testObjectId}&fieldName=${CS_FIELD_NAME}`
    );
    expect([404, 422]).toContain(response.status());
});

test('GetLayoutByGroupMissingFieldNameReturns422', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/layout-by-group/${testGroupId}?objectId=${testObjectId}`
    );
    expect([400, 404, 422]).toContain(response.status());
});

test('GetLayoutByGroupInvalidObjectIdReturns404', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/layout-by-group/${testGroupId}?objectId=999999&fieldName=${CS_FIELD_NAME}`
    );
    expect([404, 422]).toContain(response.status());
});

// --- GET /classification-store/layout-by-key/{keyId}/{groupId} ---

test('GetLayoutByKeyReturnsKeyLayout', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/layout-by-key/${testKeyId}/${testGroupId}?fieldName=${CS_FIELD_NAME}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('definition');
    expect(data.id).toBe(testKeyId);
});

test('GetLayoutByKeyDefinitionShape', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/layout-by-key/${testKeyId}/${testGroupId}?fieldName=${CS_FIELD_NAME}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.definition).toHaveProperty('fieldtype');
    expect(data.definition).toHaveProperty('name');
    expect(data.definition).toHaveProperty('datatype');
});

test('GetLayoutByKeyWithOptionalObjectId', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/layout-by-key/${testKeyId}/${testGroupId}?fieldName=${CS_FIELD_NAME}&objectId=${testObjectId}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('id');
});

test('GetLayoutByKeyInvalidKeyIdReturns404', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/layout-by-key/999999/${testGroupId}?fieldName=${CS_FIELD_NAME}`
    );
    expect([404, 422]).toContain(response.status());
});

test('GetLayoutByKeyInvalidGroupIdReturns404', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/layout-by-key/${testKeyId}/999999?fieldName=${CS_FIELD_NAME}`
    );
    expect([404, 422]).toContain(response.status());
});

test('GetLayoutByKeyMissingFieldNameReturns422', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/classification-store/layout-by-key/${testKeyId}/${testGroupId}`
    );
    expect([400, 404, 422]).toContain(response.status());
});
