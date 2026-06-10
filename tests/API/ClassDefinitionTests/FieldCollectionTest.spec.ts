import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const timestamp = Date.now();
const testFcKey = `TestFC${timestamp}`;
let createdFcKey: string;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    if (createdFcKey) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/class/field-collection/${createdFcKey}`);
        } catch (e) {
            // Ignore cleanup errors
        }
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetFieldCollectionCollection', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/field-collection/collection');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetFieldCollectionTree', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/field-collection/tree');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('CreateFieldCollection', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/class/field-collection', {
        data: {
            key: testFcKey
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
    createdFcKey = testFcKey;
});

test('GetFieldCollectionByKey', async () => {
    expect(createdFcKey).toBeDefined();

    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/field-collection/${createdFcKey}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('key', createdFcKey);
});

test('UpdateFieldCollection', async () => {
    expect(createdFcKey).toBeDefined();

    const response = await authenticatedRequest.put(`/pimcore-studio/api/class/field-collection/${createdFcKey}`, {
        data: {
            configuration: {
                children: []
            },
            values: {
                parentClass: '',
                implementsInterfaces: '',
                title: 'Updated FC',
                group: null,
                blockedVarsForExport: []
            }
        }
    });
    expect(response.status()).toBe(200);
});

test('GetFieldCollectionLayout', async () => {
    expect(createdFcKey).toBeDefined();

    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/field-collection/${createdFcKey}/layout`);
    expect(response.status()).toBe(200);
});

test('GetFieldCollectionUsages', async () => {
    expect(createdFcKey).toBeDefined();

    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/field-collection/${createdFcKey}/usages`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('ExportFieldCollection', async () => {
    expect(createdFcKey).toBeDefined();

    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/field-collection/${createdFcKey}/export`);
    expect(response.status()).toBe(200);

    const contentDisposition = response.headers()['content-disposition'];
    expect(contentDisposition).toContain('attachment');
});

test('DeleteFieldCollection', async () => {
    expect(createdFcKey).toBeDefined();

    const response = await authenticatedRequest.delete(`/pimcore-studio/api/class/field-collection/${createdFcKey}`);
    expect(response.status()).toBe(200);

    // Verify deleted
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/class/field-collection/${createdFcKey}`);
    expect([404, 500]).toContain(getResponse.status());

    createdFcKey = '';
});

test('GetFieldCollectionByInvalidKey', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/field-collection/NonExistentFC_xyz');
    expect([404, 500]).toContain(response.status());
});

test('CreateFieldCollectionWithMissingKey', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/class/field-collection', {
        data: {}
    });
    expect([400, 422]).toContain(response.status());
});

test('DeleteNonExistentFieldCollection', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/class/field-collection/NonExistentFC_xyz');
    expect([404, 500]).toContain(response.status());
});
