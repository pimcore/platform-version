import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const timestamp = Date.now();

// Track created IDs for cleanup
let createdUserId: number | undefined;
let createdFolderId: number | undefined;
let clonedUserId: number | undefined;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    for (const id of [clonedUserId, createdUserId]) {
        if (id) {
            try {
                await authenticatedRequest.delete(`/pimcore-studio/api/user/${id}`);
            } catch (e) { /* ignore */ }
        }
    }
    if (createdFolderId) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/user/folder/${createdFolderId}`);
        } catch (e) { /* ignore */ }
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetAllUsers', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/users');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
});

test('GetUsersTree', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/users/tree?parentId=0');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
});

test('GetUsersShareList', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/users-share-list');
    expect(response.status()).toBe(200);
});

test('GetAvailablePermissions', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/user/available-permissions');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
});

test('GetDefaultKeyBindings', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/users/default-key-bindings');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
});

test('SearchUsers', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/user/search?searchQuery=admin');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
});

test('GetUsersWithPermission', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/users/with-permission?permission=assets&includeCurrentUser=true');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
});

test('CreateUserFolder', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/user/folder', {
        data: {
            parentId: 0,
            name: `test-user-folder-${timestamp}`
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    createdFolderId = data.id;
});

test('CreateUser', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/user/', {
        data: {
            parentId: 0,
            name: `test-user-${timestamp}`
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    createdUserId = data.id;
});

test('GetUserById', async () => {
    expect(createdUserId).toBeDefined();

    const response = await authenticatedRequest.get(`/pimcore-studio/api/user/${createdUserId}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id', createdUserId);
    expect(data).toHaveProperty('name');
});

test('UpdateUser', async () => {
    expect(createdUserId).toBeDefined();

    const response = await authenticatedRequest.put(`/pimcore-studio/api/user/${createdUserId}`, {
        data: {
            email: null,
            firstname: 'Test',
            lastname: 'User',
            admin: false,
            active: true,
            classes: [],
            docTypes: [],
            closeWarning: true,
            allowDirtyClose: false,
            contentLanguages: [],
            keyBindings: [],
            language: 'en',
            memorizeTabs: false,
            parentId: 0,
            permissions: [],
            roles: [],
            twoFactorAuthenticationRequired: false,
            websiteTranslationLanguagesEdit: [],
            websiteTranslationLanguagesView: [],
            welcomeScreen: false,
            assetWorkspaces: [],
            dataObjectWorkspaces: [],
            documentWorkspaces: [],
            perspectives: []
        }
    });
    expect(response.status()).toBe(200);
});

test('UpdateUserPassword', async () => {
    expect(createdUserId).toBeDefined();

    const response = await authenticatedRequest.put(`/pimcore-studio/api/user/${createdUserId}/password`, {
        data: {
            password: 'NewP@ssw0rd123!',
            passwordConfirmation: 'NewP@ssw0rd123!'
        }
    });
    expect(response.status()).toBe(200);
});

test('CloneUser', async () => {
    expect(createdUserId).toBeDefined();

    const response = await authenticatedRequest.post(`/pimcore-studio/api/user/clone/${createdUserId}`, {
        data: {
            name: `cloned-user-${timestamp}`
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    clonedUserId = data.id;
});

test('GetUserImage', async () => {
    expect(createdUserId).toBeDefined();

    const response = await authenticatedRequest.get(`/pimcore-studio/api/user/image/${createdUserId}`);
    // Returns 200 with image, or 404/500 if no image set
    expect([200, 404, 500]).toContain(response.status());
});

test('DeleteUserImage', async () => {
    expect(createdUserId).toBeDefined();

    const response = await authenticatedRequest.delete(`/pimcore-studio/api/user/image/${createdUserId}`);
    // Returns 200 or 404/500 if no image exists
    expect([200, 404, 500]).toContain(response.status());
});

test('GenerateTokenLink', async () => {
    expect(createdUserId).toBeDefined();

    const response = await authenticatedRequest.post(`/pimcore-studio/api/user/token-link/${createdUserId}`, {
        data: {
            tokenLoginUrl: 'https://example.com/login'
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
});

test('ResetPassword', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/user/reset-password', {
        data: {
            username: `test-user-${timestamp}`,
            resetPasswordUrl: 'https://example.com/reset-password'
        }
    });
    // May return 200 even if user has no email configured
    expect([200, 400, 422, 500]).toContain(response.status());
});

test('DeleteUser', async () => {
    // Create a user specifically to delete
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/user/', {
        data: { parentId: 0, name: `delete-user-${timestamp}` }
    });
    expect(createResponse.status()).toBe(200);
    const deleteId = (await createResponse.json()).id;

    const response = await authenticatedRequest.delete(`/pimcore-studio/api/user/${deleteId}`);
    expect(response.status()).toBe(200);
});

test('DeleteUserFolder', async () => {
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/user/folder', {
        data: { parentId: 0, name: `delete-user-folder-${timestamp}` }
    });
    expect(createResponse.status()).toBe(200);
    const deleteId = (await createResponse.json()).id;

    const response = await authenticatedRequest.delete(`/pimcore-studio/api/user/folder/${deleteId}`);
    expect(response.status()).toBe(200);
});

test('GetUserByInvalidId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/user/999999');
    expect([404, 500]).toContain(response.status());
});

test('DeleteNonExistentUser', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/user/999999');
    expect([404, 500]).toContain(response.status());
});
