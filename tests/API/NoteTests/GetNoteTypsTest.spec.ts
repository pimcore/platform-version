import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.describe('Note Types API Tests', () => {
    test('Get note types for data-object element type', async () => {
        const response = await authenticatedRequest.get('/pimcore-studio/api/notes/type/data-object');
        
        expect(response.status()).toBe(200);
        
        const responseData = await response.json();
        
        // Verify response structure
        expect(responseData).toHaveProperty('items');
        expect(Array.isArray(responseData.items)).toBe(true);
        
        // If there are items, verify their structure
        if (responseData.items.length > 0) {
            const firstItem = responseData.items[0];
            expect(firstItem).toHaveProperty('id');
            expect(typeof firstItem.id).toBe('string');
            
            // Check that the note type has the expected structure from the API schema
            expect(firstItem.id).toBeTruthy();
        }
    });

    test('Get note types for asset element type', async () => {
        const response = await authenticatedRequest.get('/pimcore-studio/api/notes/type/asset');
        
        expect(response.status()).toBe(200);
        
        const responseData = await response.json();
        
        // Verify response structure
        expect(responseData).toHaveProperty('items');
        expect(Array.isArray(responseData.items)).toBe(true);
        
        // If there are items, verify their structure
        if (responseData.items.length > 0) {
            const firstItem = responseData.items[0];
            expect(firstItem).toHaveProperty('id');
            expect(typeof firstItem.id).toBe('string');
            
            // Check that the note type has the expected structure from the API schema
            expect(firstItem.id).toBeTruthy();
        }
    });

    test('Get note types for document element type', async () => {
        const response = await authenticatedRequest.get('/pimcore-studio/api/notes/type/document');
        
        expect(response.status()).toBe(200);
        
        const responseData = await response.json();
        
        // Verify response structure
        expect(responseData).toHaveProperty('items');
        expect(Array.isArray(responseData.items)).toBe(true);
        
        // If there are items, verify their structure
        if (responseData.items.length > 0) {
            const firstItem = responseData.items[0];
            expect(firstItem).toHaveProperty('id');
            expect(typeof firstItem.id).toBe('string');
            
            // Check that the note type has the expected structure from the API schema
            expect(firstItem.id).toBeTruthy();
        }
    });

    test('Get note types with invalid element type returns 403', async () => {
        const response = await authenticatedRequest.get('/pimcore-studio/api/notes/type/invalid-type');
        
        // Should return 403 for invalid element type
        expect(response.status()).toBe(403);
    });
});
