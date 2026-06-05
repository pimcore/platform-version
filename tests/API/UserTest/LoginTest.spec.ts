import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    await authenticatedRequest.dispose();
});

test('FailForGetLogin', async ({ request }) => {
    const response = await request.get('/pimcore-studio/api/login');
    
    expect(response.status()).toBe(405);
})

test('SuccessfulLogin', async ({ request }) => {
    const response = await request.post('/pimcore-studio/api/login', {
        data: {
            username: 'admin',
            password: 'admin'
        }
    });

    expect(response.status()).toBe(200);
})

test('FailLoginWithRandomCredentials', async ({ request }) => {
    const response = await request.post('/pimcore-studio/api/login', {
        data: {
            username: 'user123',
            password: 'pass456'
        }
    });
    
    expect(response.status()).toBe(401);
})

test('FailLoginWithRandomInvalidCredentials', async ({ request }) => {
    const timestamp = Date.now();
    const response = await request.post('/pimcore-studio/api/login', {
        data: {
            username: `invalid_${timestamp}`,
            password: `wrong_${timestamp}`
        }
    });
    
    expect(response.status()).toBe(401);
})

test('AuthenticatedRequest', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/user/current-user-information');
    
    expect(response.status()).toBe(200);
    
    const userData = await response.json();
    expect(userData.id).toBeDefined();
    expect(userData.username).toBeDefined();
    expect(userData.email).toBeDefined();
    expect(userData.permissions).toBeDefined();
    expect(userData.isAdmin).toBeDefined();
})

test('FailLoginWithEmptyCredentials', async ({ request }) => {
    const response = await request.post('/pimcore-studio/api/login', {
        data: {
            username: '',
            password: ''
        }
    });
    
    expect(response.status()).toBe(401);
})

test('FailLoginWithMissingUsername', async ({ request }) => {
    const response = await request.post('/pimcore-studio/api/login', {
        data: {
            password: 'admin'
        }
    });
    
    expect(response.status()).toBe(400);
})

test('FailLoginWithMissingPassword', async ({ request }) => {
    const response = await request.post('/pimcore-studio/api/login', {
        data: {
            username: 'admin'
        }
    });
    
    expect(response.status()).toBe(400);
})

test('FailLoginWithInvalidJsonPayload', async ({ request }) => {
    const response = await request.post('/pimcore-studio/api/login', {
        data: 'invalid json'
    });
    
    expect(response.status()).toBe(401);
})

test('FailLoginWithEmptyPayload', async ({ request }) => {
    const response = await request.post('/pimcore-studio/api/login', {
        data: {}
    });
    
    expect(response.status()).toBe(400);
})

test('FailCurrentUserInfoWithoutAuth', async ({ request }) => {
    const response = await request.get('/pimcore-studio/api/user/current-user-information');
    
    expect(response.status()).toBe(401);
})