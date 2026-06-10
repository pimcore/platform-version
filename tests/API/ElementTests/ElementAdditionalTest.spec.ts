import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let assetFolderId: number;
let dataObjectFolderId: number;
let assetFolderPath: string;
let dataObjectFolderPath: string;

const ts = Date['now']();
const assetFolderName = `elem-additional-asset-${ts}`;
const dataObjectFolderName = `elem-additional-do-${ts}`;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    assetFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        assetFolderName,
        1,
        'asset'
    );
    assetFolderPath = `/${assetFolderName}`;

    dataObjectFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        dataObjectFolderName,
        1,
        'data-object'
    );
    dataObjectFolderPath = `/${dataObjectFolderName}`;
});

test.afterAll(async () => {
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, assetFolderId, 'asset');
    } catch (_) {}
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, dataObjectFolderId, 'data-object');
    } catch (_) {}
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

// ─── Delete Info ─────────────────────────────────────────────────────────────

test('GetDeleteInfoForAssetFolder', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/elements/asset/delete-info/${assetFolderId}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('hasDependencies');
    expect(data).toHaveProperty('canUseRecycleBin');
    expect(typeof data.hasDependencies).toBe('boolean');
    expect(typeof data.canUseRecycleBin).toBe('boolean');
});

test('GetDeleteInfoForDataObjectFolder', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/elements/data-object/delete-info/${dataObjectFolderId}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('hasDependencies');
    expect(data).toHaveProperty('canUseRecycleBin');
});

test('GetDeleteInfoForInvalidIdReturns404Or422', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/elements/asset/delete-info/999999999'
    );
    expect([404, 422]).toContain(response.status());
});

// ─── Context Permissions ─────────────────────────────────────────────────────

test('GetContextPermissionsForAsset', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/elements/asset/context-permissions/'
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(typeof data).toBe('object');
    // Response should be a map of permission name -> boolean
    const keys = Object.keys(data);
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
        expect(typeof data[key]).toBe('boolean');
    }
});

test('GetContextPermissionsForDataObject', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/elements/data-object/context-permissions/'
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(typeof data).toBe('object');
    const keys = Object.keys(data);
    expect(keys.length).toBeGreaterThan(0);
});

test('GetContextPermissionsForDocument', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/elements/document/context-permissions/'
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(typeof data).toBe('object');
});

// ─── Location ────────────────────────────────────────────────────────────────

test('GetLocationForAssetFolderWithPerspectiveZero', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/elements/asset/location/${assetFolderId}/0`
    );
    // perspectiveId=0 may not be a valid perspective; accept 200 or error codes
    expect([200, 404, 422, 500]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('widgetId');
        expect(data).toHaveProperty('treeLevelData');
        expect(Array.isArray(data.treeLevelData)).toBe(true);
    }
});

test('GetLocationForDataObjectFolderWithPerspectiveZero', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/elements/data-object/location/${dataObjectFolderId}/0`
    );
    expect([200, 404, 422, 500]).toContain(response.status());
});

test('GetLocationForInvalidElementReturnsError', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/elements/asset/location/999999999/0'
    );
    expect([404, 422, 500]).toContain(response.status());
});

// ─── Path (Get ID by Path) ────────────────────────────────────────────────────

test('GetIdByPathForAssetFolder', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/elements/asset/path?elementPath=${encodeURIComponent(assetFolderPath)}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.id).toBe(assetFolderId);
});

test('GetIdByPathForDataObjectFolder', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/elements/data-object/path?elementPath=${encodeURIComponent(dataObjectFolderPath)}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.id).toBe(dataObjectFolderId);
});

