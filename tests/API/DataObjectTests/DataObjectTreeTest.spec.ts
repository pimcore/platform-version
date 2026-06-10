import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let testFolderId: number;
const timestamp = Date.now();
const testFolderName = `do-tree-test-${timestamp}`;
const objectIds: number[] = [];

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    testFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        testFolderName,
        1,
        'data-object'
    );

    // Create 5 data objects in the folder for tree/pagination testing
    for (let i = 1; i <= 5; i++) {
        const createResponse = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
            data: { key: `tree-obj-${i}-${timestamp}`, classId: 'test_ATS', type: 'object' }
        });
        expect(createResponse.status()).toBe(200);
        const data = await createResponse.json();
        objectIds.push(data.id);
    }
});

test.afterAll(async () => {
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testFolderId, 'data-object');
    } catch (e) {
        // Ignore cleanup errors
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetTreeChildrenOfFolder', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/data-objects/tree?parentId=${testFolderId}&page=1&pageSize=50`
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.totalItems).toBe(5);
    expect(data.items).toHaveLength(5);

    // Verify each item has expected properties
    for (const item of data.items) {
        expect(item.id).toBeDefined();
        expect(item.parentId).toBe(testFolderId);
        expect(item.key).toBeDefined();
    }
});

test('TreePagination', async () => {
    // Request page 1 with small page size
    const page1Response = await authenticatedRequest.get(
        `/pimcore-studio/api/data-objects/tree?parentId=${testFolderId}&page=1&pageSize=2`
    );
    expect(page1Response.status()).toBe(200);
    const page1Data = await page1Response.json();
    expect(page1Data.totalItems).toBe(5);
    expect(page1Data.items).toHaveLength(2);

    // Request page 2
    const page2Response = await authenticatedRequest.get(
        `/pimcore-studio/api/data-objects/tree?parentId=${testFolderId}&page=2&pageSize=2`
    );
    expect(page2Response.status()).toBe(200);
    const page2Data = await page2Response.json();
    expect(page2Data.totalItems).toBe(5);
    expect(page2Data.items).toHaveLength(2);

    // Request page 3 (should have 1 item)
    const page3Response = await authenticatedRequest.get(
        `/pimcore-studio/api/data-objects/tree?parentId=${testFolderId}&page=3&pageSize=2`
    );
    expect(page3Response.status()).toBe(200);
    const page3Data = await page3Response.json();
    expect(page3Data.totalItems).toBe(5);
    expect(page3Data.items).toHaveLength(1);

    // Ensure different items on each page
    const page1Ids = page1Data.items.map((i: any) => i.id);
    const page2Ids = page2Data.items.map((i: any) => i.id);
    const overlap = page1Ids.filter((id: number) => page2Ids.includes(id));
    expect(overlap).toHaveLength(0);
});

test('TreeFilterByClassName', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/data-objects/tree?parentId=${testFolderId}&page=1&pageSize=50&className=automaticTestSimple`
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.totalItems).toBe(5);
});

test('TreeWithRootParent', async () => {
    // Get tree from root (parentId=1) — should contain at least our test folder
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/data-objects/tree?parentId=1&page=1&pageSize=100'
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.totalItems).toBeGreaterThan(0);
    expect(data.items.length).toBeGreaterThan(0);

    // Our test folder should be among children
    const testFolder = data.items.find((i: any) => i.key === testFolderName);
    expect(testFolder).toBeDefined();
    expect(testFolder.id).toBe(testFolderId);
});

test('TreeWithInvalidParentId', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/data-objects/tree?parentId=999999&page=1&pageSize=10'
    );
    expect([404, 500]).toContain(response.status());
});
