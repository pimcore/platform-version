import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const createdSettingIds: number[] = [];

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    // Clean up all created settings
    for (const id of createdSettingIds) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/website-settings/${id}`);
        } catch (_) {
            // ignore cleanup errors
        }
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetWebsiteSettingTypes', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/website-settings/types');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBeTruthy();
    expect(data.items.length).toBeGreaterThan(0);
});

test('CreateWebsiteSetting', async () => {
    const uniqueName = `TestSetting_${Date.now()}`;
    const response = await authenticatedRequest.post('/pimcore-studio/api/website-settings/add', {
        data: {
            name: uniqueName,
            type: 'text',
        },
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.name).toBe(uniqueName);
    expect(data.type).toBe('text');
    createdSettingIds.push(data.id);
});

test('ListWebsiteSettings', async () => {
    // Create a setting to ensure at least one exists
    const uniqueName = `TestSettingList_${Date.now()}`;
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/website-settings/add', {
        data: { name: uniqueName, type: 'text' },
    });
    expect(createResponse.status()).toBe(200);
    const created = await createResponse.json();
    createdSettingIds.push(created.id);

    // List settings
    const response = await authenticatedRequest.post('/pimcore-studio/api/website-settings', {
        data: {
            filters: {
                page: 1,
                pageSize: 50,
            },
        },
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBeTruthy();
    expect(data.totalItems).toBeGreaterThanOrEqual(1);

    // Verify our created setting appears in the list
    const found = data.items.find((item: any) => item.id === created.id);
    expect(found).toBeDefined();
    expect(found.name).toBe(uniqueName);
});

test('UpdateWebsiteSetting', async () => {
    // Create a setting to update
    const uniqueName = `TestSettingUpdate_${Date.now()}`;
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/website-settings/add', {
        data: { name: uniqueName, type: 'text' },
    });
    expect(createResponse.status()).toBe(200);
    const created = await createResponse.json();
    createdSettingIds.push(created.id);

    // Update the setting
    const updatedName = `Updated_${uniqueName}`;
    const updateResponse = await authenticatedRequest.put(`/pimcore-studio/api/website-settings/${created.id}`, {
        data: {
            name: updatedName,
            language: 'en',
            data: 'some test data',
            siteId: null,
        },
    });
    expect(updateResponse.status()).toBe(200);

    const updated = await updateResponse.json();
    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe(updatedName);
    expect(updated.data).toBe('some test data');
});

test('DeleteWebsiteSetting', async () => {
    // Create a setting to delete
    const uniqueName = `TestSettingDelete_${Date.now()}`;
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/website-settings/add', {
        data: { name: uniqueName, type: 'text' },
    });
    expect(createResponse.status()).toBe(200);
    const created = await createResponse.json();

    // Delete it
    const deleteResponse = await authenticatedRequest.delete(`/pimcore-studio/api/website-settings/${created.id}`);
    expect(deleteResponse.status()).toBe(200);

    // Verify it's gone - list and check
    const listResponse = await authenticatedRequest.post('/pimcore-studio/api/website-settings', {
        data: { filters: { page: 1, pageSize: 200 } },
    });
    expect(listResponse.status()).toBe(200);
    const listData = await listResponse.json();
    const found = listData.items.find((item: any) => item.id === created.id);
    expect(found).toBeUndefined();
});

test('DeleteWebsiteSettingWithInvalidId', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/website-settings/999999');
    expect([404, 422, 500]).toContain(response.status());
});

test('UpdateWebsiteSettingWithInvalidId', async () => {
    const response = await authenticatedRequest.put('/pimcore-studio/api/website-settings/999999', {
        data: {
            name: 'nonexistent',
            language: 'en',
            data: 'test',
            siteId: null,
        },
    });
    expect([404, 422, 500]).toContain(response.status());
});

test('CreateWebsiteSettingWithMissingFields', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/website-settings/add', {
        data: {},
    });
    expect([400, 422]).toContain(response.status());
});
