import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let testFolderId: number;
const timestamp = Date.now();
const testFolderName = `do-grid-test-${timestamp}`;
const objectCount = 5;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    testFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        testFolderName,
        1,
        'data-object'
    );

    // Create objects for grid testing
    for (let i = 1; i <= objectCount; i++) {
        const createResponse = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
            data: { key: `grid-obj-${i}-${timestamp}`, classId: 'test_ATS', type: 'object' }
        });
        expect(createResponse.status()).toBe(200);
    }
});

test.afterAll(async () => {
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testFolderId, 'data-object');
    } catch (e) { /* ignore */ }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetAvailableColumns', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/data-object/grid/available-columns?classId=test_ATS&folderId=${testFolderId}`
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.columns).toBeDefined();
    expect(Array.isArray(data.columns)).toBe(true);
    expect(data.columns.length).toBeGreaterThan(0);

    // Verify column structure
    const firstColumn = data.columns[0];
    expect(firstColumn.key).toBeDefined();
    expect(firstColumn.type).toBeDefined();
    expect(typeof firstColumn.sortable).toBe('boolean');
    expect(typeof firstColumn.editable).toBe('boolean');
    expect(typeof firstColumn.localizable).toBe('boolean');
});

test('GetGridData', async () => {
    // First get available columns to use correct format
    const colResponse = await authenticatedRequest.get(
        `/pimcore-studio/api/data-object/grid/available-columns?classId=test_ATS&folderId=${testFolderId}`
    );
    expect(colResponse.status()).toBe(200);
    const colData = await colResponse.json();

    // Use first 3 system columns (id, fullpath, key)
    const columns = colData.columns.slice(0, 3);

    const response = await authenticatedRequest.post('/pimcore-studio/api/data-objects/grid/test_ATS', {
        data: {
            folderId: testFolderId,
            columns: columns,
            filters: {
                page: 1,
                pageSize: 50,
                includeDescendants: true
            }
        }
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.totalItems).toBe(objectCount);
    expect(data.items).toHaveLength(objectCount);

    // Verify grid row structure
    const firstItem = data.items[0];
    expect(firstItem.id).toBeDefined();
    expect(firstItem.columns).toBeDefined();
    expect(Array.isArray(firstItem.columns)).toBe(true);
});

test('GridPagination', async () => {
    // Get columns first
    const colResponse = await authenticatedRequest.get(
        `/pimcore-studio/api/data-object/grid/available-columns?classId=test_ATS&folderId=${testFolderId}`
    );
    const columns = (await colResponse.json()).columns.slice(0, 2);

    const page1 = await authenticatedRequest.post('/pimcore-studio/api/data-objects/grid/test_ATS', {
        data: {
            folderId: testFolderId,
            columns,
            filters: { page: 1, pageSize: 2, includeDescendants: true }
        }
    });
    expect(page1.status()).toBe(200);
    const page1Data = await page1.json();
    expect(page1Data.totalItems).toBe(objectCount);
    expect(page1Data.items).toHaveLength(2);

    const page2 = await authenticatedRequest.post('/pimcore-studio/api/data-objects/grid/test_ATS', {
        data: {
            folderId: testFolderId,
            columns,
            filters: { page: 2, pageSize: 2, includeDescendants: true }
        }
    });
    expect(page2.status()).toBe(200);
    const page2Data = await page2.json();
    expect(page2Data.items).toHaveLength(2);

    // Ensure different items
    const page1Ids = page1Data.items.map((i: any) => i.id);
    const page2Ids = page2Data.items.map((i: any) => i.id);
    expect(page1Ids.filter((id: number) => page2Ids.includes(id))).toHaveLength(0);
});

test('GridDirectChildrenOnly', async () => {
    const colResponse = await authenticatedRequest.get(
        `/pimcore-studio/api/data-object/grid/available-columns?classId=test_ATS&folderId=${testFolderId}`
    );
    const columns = (await colResponse.json()).columns.slice(0, 2);

    // With descendants
    const withDesc = await authenticatedRequest.post('/pimcore-studio/api/data-objects/grid/test_ATS', {
        data: {
            folderId: testFolderId,
            columns,
            filters: { page: 1, pageSize: 50, includeDescendants: true }
        }
    });
    expect(withDesc.status()).toBe(200);

    // Without descendants (direct children only)
    const directOnly = await authenticatedRequest.post('/pimcore-studio/api/data-objects/grid/test_ATS', {
        data: {
            folderId: testFolderId,
            columns,
            filters: { page: 1, pageSize: 50, includeDescendants: false }
        }
    });
    expect(directOnly.status()).toBe(200);

    const withData = await withDesc.json();
    const directData = await directOnly.json();
    expect(directData.totalItems).toBeLessThanOrEqual(withData.totalItems);
});

test('GetAvailableColumnsForFullClass', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/data-object/grid/available-columns?classId=test_ATF&folderId=${testFolderId}`
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.columns.length).toBeGreaterThan(0);
});
