import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';
import * as fs from 'fs';
import * as path from 'path';

let authenticatedRequest: APIRequestContext;
let testFolderId: number;
let testImageId: number;
let versionId: number;
const ts = Date['now']();

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    // Create a dedicated folder for version tests
    testFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        `version-test-${ts}`,
        1,
        'asset'
    );

    // Upload a small PNG image to use as the test asset
    const testImagePath = path.join(__dirname, './../assets', 'Aston_Martin_Logo_2018.png');
    const testImageData = fs.readFileSync(testImagePath);

    const uploadResponse = await authenticatedRequest.post(`/pimcore-studio/api/assets/add/${testFolderId}`, {
        multipart: {
            file: {
                name: `version-test-img-${ts}.png`,
                mimeType: 'image/png',
                buffer: testImageData
            }
        }
    });
    expect(uploadResponse.status()).toBe(200);
    const uploadData = await uploadResponse.json();
    testImageId = uploadData.id;
    expect(typeof testImageId).toBe('number');

    // Save a version via PUT with task: 'version'
    const saveVersionResponse = await authenticatedRequest.put(`/pimcore-studio/api/assets/${testImageId}`, {
        data: {
            data: { task: 'version' }
        }
    });
    expect([200, 201]).toContain(saveVersionResponse.status());

    // List versions and retrieve the first version ID
    const listResponse = await authenticatedRequest.get(
        `/pimcore-studio/api/versions/asset/${testImageId}?page=1&pageSize=10`
    );
    expect(listResponse.status()).toBe(200);
    const listData = await listResponse.json();
    expect(listData).toHaveProperty('items');
    expect(Array.isArray(listData.items)).toBe(true);
    expect(listData.items.length).toBeGreaterThan(0);
    versionId = listData.items[0].id;
    expect(typeof versionId).toBe('number');
});

test.afterAll(async () => {
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testFolderId, 'asset');
    } catch (_) {}
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

// --- GET /versions/{elementType}/{id} ---

test('ListVersionsForAssetElement', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/versions/asset/${testImageId}?page=1&pageSize=10`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(typeof data.totalItems).toBe('number');
    expect(Array.isArray(data.items)).toBe(true);
    // Verify version item shape
    if (data.items.length > 0) {
        const item = data.items[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('cid');
        expect(item).toHaveProperty('ctype');
        expect(item).toHaveProperty('date');
    }
});

test('ListVersionsForAssetPaginationSecondPage', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/versions/asset/${testImageId}?page=2&pageSize=1`
    );
    // Second page might be empty but request should be valid
    expect([200, 422]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
    }
});

test('ListVersionsForNonExistentElement', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/versions/asset/999999?page=1&pageSize=10'
    );
    expect([404, 422]).toContain(response.status());
});

test('ListVersionsForDataObjectElement', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/versions/data-object/1?page=1&pageSize=10`
    );
    // Element 1 may or may not be a data-object, accept also 404
    expect([200, 404, 422]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
        expect(data).toHaveProperty('totalItems');
    }
});

test('ListVersionsForDocumentElement', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/versions/document/1?page=1&pageSize=10`
    );
    expect([200, 404, 422]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
        expect(data).toHaveProperty('totalItems');
    }
});

// --- GET /versions/{id} ---

test('GetVersionById', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/versions/${versionId}`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    // Response is one of AssetVersion, DataObjectVersion or DocumentVersion
    expect(data).toBeDefined();
});

test('GetVersionByInvalidId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/versions/999999');
    expect([404, 422]).toContain(response.status());
});

// --- PUT /versions/{id} ---

test('UpdateVersionMetadataNote', async () => {
    const response = await authenticatedRequest.put(`/pimcore-studio/api/versions/${versionId}`, {
        data: {
            note: `test-note-${ts}`,
            public: false
        }
    });
    expect(response.status()).toBe(200);
});

test('UpdateVersionMetadataPublic', async () => {
    const response = await authenticatedRequest.put(`/pimcore-studio/api/versions/${versionId}`, {
        data: {
            public: true,
            note: null
        }
    });
    expect(response.status()).toBe(200);

    // Restore to non-public
    const restoreResponse = await authenticatedRequest.put(`/pimcore-studio/api/versions/${versionId}`, {
        data: {
            public: false,
            note: null
        }
    });
    expect(restoreResponse.status()).toBe(200);
});

test('UpdateVersionWithInvalidId', async () => {
    const response = await authenticatedRequest.put('/pimcore-studio/api/versions/999999', {
        data: {
            note: 'should-not-exist',
            public: false
        }
    });
    expect([404, 422]).toContain(response.status());
});

// --- POST /versions/{id} (publish) ---

test('PublishVersion', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/versions/${versionId}`);
    expect([200, 422]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(typeof data.id).toBe('number');
    }
});

