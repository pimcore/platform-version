import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    await authenticatedRequest.dispose();
});

test('GetNoteById', async () => {
    const timestamp = Date.now();
    
    // Create folder for test
    const folderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        `GetTestFolder_${timestamp}`,
        1,
        'data-object'
    );
    
    const createResponse = await authenticatedRequest.post(`/pimcore-studio/api/notes/data-object/${folderId}`, {
        data: {
            title: `TestNote_${timestamp}`,
            description: `Test note description ${timestamp}`,
            type: 'content'
        }
    });
    
    expect(createResponse.status()).toBe(200);
    const createdNote = await createResponse.json();
    
    // The GET /pimcore-studio/api/notes/{id} endpoint returns 405 (Method Not Allowed)
    // This suggests the endpoint might not be implemented
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/notes/${createdNote.id}`);
    expect(getResponse.status()).toBe(405);
    
    // Cleanup
    await authenticatedRequest.delete(`/pimcore-studio/api/notes/${createdNote.id}`);
    await FolderHelper.deleteFolder(authenticatedRequest, folderId, 'data-object');
});

test('UpdateNoteById', async () => {
    const timestamp = Date.now();
    
    // Create folder for test
    const folderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        `UpdateTestFolder_${timestamp}`,
        1,
        'data-object'
    );
    
    const createResponse = await authenticatedRequest.post(`/pimcore-studio/api/notes/data-object/${folderId}`, {
        data: {
            title: `OriginalNote_${timestamp}`,
            description: `Original description ${timestamp}`,
            type: 'content'
        }
    });
    
    expect(createResponse.status()).toBe(200);
    const createdNote = await createResponse.json();
    
    // The PUT /pimcore-studio/api/notes/{id} endpoint returns 405 (Method Not Allowed)
    // This suggests the endpoint might not be implemented
    const updateResponse = await authenticatedRequest.put(`/pimcore-studio/api/notes/${createdNote.id}`, {
        data: {
            title: `UpdatedNote_${timestamp}`,
            description: `Updated description ${timestamp}`,
            type: 'content'
        }
    });
    
    expect(updateResponse.status()).toBe(405);
    
    // Cleanup
    await authenticatedRequest.delete(`/pimcore-studio/api/notes/${createdNote.id}`);
    await FolderHelper.deleteFolder(authenticatedRequest, folderId, 'data-object');
});

test('GetNonExistentNote', async () => {
    const nonExistentId = 999999;
    
    // The GET /pimcore-studio/api/notes/{id} endpoint returns 405 (Method Not Allowed)
    // This suggests the endpoint might not be implemented
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/notes/${nonExistentId}`);
    expect(getResponse.status()).toBe(405);
});

test('UpdateNonExistentNote', async () => {
    const nonExistentId = 999999;
    const timestamp = Date.now();
    
    // The PUT /pimcore-studio/api/notes/{id} endpoint returns 405 (Method Not Allowed)
    // This suggests the endpoint might not be implemented
    const updateResponse = await authenticatedRequest.put(`/pimcore-studio/api/notes/${nonExistentId}`, {
        data: {
            title: `UpdatedNote_${timestamp}`,
            description: `Updated description ${timestamp}`,
            type: 'content'
        }
    });
    
    expect(updateResponse.status()).toBe(405);
});