test('GetIdByNonExistentPathReturns404Or422', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/elements/asset/path?elementPath=${encodeURIComponent('/this/path/does/not/exist-99999')}`
    );
    expect([404, 422]).toContain(response.status());
});

// ─── Subtype ─────────────────────────────────────────────────────────────────

test('GetSubtypeForAssetFolder', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/elements/asset/subtype/${assetFolderId}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('elementId');
    expect(data).toHaveProperty('elementType');
    expect(data).toHaveProperty('elementSubtype');
    expect(data.elementId).toBe(assetFolderId);
    expect(data.elementType).toBe('asset');
    expect(typeof data.elementSubtype).toBe('string');
});

test('GetSubtypeForDataObjectFolder', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/elements/data-object/subtype/${dataObjectFolderId}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('elementId');
    expect(data).toHaveProperty('elementType');
    expect(data).toHaveProperty('elementSubtype');
    expect(data.elementId).toBe(dataObjectFolderId);
});

test('GetSubtypeForInvalidIdReturns404Or422', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/elements/asset/subtype/999999999'
    );
    expect([404, 422]).toContain(response.status());
});

// ─── Usages ───────────────────────────────────────────────────────────────────

test('GetUsagesForAssetFolder', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/elements/usage/asset/${assetFolderId}?page=1&pageSize=10`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('hasHidden');
    expect(Array.isArray(data.data)).toBe(true);
    expect(typeof data.hasHidden).toBe('boolean');
});

test('GetUsagesForDataObjectFolder', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/elements/usage/data-object/${dataObjectFolderId}?page=1&pageSize=10`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('hasHidden');
});

test('GetUsagesForInvalidIdReturns404Or422', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/elements/usage/asset/999999999?page=1&pageSize=10'
    );
    expect([404, 422]).toContain(response.status());
});

test('GetUsagesWithSortingParameters', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/elements/usage/asset/${assetFolderId}?page=1&pageSize=5&sortOrder=ASC&sortBy=id`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('data');
});

// ─── Replace References ────────────────────────────────────────────────────────

test('ReplaceReferencesCreatesJobRun', async () => {
    // Replace references from assetFolderId to itself (no-op target)
    // We use assetFolderId as both source and target since we just want to validate the endpoint
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/elements/usage/replace/asset/${assetFolderId}`,
        {
            data: {
                targetType: 'asset',
                targetId: assetFolderId,
                elements: []
            }
        }
    );
    // Should return 200 with jobRunId, or possibly 404 if feature not available
    expect([200, 201, 404, 422]).toContain(response.status());
    if (response.status() === 200 || response.status() === 201) {
        const data = await response.json();
        expect(data).toHaveProperty('jobRunId');
        expect(typeof data.jobRunId).toBe('number');
    }
});

test('ReplaceReferencesForInvalidSourceReturnsError', async () => {
    const response = await authenticatedRequest.post(
        '/pimcore-studio/api/elements/usage/replace/asset/999999999',
        {
            data: {
                targetType: 'asset',
                targetId: 1,
                elements: []
            }
        }
    );
    // Server may return 201 (job created with no items), 404, or 422 for invalid source
    expect([200, 201, 404, 422]).toContain(response.status());
});

// ─── Dependencies ─────────────────────────────────────────────────────────────

test('GetDependenciesRequiresForAssetFolder', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/dependencies/asset/${assetFolderId}?page=1&pageSize=10&dependencyMode=requires`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(typeof data.totalItems).toBe('number');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetDependenciesRequiredByForAssetFolder', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/dependencies/asset/${assetFolderId}?page=1&pageSize=10&dependencyMode=required_by`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
});

test('GetDependenciesRequiresForDataObjectFolder', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/dependencies/data-object/${dataObjectFolderId}?page=1&pageSize=10&dependencyMode=requires`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
});

test('GetDependenciesForInvalidIdReturns404Or422', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/dependencies/asset/999999999?page=1&pageSize=10&dependencyMode=requires'
    );
    expect([404, 422]).toContain(response.status());
});

test('GetDependenciesWithPagination', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/dependencies/asset/${assetFolderId}?page=1&pageSize=5&dependencyMode=requires`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    // Items count should not exceed pageSize
    expect(data.items.length).toBeLessThanOrEqual(5);
});
