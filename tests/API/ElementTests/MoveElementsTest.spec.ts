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

test('Move asset folder element', async () => {
    const timestamp = Date.now();
    const folder1Name = `folder1_${timestamp}`;
    const folder2Name = `folder2_${timestamp}`;
    const folder3Name = `folder3_${timestamp}`;
    
    // Create first two folders under parent ID 1
    const [folder1Id, folder2Id] = await FolderHelper.createFoldersAndGetIds(
        authenticatedRequest,
        [folder1Name, folder2Name]
    );
    
    // Create third folder inside first folder
    const folder3Id = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        folder3Name,
        folder1Id,
        'asset',
        `/${folder1Name}`
    );
    
    // Move folder3 from folder1 to folder2 using PATCH
    const moveResponse = await authenticatedRequest.patch('/pimcore-studio/api/assets', {
        data: {
            data: [{
                id: folder3Id,
                parentId: folder2Id
            }]
        }
    });
    expect(moveResponse.status()).toBe(200);
    
    // Validate folder3 is now in folder2
    const validationResponse = await authenticatedRequest.get(`/pimcore-studio/api/elements/asset/resolve?searchTerm=/${folder2Name}/${folder3Name}`);
    expect(validationResponse.status()).toBe(200);
    const validationData = await validationResponse.json();
    expect(validationData.id).toBe(folder3Id);
    
    // Clean up: delete the created folders
    await FolderHelper.deleteFolders(authenticatedRequest, [folder1Id, folder2Id]);
});