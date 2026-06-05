import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    await authenticatedRequest.dispose();
});

test('CreateGetUpdateDeleteTagLifecycle', async () => {
    const timestamp = Date.now();
    const initialTagName = `TestTag_${timestamp}`;
    const updatedTagName = `UpdatedTag_${timestamp}`;
    
    // Create a tag
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: 0,
            name: initialTagName
        }
    });
    
    expect(createResponse.status()).toBe(200);
    
    const createdTag = await createResponse.json();
    expect(createdTag).toHaveProperty('id');
    expect(createdTag).toHaveProperty('text', initialTagName);
    expect(createdTag).toHaveProperty('parentId', 0);
    
    const tagId = createdTag.id;
    
    // Get the tag by ID
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/tags/${tagId}`);
    
    expect(getResponse.status()).toBe(200);
    
    const retrievedTag = await getResponse.json();
    expect(retrievedTag).toHaveProperty('id', tagId);
    expect(retrievedTag).toHaveProperty('text', initialTagName);
    expect(retrievedTag).toHaveProperty('parentId', 0);
    expect(retrievedTag).toHaveProperty('hasChildren', false);
    
    // Update the tag
    const updateResponse = await authenticatedRequest.put(`/pimcore-studio/api/tags/${tagId}`, {
        data: {
            parentId: 0,
            name: updatedTagName
        }
    });
    
    expect(updateResponse.status()).toBe(200);
    
    const updatedTag = await updateResponse.json();
    expect(updatedTag).toHaveProperty('id', tagId);
    expect(updatedTag).toHaveProperty('text', updatedTagName);
    expect(updatedTag).toHaveProperty('parentId', 0);
    
    // Verify the update by getting the tag again
    const getUpdatedResponse = await authenticatedRequest.get(`/pimcore-studio/api/tags/${tagId}`);
    
    expect(getUpdatedResponse.status()).toBe(200);
    
    const verifyUpdatedTag = await getUpdatedResponse.json();
    expect(verifyUpdatedTag).toHaveProperty('text', updatedTagName);
    
    // Delete the tag
    const deleteResponse = await authenticatedRequest.delete(`/pimcore-studio/api/tags/${tagId}`);
    
    expect(deleteResponse.status()).toBe(200);
    
    // Check if response has content before trying to parse JSON
    const responseText = await deleteResponse.text();
    if (responseText.trim()) {
        const deleteResult = JSON.parse(responseText);
        expect(deleteResult).toHaveProperty('id', tagId);
    }
    
    // Verify the tag is deleted by trying to get it
    const getDeletedResponse = await authenticatedRequest.get(`/pimcore-studio/api/tags/${tagId}`);
    expect(getDeletedResponse.status()).toBe(404);
});

test('CreateParentAndChildThenUpdateChild', async () => {
    const timestamp = Date.now();
    const parentTagName = `ParentTag_${timestamp}`;
    const childTagName = `ChildTag_${timestamp}`;
    const updatedChildTagName = `UpdatedChildTag_${timestamp}`;
    
    // Create parent tag
    const createParentResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: 0,
            name: parentTagName
        }
    });
    
    expect(createParentResponse.status()).toBe(200);
    const parentTag = await createParentResponse.json();
    const parentId = parentTag.id;
    
    // Create child tag
    const createChildResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: parentId,
            name: childTagName
        }
    });
    
    expect(createChildResponse.status()).toBe(200);
    const childTag = await createChildResponse.json();
    const childId = childTag.id;
    
    // Update child tag name
    const updateChildResponse = await authenticatedRequest.put(`/pimcore-studio/api/tags/${childId}`, {
        data: {
            parentId: parentId,
            name: updatedChildTagName
        }
    });
    
    expect(updateChildResponse.status()).toBe(200);
    const updatedChild = await updateChildResponse.json();
    expect(updatedChild).toHaveProperty('text', updatedChildTagName);
    expect(updatedChild).toHaveProperty('parentId', parentId);
    
    // Cleanup
    await authenticatedRequest.delete(`/pimcore-studio/api/tags/${childId}`);
    await authenticatedRequest.delete(`/pimcore-studio/api/tags/${parentId}`);
});

test('MoveTagToNewParent', async () => {
    const timestamp = Date.now();
    const parent1Name = `Parent1_${timestamp}`;
    const parent2Name = `Parent2_${timestamp}`;
    const childName = `Child_${timestamp}`;
    
    // Create two parent tags
    const createParent1Response = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: 0,
            name: parent1Name
        }
    });
    
    expect(createParent1Response.status()).toBe(200);
    const parent1 = await createParent1Response.json();
    const parent1Id = parent1.id;
    
    const createParent2Response = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: 0,
            name: parent2Name
        }
    });
    
    expect(createParent2Response.status()).toBe(200);
    const parent2 = await createParent2Response.json();
    const parent2Id = parent2.id;
    
    // Create child under parent1
    const createChildResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: parent1Id,
            name: childName
        }
    });
    
    expect(createChildResponse.status()).toBe(200);
    const child = await createChildResponse.json();
    const childId = child.id;
    
    // Move child to parent2
    const moveChildResponse = await authenticatedRequest.put(`/pimcore-studio/api/tags/${childId}`, {
        data: {
            parentId: parent2Id,
            name: childName
        }
    });
    
    expect(moveChildResponse.status()).toBe(200);
    const movedChild = await moveChildResponse.json();
    expect(movedChild).toHaveProperty('parentId', parent2Id);
    
    // Cleanup
    await authenticatedRequest.delete(`/pimcore-studio/api/tags/${childId}`);
    await authenticatedRequest.delete(`/pimcore-studio/api/tags/${parent1Id}`);
    await authenticatedRequest.delete(`/pimcore-studio/api/tags/${parent2Id}`);
});

test('GetNonExistentTag', async () => {
    const nonExistentId = 999999;
    
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/tags/${nonExistentId}`);
    
    expect(getResponse.status()).toBe(404);
});

