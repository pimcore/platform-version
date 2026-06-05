// Example of how to use the AuthHelper with environment variables
import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../utils/auth';

let authenticatedRequest: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
    // Using environment variables (PIMCORE_USERNAME and PIMCORE_PASSWORD from .env file)
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
    
    // Or using custom credentials (overriding environment variables)
    // authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright, 'custom_user', 'custom_pass');
});

test.afterAll(async () => {
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

// Your tests here...
