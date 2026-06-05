import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const timestamp = Date.now();
const testBrickKey = `TestBrick${timestamp}`;
let createdBrickKey: string;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    if (createdBrickKey) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/class/object-brick/${createdBrickKey}`);
        } catch (e) {
            // Ignore cleanup errors
        }
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetObjectBrickCollection', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/object-brick/collection');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetObjectBrickTree', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/object-brick/tree');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetObjectBrickClasses', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/object-brick/classes');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('CreateObjectBrick', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/class/object-brick', {
        data: {
            key: testBrickKey
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
    createdBrickKey = testBrickKey;
});

test('GetObjectBrickByKey', async () => {
    expect(createdBrickKey).toBeDefined();

    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/object-brick/${createdBrickKey}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('key', createdBrickKey);
});

test('UpdateObjectBrick', async () => {
    expect(createdBrickKey).toBeDefined();

    const response = await authenticatedRequest.put(`/pimcore-studio/api/class/object-brick/${createdBrickKey}`, {
        data: {
            configuration: {
                children: []
            },
            values: {
                parentClass: '',
                implementsInterfaces: '',
                title: 'Updated Brick',
                group: null,
                classDefinitions: [],
                blockedVarsForExport: []
            }
        }
    });
    expect(response.status()).toBe(200);
});

test('GetObjectBrickLayout', async () => {
    expect(createdBrickKey).toBeDefined();

    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/object-brick/${createdBrickKey}/layout`);
    expect(response.status()).toBe(200);
});

test('GetObjectBrickUsages', async () => {
    expect(createdBrickKey).toBeDefined();

    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/object-brick/${createdBrickKey}/usages`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('ExportObjectBrick', async () => {
    expect(createdBrickKey).toBeDefined();

    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/object-brick/${createdBrickKey}/export`);
    expect(response.status()).toBe(200);

    const contentDisposition = response.headers()['content-disposition'];
    expect(contentDisposition).toContain('attachment');
});

test('DeleteObjectBrick', async () => {
    expect(createdBrickKey).toBeDefined();

    const response = await authenticatedRequest.delete(`/pimcore-studio/api/class/object-brick/${createdBrickKey}`);
    expect(response.status()).toBe(200);

    // Verify deleted
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/class/object-brick/${createdBrickKey}`);
    expect([404, 500]).toContain(getResponse.status());

    createdBrickKey = '';
});

test('GetObjectBrickByInvalidKey', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/object-brick/NonExistentBrick_xyz');
    expect([404, 500]).toContain(response.status());
});

test('CreateObjectBrickWithMissingKey', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/class/object-brick', {
        data: {}
    });
    expect([400, 422]).toContain(response.status());
});

test('DeleteNonExistentObjectBrick', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/class/object-brick/NonExistentBrick_xyz');
    expect([404, 500]).toContain(response.status());
});
