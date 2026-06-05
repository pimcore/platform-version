import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('UpdateCurrentUserProfile', async () => {
    // First get current user info to know existing values
    const infoResponse = await authenticatedRequest.get('/pimcore-studio/api/user/current-user-information');
    expect(infoResponse.status()).toBe(200);
    const currentUser = await infoResponse.json();

    const response = await authenticatedRequest.put('/pimcore-studio/api/user/update-profile', {
        data: {
            firstname: currentUser.firstname || '',
            lastname: currentUser.lastname || '',
            email: currentUser.email || '',
            language: currentUser.language || 'en',
            dateTimeLocale: currentUser.dateTimeLocale || '',
            welcomeScreen: currentUser.welcomeScreen ?? true,
            memorizeTabs: currentUser.memorizeTabs ?? true,
            contentLanguages: currentUser.contentLanguages || [],
            keyBindings: currentUser.keyBindings || []
        }
    });
    expect(response.status()).toBe(200);
});
