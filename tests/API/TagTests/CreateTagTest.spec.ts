import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
let createdTags: number[] = [];

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    // Clean up created tags in reverse order (subtags first, then parent)
    for (let i = createdTags.length - 1; i >= 0; i--) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/tags/${createdTags[i]}`);
        } catch (error) {
            console.log(`Failed to delete tag ${createdTags[i]}: ${error}`);
        }
    }
    await authenticatedRequest.dispose();
});

test('CreateTagWithSubtags', async () => {
    // Create a parent tag
    const parentTagResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: 0,
            name: 'Parent Tag'
        }
    });
    
    expect(parentTagResponse.status()).toBe(200);
    
    const parentTag = await parentTagResponse.json();
    expect(parentTag).toHaveProperty('id');
    expect(parentTag).toHaveProperty('text', 'Parent Tag');
    expect(parentTag).toHaveProperty('parentId', 0);
    
    createdTags.push(parentTag.id);
    
    // Create first subtag
    const subtag1Response = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: parentTag.id,
            name: 'Subtag 1'
        }
    });
    
    expect(subtag1Response.status()).toBe(200);
    
    const subtag1 = await subtag1Response.json();
    expect(subtag1).toHaveProperty('id');
    expect(subtag1).toHaveProperty('text', 'Subtag 1');
    expect(subtag1).toHaveProperty('parentId', parentTag.id);
    
    createdTags.push(subtag1.id);
    
    // Create second subtag
    const subtag2Response = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: parentTag.id,
            name: 'Subtag 2'
        }
    });
    
    expect(subtag2Response.status()).toBe(200);
    
    const subtag2 = await subtag2Response.json();
    expect(subtag2).toHaveProperty('id');
    expect(subtag2).toHaveProperty('text', 'Subtag 2');
    expect(subtag2).toHaveProperty('parentId', parentTag.id);
    
    createdTags.push(subtag2.id);
    
    // Create a nested subtag under subtag1
    const nestedSubtagResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: subtag1.id,
            name: 'Nested Subtag'
        }
    });
    
    expect(nestedSubtagResponse.status()).toBe(200);
    
    const nestedSubtag = await nestedSubtagResponse.json();
    expect(nestedSubtag).toHaveProperty('id');
    expect(nestedSubtag).toHaveProperty('text', 'Nested Subtag');
    expect(nestedSubtag).toHaveProperty('parentId', subtag1.id);
    
    createdTags.push(nestedSubtag.id);
    
    // Verify the parent tag has children
    const parentTagVerifyResponse = await authenticatedRequest.get(`/pimcore-studio/api/tags/${parentTag.id}`);
    expect(parentTagVerifyResponse.status()).toBe(200);
    
    const parentTagData = await parentTagVerifyResponse.json();
    expect(parentTagData).toHaveProperty('hasChildren', true);
});

test('CreateTagWithRandomName', async () => {
    const timestamp = Date.now();
    const randomTagName = `TestTag_${timestamp}`;
    
    const tagResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: 0,
            name: randomTagName
        }
    });
    
    expect(tagResponse.status()).toBe(200);
    
    const tag = await tagResponse.json();
    expect(tag).toHaveProperty('id');
    expect(tag).toHaveProperty('text', randomTagName);
    expect(tag).toHaveProperty('parentId', 0);
    
    createdTags.push(tag.id);
});

test('CreateTagWithInvalidParentId', async () => {
    const invalidParentId = 999999;
    
    const tagResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: invalidParentId,
            name: 'Tag with Invalid Parent'
        }
    });
    
    expect(tagResponse.status()).toBe(422);
});

test('CreateTagWithEmptyName', async () => {
    const tagResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: 0,
            name: ''
        }
    });
    
    expect(tagResponse.status()).toBe(500);
});

test('CreateTagWithoutName', async () => {
    const tagResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: 0
        }
    });
    
    expect(tagResponse.status()).toBe(422);
});