test('UpdateNonExistentTag', async () => {
    const nonExistentId = 999999;
    
    const updateResponse = await authenticatedRequest.put(`/pimcore-studio/api/tags/${nonExistentId}`, {
        data: {
            parentId: 0,
            name: 'Updated Non-Existent Tag'
        }
    });
    
    expect(updateResponse.status()).toBe(404);
});

test('DeleteNonExistentTag', async () => {
    const nonExistentId = 999999;
    
    const deleteResponse = await authenticatedRequest.delete(`/pimcore-studio/api/tags/${nonExistentId}`);
    
    expect(deleteResponse.status()).toBe(404);
});

test('UpdateTagWithInvalidParentId', async () => {
    const timestamp = Date.now();
    const tagName = `TestTagInvalidParent_${timestamp}`;
    
    // Create a tag
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: 0,
            name: tagName
        }
    });
    
    expect(createResponse.status()).toBe(200);
    const createdTag = await createResponse.json();
    const tagId = createdTag.id;
    
    // Try to update with invalid parent ID
    const updateResponse = await authenticatedRequest.put(`/pimcore-studio/api/tags/${tagId}`, {
        data: {
            parentId: 999999,
            name: tagName
        }
    });
    
    expect(updateResponse.status()).toBe(200);
    
    // Cleanup
    await authenticatedRequest.delete(`/pimcore-studio/api/tags/${tagId}`);
});

test('UpdateTagWithEmptyName', async () => {
    const timestamp = Date.now();
    const tagName = `TestTag_${timestamp}`;
    
    // Create a tag
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: 0,
            name: tagName
        }
    });
    
    expect(createResponse.status()).toBe(200);
    const createdTag = await createResponse.json();
    const tagId = createdTag.id;
    
    // Try to update with empty name
    const updateResponse = await authenticatedRequest.put(`/pimcore-studio/api/tags/${tagId}`, {
        data: {
            parentId: 0,
            name: ''
        }
    });
    
    expect(updateResponse.status()).toBe(500);
    
    // Cleanup
    await authenticatedRequest.delete(`/pimcore-studio/api/tags/${tagId}`);
});

