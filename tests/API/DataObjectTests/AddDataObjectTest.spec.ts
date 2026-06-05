import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let testFolderId: number;
const timestamp = Date.now();
const testFolderName = `do-add-test-${timestamp}`;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    // Create a data-object folder for our tests
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

test('CreateDataObjectAndGetById', async () => {
    const objectKey = `test-object-${timestamp}`;

    // Create a new data object using SimpleAutomaticTest class
    const createResponse = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: {
            key: objectKey,
            classId: 'test_ATS',
            type: 'object'
        }
    });
    expect(createResponse.status()).toBe(200);

    const createData = await createResponse.json();
    expect(createData.id).toBeDefined();
    expect(typeof createData.id).toBe('number');

    const objectId = createData.id;

    // Get the data object by ID
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/data-objects/${objectId}`);
    expect(getResponse.status()).toBe(200);

    const objectData = await getResponse.json();
    expect(objectData.id).toBe(objectId);
    expect(objectData.key).toBe(objectKey);
    expect(objectData.parentId).toBe(testFolderId);
    expect(objectData.className).toBe('automaticTestSimple');
});

test('CreateDataObjectWithFullAutomaticTestClass', async () => {
    const objectKey = `test-full-object-${timestamp}`;

    const createResponse = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: {
            key: objectKey,
            classId: 'test_ATF',
            type: 'object'
        }
    });
    expect(createResponse.status()).toBe(200);

    const createData = await createResponse.json();
    expect(createData.id).toBeDefined();

    // Verify it can be retrieved
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/data-objects/${createData.id}`);
    expect(getResponse.status()).toBe(200);

    const objectData = await getResponse.json();
    expect(objectData.className).toBe('automaticTestFull');
});

test('CreateDataObjectWithInvalidParentId', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/data-objects/add/999999', {
        data: {
            key: `invalid-parent-${timestamp}`,
            classId: 'test_ATS',
            type: 'object'
        }
    });
    expect([404, 500]).toContain(response.status());
});

test('CreateDataObjectWithInvalidClassId', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: {
            key: `invalid-class-${timestamp}`,
            classId: 'non_existent_class',
            type: 'object'
        }
    });
    expect([400, 404, 422, 500]).toContain(response.status());
});

test('CreateDataObjectWithMissingKey', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: {
            classId: 'test_ATS',
            type: 'object'
        }
    });
    expect([400, 422]).toContain(response.status());
});

test('GetDataObjectWithInvalidId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/data-objects/999999');
    expect(response.status()).toBe(404);
});
