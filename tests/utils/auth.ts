import { APIRequestContext, expect } from '@playwright/test';

export class AuthHelper {
    /**
     * Creates an authenticated API request context for Pimcore Studio API
     * @param playwright - The Playwright instance from the test context
     * @param username - Username for authentication (defaults to PIMCORE_USERNAME env var or 'admin')
     * @param password - Password for authentication (defaults to PIMCORE_PASSWORD env var or 'admin')
     * @returns Promise<APIRequestContext> - Authenticated request context
     */
    static async createAuthenticatedRequest(
        playwright: any, 
        username: string = process.env.PIMCORE_USERNAME || 'admin', 
        password: string = process.env.PIMCORE_PASSWORD || 'admin'
    ): Promise<APIRequestContext> {
        const authenticatedRequest = await playwright.request.newContext();
        
        const loginResponse = await authenticatedRequest.post('/pimcore-studio/api/login', {
            data: {
                username,
                password
            }
        });
        
        expect(loginResponse.status()).toBe(200);
        
        return authenticatedRequest;
    }

    /**
     * Disposes of the authenticated request context
     * @param authenticatedRequest - The authenticated request context to dispose
     */
    static async disposeAuthenticatedRequest(authenticatedRequest: APIRequestContext): Promise<void> {
        await authenticatedRequest.dispose();
    }
}