test('PublishVersionWithInvalidId', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/versions/999999');
    expect([404, 422]).toContain(response.status());
});

// --- GET /versions/{id}/asset/download ---

test('DownloadAssetVersionBinary', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/versions/${versionId}/asset/download`);
    expect([200, 404, 422]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.body();
        expect(body.length).toBeGreaterThan(0);
    }
});

test('DownloadAssetVersionBinaryInvalidId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/versions/999999/asset/download');
    expect([404, 422]).toContain(response.status());
});

// --- GET /versions/{id}/image/stream ---

test('StreamImageVersionThumbnail', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/versions/${versionId}/image/stream`);
    expect([200, 404, 422]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.body();
        expect(body.length).toBeGreaterThan(0);
    }
});

test('StreamImageVersionThumbnailInvalidId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/versions/999999/image/stream');
    expect([404, 422]).toContain(response.status());
});

// --- GET /versions/{id}/pdf/stream ---

test('StreamPdfVersion', async () => {
    // This is a non-PDF asset version — accept 200, 404, or 422
    const response = await authenticatedRequest.get(`/pimcore-studio/api/versions/${versionId}/pdf/stream`);
    expect([200, 404, 422]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.body();
        expect(body.length).toBeGreaterThan(0);
    }
});

test('StreamPdfVersionInvalidId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/versions/999999/pdf/stream');
    expect([404, 422]).toContain(response.status());
});

// --- DELETE /versions/{id} ---

test('DeleteVersionById', async () => {
    // Create a fresh version to delete so subsequent tests are unaffected
    const saveVersionResponse = await authenticatedRequest.put(`/pimcore-studio/api/assets/${testImageId}`, {
        data: {
            data: { task: 'version' }
        }
    });
    expect([200, 201]).toContain(saveVersionResponse.status());

    // Fetch the latest version list and pick the newest one
    const listResponse = await authenticatedRequest.get(
        `/pimcore-studio/api/versions/asset/${testImageId}?page=1&pageSize=10`
    );
    expect(listResponse.status()).toBe(200);
    const listData = await listResponse.json();
    expect(listData.items.length).toBeGreaterThan(0);
    const deleteTargetId: number = listData.items[0].id;

    const deleteResponse = await authenticatedRequest.delete(`/pimcore-studio/api/versions/${deleteTargetId}`);
    expect(deleteResponse.status()).toBe(200);

    // Verify it is gone
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/versions/${deleteTargetId}`);
    expect([404, 422]).toContain(getResponse.status());
});

test('DeleteVersionByInvalidId', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/versions/999999');
    expect([404, 422]).toContain(response.status());
});

// --- DELETE /versions/{elementType}/{id} (cleanup ALL versions) ---

test('CleanupAllVersionsForAssetElement', async () => {
    // Create a second asset in the same folder to use for cleanup so the
    // primary testImageId / versionId remain intact for any remaining tests.
    const testImagePath = path.join(__dirname, './../assets', 'Aston_Martin_Logo_2018.png');
    const testImageData = fs.readFileSync(testImagePath);

    const uploadResponse = await authenticatedRequest.post(`/pimcore-studio/api/assets/add/${testFolderId}`, {
        multipart: {
            file: {
                name: `version-cleanup-img-${ts}.png`,
                mimeType: 'image/png',
                buffer: testImageData
            }
        }
    });
    expect(uploadResponse.status()).toBe(200);
    const cleanupAssetId: number = (await uploadResponse.json()).id;

    // Save a version for this asset
    const saveVersionResponse = await authenticatedRequest.put(`/pimcore-studio/api/assets/${cleanupAssetId}`, {
        data: {
            data: { task: 'version' }
        }
    });
    expect([200, 201]).toContain(saveVersionResponse.status());

    // Now call the cleanup endpoint
    const cleanupResponse = await authenticatedRequest.delete(
        `/pimcore-studio/api/versions/asset/${cleanupAssetId}`
    );
    expect(cleanupResponse.status()).toBe(200);
    const cleanupData = await cleanupResponse.json();
    expect(cleanupData).toHaveProperty('ids');
    expect(Array.isArray(cleanupData.ids)).toBe(true);

    // Verify versions were reduced (cleanup keeps at most the current version)
    const listAfterResponse = await authenticatedRequest.get(
        `/pimcore-studio/api/versions/asset/${cleanupAssetId}?page=1&pageSize=10`
    );
    expect(listAfterResponse.status()).toBe(200);
    const listAfterData = await listAfterResponse.json();
    // Cleanup removes old/redundant versions; at most 1 may remain (the current version)
    expect(listAfterData.totalItems).toBeLessThanOrEqual(1);
});

test('CleanupAllVersionsForNonExistentElement', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/versions/asset/999999');
    expect([404, 422]).toContain(response.status());
});
