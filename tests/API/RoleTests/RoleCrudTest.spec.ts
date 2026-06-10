import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const timestamp = Date.now();

// Track created IDs for cleanup
let createdRoleId: number | undefined;
let createdFolderId: number | undefined;
let clonedRoleId: number | undefined;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    // Delete in reverse order: cloned role, role, folder
    for (const id of [clonedRoleId, createdRoleId]) {
        if (id) {
            try {
                await authenticatedRequest.delete(`/pimcore-studio/api/role/${id}`);
            } catch (e) { /* ignore */ }
        }
    }
    if (createdFolderId) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/role/folder/${createdFolderId}`);
        } catch (e) { /* ignore */ }
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetAllRoles', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/roles');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
});

test('GetRolesTree', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/roles/tree?parentId=0');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
});

test('GetRolesShareList', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/roles-share-list');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
});

test('SearchRoles', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/role/search?searchQuery=admin');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
});

test('GetRolesWithPermission', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/roles/with-permission?permission=assets');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
});

test('CreateRoleFolder', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/role/folder', {
        data: {
            parentId: 0,
            name: `test-role-folder-${timestamp}`
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    createdFolderId = data.id;
});

test('CreateRole', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/role', {
        data: {
            parentId: 0,
            name: `test-role-${timestamp}`
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    createdRoleId = data.id;
});

test('GetRoleById', async () => {
    expect(createdRoleId).toBeDefined();

    const response = await authenticatedRequest.get(`/pimcore-studio/api/role/${createdRoleId}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id', createdRoleId);
    expect(data).toHaveProperty('name');
});

test('UpdateRole', async () => {
    expect(createdRoleId).toBeDefined();

    // First get current role data
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/role/${createdRoleId}`);
    const roleData = await getResponse.json();

    const response = await authenticatedRequest.put(`/pimcore-studio/api/role/${createdRoleId}`, {
        data: {
            name: roleData.name,
            classes: [],
            parentId: roleData.parentId,
            permissions: [],
            docTypes: [],
            websiteTranslationLanguagesEdit: [],
            websiteTranslationLanguagesView: [],
            assetWorkspaces: [],
            dataObjectWorkspaces: [],
            documentWorkspaces: [],
            perspectives: []
        }
    });
    expect(response.status()).toBe(200);
});

test('CloneRole', async () => {
    expect(createdRoleId).toBeDefined();

    const response = await authenticatedRequest.post(`/pimcore-studio/api/role/clone/${createdRoleId}`, {
        data: {
            name: `cloned-role-${timestamp}`
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    clonedRoleId = data.id;
});

test('DeleteRole', async () => {
    // Create a role specifically to delete
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/role', {
        data: { parentId: 0, name: `delete-role-${timestamp}` }
    });
    expect(createResponse.status()).toBe(200);
    const deleteId = (await createResponse.json()).id;

    const response = await authenticatedRequest.delete(`/pimcore-studio/api/role/${deleteId}`);
    expect(response.status()).toBe(200);
});

test('DeleteRoleFolder', async () => {
    // Create a folder specifically to delete
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/role/folder', {
        data: { parentId: 0, name: `delete-role-folder-${timestamp}` }
    });
    expect(createResponse.status()).toBe(200);
    const deleteId = (await createResponse.json()).id;

    const response = await authenticatedRequest.delete(`/pimcore-studio/api/role/folder/${deleteId}`);
    expect(response.status()).toBe(200);
});

test('GetRoleByInvalidId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/role/999999');
    expect([404, 500]).toContain(response.status());
});

test('DeleteNonExistentRole', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/role/999999');
    expect([404, 500]).toContain(response.status());
});
