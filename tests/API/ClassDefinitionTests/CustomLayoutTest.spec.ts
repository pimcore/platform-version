import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const timestamp = Date.now();
const testClassUid = `test_cl_${timestamp}`;
const testClassName = `TestCL${timestamp}`;
let createdClassId: string;
let createdCustomLayoutId: string;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    // Create a temporary class definition to use for custom layout tests
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/class/definition/configuration-view/detail/create', {
        data: {
            name: testClassName,
            uid: testClassUid
        }
    });
    expect(createResponse.status()).toBe(200);
    createdClassId = testClassUid;
});

test.afterAll(async () => {
    // Delete custom layout first
    if (createdCustomLayoutId) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/class/custom-layout/${createdCustomLayoutId}`);
        } catch (e) {
            // Ignore
        }
    }
    // Delete class definition
    if (createdClassId) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/class/definition/configuration-view/detail/${createdClassId}`);
        } catch (e) {
            // Ignore
        }
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetCustomLayoutCollection', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/custom-layout/collection');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetCustomLayoutIdentifierData', async () => {
    expect(createdClassId).toBeDefined();

    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/custom-layout/identifier-data/${createdClassId}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('suggestedId');
    expect(data).toHaveProperty('existingIds');
    expect(data).toHaveProperty('existingNames');
});

test('CreateCustomLayout', async () => {
    expect(createdClassId).toBeDefined();

    // Get a suggested ID first
    const idResponse = await authenticatedRequest.get(`/pimcore-studio/api/class/custom-layout/identifier-data/${createdClassId}`);
    const idData = await idResponse.json();
    const layoutId = idData.suggestedId || `cl_${timestamp}`;

    const response = await authenticatedRequest.post(`/pimcore-studio/api/class/custom-layout/${layoutId}`, {
        data: {
            name: `TestLayout_${timestamp}`,
            classId: createdClassId
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
    createdCustomLayoutId = layoutId;
});

test('GetCustomLayoutById', async () => {
    expect(createdCustomLayoutId).toBeDefined();

    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/custom-layout/${createdCustomLayoutId}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
});

test('UpdateCustomLayout', async () => {
    expect(createdCustomLayoutId).toBeDefined();

    const response = await authenticatedRequest.put(`/pimcore-studio/api/class/custom-layout/${createdCustomLayoutId}`, {
        data: {
            configuration: {
                children: []
            },
            values: {
                name: `UpdatedLayout_${timestamp}`,
                description: 'Updated via API test'
            }
        }
    });
    expect(response.status()).toBe(200);
});

test('ExportCustomLayout', async () => {
    expect(createdCustomLayoutId).toBeDefined();

    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/custom-layout/export/${createdCustomLayoutId}`);
    expect(response.status()).toBe(200);

    const contentDisposition = response.headers()['content-disposition'];
    expect(contentDisposition).toContain('attachment');
});

test('GetCustomLayoutCollectionWithClassFilter', async () => {
    expect(createdClassId).toBeDefined();

    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/custom-layout/collection?classIds=${createdClassId}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
});

test('DeleteCustomLayout', async () => {
    expect(createdCustomLayoutId).toBeDefined();

    const response = await authenticatedRequest.delete(`/pimcore-studio/api/class/custom-layout/${createdCustomLayoutId}`);
    expect(response.status()).toBe(200);

    // Verify deleted
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/class/custom-layout/${createdCustomLayoutId}`);
    expect([404, 500]).toContain(getResponse.status());

    createdCustomLayoutId = '';
});

test('GetCustomLayoutByInvalidId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/custom-layout/NonExistentLayout_xyz');
    expect([404, 500]).toContain(response.status());
});

test('DeleteNonExistentCustomLayout', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/class/custom-layout/NonExistentLayout_xyz');
    expect([404, 500]).toContain(response.status());
});
