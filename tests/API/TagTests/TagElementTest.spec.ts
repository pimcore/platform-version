import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let createdAssetFolderId: number;
let createdTagIds: number[] = [];

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    // Clean up tags
    for (const tagId of createdTagIds) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/tags/${tagId}`);
        } catch (error) {
            console.log(`Failed to delete tag ${tagId}: ${error}`);
        }
    }
    
    // Clean up asset folder
    if (createdAssetFolderId) {
        try {
            await FolderHelper.deleteFolder(authenticatedRequest, createdAssetFolderId, 'asset');
        } catch (error) {
            console.log(`Failed to delete asset folder ${createdAssetFolderId}: ${error}`);
        }
    }
    
    await authenticatedRequest.dispose();
});

test('TagElementLifecycle', async () => {
    const timestamp = Date.now();
    
    // Create an asset folder to tag
    createdAssetFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        `TagTestFolder_${timestamp}`,
        1,
        'asset'
    );
    
    // Create 5 tags
    const tagNames = ['Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5'];
    
    for (const tagName of tagNames) {
        const tagResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
            data: {
                parentId: 0,
                name: `${tagName}_${timestamp}`
            }
        });
        
        expect(tagResponse.status()).toBe(200);
        const tagData = await tagResponse.json();
        createdTagIds.push(tagData.id);
    }
    
    // Assign all 5 tags to the asset folder
    for (const tagId of createdTagIds) {
        const assignResponse = await authenticatedRequest.post(`/pimcore-studio/api/tags/assign/asset/${createdAssetFolderId}/${tagId}`);
        expect(assignResponse.status()).toBe(200);
    }
    
    // Check all tags are assigned
    const getTagsResponse1 = await authenticatedRequest.get(`/pimcore-studio/api/tags/asset/${createdAssetFolderId}`);
    expect(getTagsResponse1.status()).toBe(200);
    const assignedTags1 = await getTagsResponse1.json();
    expect(assignedTags1.items).toHaveLength(5);
    
    // Unassign 2 tags
    const tagsToUnassign = [createdTagIds[0], createdTagIds[1]];
    for (const tagId of tagsToUnassign) {
        const unassignResponse = await authenticatedRequest.delete(`/pimcore-studio/api/tags/asset/${createdAssetFolderId}/${tagId}`);
        expect(unassignResponse.status()).toBe(200);
    }
    
    // Check 3 tags remain
    const getTagsResponse2 = await authenticatedRequest.get(`/pimcore-studio/api/tags/asset/${createdAssetFolderId}`);
    expect(getTagsResponse2.status()).toBe(200);
    const assignedTags2 = await getTagsResponse2.json();
    expect(assignedTags2.items).toHaveLength(3);
    
    // Unassign remaining tags
    const remainingTags = [createdTagIds[2], createdTagIds[3], createdTagIds[4]];
    for (const tagId of remainingTags) {
        const unassignResponse = await authenticatedRequest.delete(`/pimcore-studio/api/tags/asset/${createdAssetFolderId}/${tagId}`);
        expect(unassignResponse.status()).toBe(200);
    }
    
    // Check no tags remain
    const getTagsResponse3 = await authenticatedRequest.get(`/pimcore-studio/api/tags/asset/${createdAssetFolderId}`);
    expect(getTagsResponse3.status()).toBe(200);
    const assignedTags3 = await getTagsResponse3.json();
    expect(assignedTags3.items).toHaveLength(0);
});
