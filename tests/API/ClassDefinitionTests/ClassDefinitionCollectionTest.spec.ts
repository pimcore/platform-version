import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetClassDefinitionCollection', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/collection');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.totalItems).toBeGreaterThan(0);
});

test('GetCreatableClassDefinitionCollection', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/collection/creatable');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetClassDefinitionTree', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/definition/configuration-view/tree?withGroup=true');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.totalItems).toBeGreaterThan(0);
});

test('GetClassDefinitionTreeWithoutGroup', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/definition/configuration-view/tree?withGroup=false');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetClassDefinitionByClassId', async () => {
    // Use the pre-provisioned SimpleAutomaticTest class (name=automaticTestSimple)
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/definition/automaticTestSimple');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name');
});

test('GetClassDefinitionByInvalidClassId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/definition/non_existent_class_xyz');
    expect([404, 500]).toContain(response.status());
});

test('GetAvailableVisibleFields', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/definition/available-visible-fields');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetAvailableVisibleFieldsWithClassNames', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/definition/available-visible-fields?classNames=automaticTestSimple');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
});

test('GetFieldsByType', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/definition/fields-by-type?classId=test_ATS&type=input');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetFieldsByTypeWithInvalidClass', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/definition/fields-by-type?classId=non_existent&type=input');
    expect([200, 404, 500]).toContain(response.status());
});

test('GetAllLayouts', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/all-layouts');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetIdentifierData', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/definition/configuration-view/identifier-data');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('suggestedId');
});

test('GetSelectedVisibleFields', async () => {
    // Use a string-based class ID (numeric IDs cause type validation issues on some endpoints)
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/definition/configuration-view/detail/EF_FD/selected-visible-fields');
    // This endpoint may require a valid relationField or return 404 for classes without visible fields
    expect([200, 404]).toContain(response.status());

    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('columns');
        expect(Array.isArray(data.columns)).toBe(true);
    }
});

test('GetClassDefinitionLayout', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/definition/configuration-view/detail/test_ATS/layout');
    expect(response.status()).toBe(200);

    const data = await response.json();
    // Layout should return layout definition
    expect(data).toBeDefined();
});

test('GetClassDefinitionBricks', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/definition/configuration-view/detail/test_ATF/bricks');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetClassDefinitionById', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/definition/configuration-view/detail/test_ATS');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('isWriteable');
    expect(data.id).toBe('test_ATS');
});

test('GetClassDefinitionByIdInvalid', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/definition/configuration-view/detail/non_existent_xyz');
    expect([404, 500]).toContain(response.status());
});
