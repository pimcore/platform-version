import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('CreateAssetFolderElement', async () => {
    const folderName = `folder_${Date.now()}`;
    
    const folderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        folderName
    );
    
    // Verify the folder was created (ID should be a number)
    expect(folderId).toBeDefined();
    expect(typeof folderId).toBe('number');
});

test('DeleteAssetFolderElement', async () => {
    const folderName = `delete_${Date.now()}`;
    
    // Create a folder to delete
    const folderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        folderName
    );
    
    // Delete the created folder
    await FolderHelper.deleteFolder(authenticatedRequest, folderId);
});