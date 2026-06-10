import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
let createdTagIds: number[] = [];

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    // Clean up created tags
    for (const tagId of createdTagIds) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/tags/${tagId}`);
        } catch (error) {
            console.log(`Failed to delete tag ${tagId}: ${error}`);
        }
    }
    
    await authenticatedRequest.dispose();
});

test('GetTagsForParent', async () => {
    const timestamp = Date.now();
    
    // Create a parent tag
    const parentResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: 0,
            name: `ParentTag_${timestamp}`
        }
    });
    
    expect(parentResponse.status()).toBe(200);
    const parentTag = await parentResponse.json();
    createdTagIds.push(parentTag.id);
    
    // Create child tags
    for (let i = 1; i <= 3; i++) {
        const childResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
            data: {
                parentId: parentTag.id,
                name: `ChildTag_${i}_${timestamp}`
            }
        });
        
        expect(childResponse.status()).toBe(200);
        const childTag = await childResponse.json();
        createdTagIds.push(childTag.id);
    }
    
    // Get tags for parent
    const getTagsResponse = await authenticatedRequest.get(`/pimcore-studio/api/tags?parentId=${parentTag.id}`);
    expect(getTagsResponse.status()).toBe(200);
    
    const tagsData = await getTagsResponse.json();
    expect(tagsData.items).toHaveLength(3);
    
    // Verify all child tags are returned
    const childNames = tagsData.items.map(tag => tag.text);
    expect(childNames).toContain(`ChildTag_1_${timestamp}`);
    expect(childNames).toContain(`ChildTag_2_${timestamp}`);
    expect(childNames).toContain(`ChildTag_3_${timestamp}`);
});

test('GetTagsForRootParent', async () => {
    // Get root level tags (parentId = 0)
    const getTagsResponse = await authenticatedRequest.get('/pimcore-studio/api/tags?parentId=0');
    expect(getTagsResponse.status()).toBe(200);
    
    const tagsData = await getTagsResponse.json();
    expect(tagsData).toHaveProperty('items');
    expect(Array.isArray(tagsData.items)).toBe(true);
});
