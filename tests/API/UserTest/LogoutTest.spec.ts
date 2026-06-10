import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('SuccessfulLogout', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/logout');
    
    expect(response.status()).toBe(200);
    
    const userInfoResponse = await authenticatedRequest.get('/pimcore-studio/api/user/current-user-information');
    expect(userInfoResponse.status()).toBe(401);
});
