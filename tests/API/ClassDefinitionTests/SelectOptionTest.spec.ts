import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const timestamp = Date.now();
const testSelectOptionId = `TestSO_${timestamp}`;
let createdSelectOptionId: string;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    if (createdSelectOptionId) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/class/select-option/${createdSelectOptionId}`);
        } catch (e) {
            // Ignore cleanup errors
        }
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetSelectOptionTree', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/select-option/tree?withGroup=true');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetSelectOptionTreeWithoutGroup', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/select-option/tree?withGroup=false');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
});

test('CreateSelectOption', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/class/select-option', {
        data: {
            id: testSelectOptionId
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id', testSelectOptionId);
    expect(data).toHaveProperty('isWriteable');
    createdSelectOptionId = testSelectOptionId;
});

test('GetSelectOptionById', async () => {
    expect(createdSelectOptionId).toBeDefined();

    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/select-option/${createdSelectOptionId}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id', createdSelectOptionId);
    expect(data).toHaveProperty('isWriteable');
    expect(data).toHaveProperty('enumName');
});

test('UpdateSelectOption', async () => {
    expect(createdSelectOptionId).toBeDefined();

    const response = await authenticatedRequest.put(`/pimcore-studio/api/class/select-option/${createdSelectOptionId}`, {
        data: {
            group: null,
            adminOnly: false,
            useTraits: '',
            implementsInterfaces: '',
            selectOptions: [
                {
                    value: 'opt1',
                    label: 'Option 1'
                },
                {
                    value: 'opt2',
                    label: 'Option 2'
                }
            ]
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id', createdSelectOptionId);
});

test('GetSelectOptionUsages', async () => {
    expect(createdSelectOptionId).toBeDefined();

    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/select-option/${createdSelectOptionId}/usages`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('DeleteSelectOption', async () => {
    expect(createdSelectOptionId).toBeDefined();

    const response = await authenticatedRequest.delete(`/pimcore-studio/api/class/select-option/${createdSelectOptionId}`);
    expect(response.status()).toBe(200);

    // Verify deleted
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/class/select-option/${createdSelectOptionId}`);
    expect([404, 500]).toContain(getResponse.status());

    createdSelectOptionId = '';
});

test('GetSelectOptionByInvalidId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/select-option/NonExistentSO_xyz');
    expect([404, 500]).toContain(response.status());
});

test('CreateSelectOptionWithMissingId', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/class/select-option', {
        data: {}
    });
    expect([400, 422]).toContain(response.status());
});

test('DeleteNonExistentSelectOption', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/class/select-option/NonExistentSO_xyz');
    expect([404, 500]).toContain(response.status());
});