test('UpdateTagWithNullName', async () => {
    const timestamp = Date.now();
    const tagName = `TestTag_${timestamp}`;
    
    // Create a tag
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: 0,
            name: tagName
        }
    });
    
    expect(createResponse.status()).toBe(200);
    const createdTag = await createResponse.json();
    const tagId = createdTag.id;
    
    // Try to update with null name
    const updateResponse = await authenticatedRequest.put(`/pimcore-studio/api/tags/${tagId}`, {
        data: {
            parentId: 0,
            name: null
        }
    });
    
    expect(updateResponse.status()).toBe(200);
    
    // Cleanup
    await authenticatedRequest.delete(`/pimcore-studio/api/tags/${tagId}`);
});

test('UpdateTagWithNullParentId', async () => {
    const timestamp = Date.now();
    const tagName = `TestTag_${timestamp}`;
    const updatedTagName = `UpdatedTag_${timestamp}`;
    
    // Create a tag
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: 0,
            name: tagName
        }
    });
    
    expect(createResponse.status()).toBe(200);
    const createdTag = await createResponse.json();
    const tagId = createdTag.id;
    
    // Update with null parent ID (should default to root)
    const updateResponse = await authenticatedRequest.put(`/pimcore-studio/api/tags/${tagId}`, {
        data: {
            parentId: null,
            name: updatedTagName
        }
    });
    
    expect(updateResponse.status()).toBe(200);
    const updatedTag = await updateResponse.json();
    expect(updatedTag).toHaveProperty('text', updatedTagName);
    expect(updatedTag).toHaveProperty('parentId', 0); // Should default to root
    
    // Cleanup
    await authenticatedRequest.delete(`/pimcore-studio/api/tags/${tagId}`);
});

test('GetTagWithInvalidIdFormat', async () => {
    const invalidId = 'invalid-id';
    
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/tags/${invalidId}`);
    
    expect(getResponse.status()).toBe(500);
});

test('UpdateTagWithInvalidIdFormat', async () => {
    const invalidId = 'invalid-id';
    
    const updateResponse = await authenticatedRequest.put(`/pimcore-studio/api/tags/${invalidId}`, {
        data: {
            parentId: 0,
            name: 'Test Tag'
        }
    });
    
    expect(updateResponse.status()).toBe(500);
});

test('DeleteTagWithInvalidIdFormat', async () => {
    const invalidId = 'invalid-id';
    
    const deleteResponse = await authenticatedRequest.delete(`/pimcore-studio/api/tags/${invalidId}`);
    
    expect(deleteResponse.status()).toBe(500);
});

test('DeleteTagWithChildrenShouldRemoveChildren', async () => {
    const timestamp = Date.now();
    const parentTagName = `ParentTag_${timestamp}`;
    const childTagName = `ChildTag_${timestamp}`;
    
    // Create parent tag
    const createParentResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: 0,
            name: parentTagName
        }
    });
    
    expect(createParentResponse.status()).toBe(200);
    const parentTag = await createParentResponse.json();
    const parentId = parentTag.id;
    
    // Create child tag
    const createChildResponse = await authenticatedRequest.post('/pimcore-studio/api/tag', {
        data: {
            parentId: parentId,
            name: childTagName
        }
    });
    
    expect(createChildResponse.status()).toBe(200);
    const childTag = await createChildResponse.json();
    const childId = childTag.id;
    
    // Delete parent tag (should also remove child)
    const deleteResponse = await authenticatedRequest.delete(`/pimcore-studio/api/tags/${parentId}`);
    
    expect(deleteResponse.status()).toBe(200);
    
    // Verify parent is deleted
    const getParentResponse = await authenticatedRequest.get(`/pimcore-studio/api/tags/${parentId}`);
    expect(getParentResponse.status()).toBe(404);
    
    // Verify child is also deleted
    const getChildResponse = await authenticatedRequest.get(`/pimcore-studio/api/tags/${childId}`);
    expect(getChildResponse.status()).toBe(404);
});
