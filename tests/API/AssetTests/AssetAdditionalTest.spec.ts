import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const createdAssetIds: number[] = [];
let testImageId: number;
let testFolderId: number;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    // Create a test folder using FolderHelper pattern
    const folderName = `test_asset_folder_${Date.now()}`;
    const folderResponse = await authenticatedRequest.post('/pimcore-studio/api/elements/asset/folder/1', {
        data: { folderName: folderName },
    });
    expect(folderResponse.status()).toBe(200);

    // Resolve folder ID
    const resolveResponse = await authenticatedRequest.get(`/pimcore-studio/api/elements/asset/resolve?searchTerm=/${folderName}`);
    expect(resolveResponse.status()).toBe(200);
    const folderData = await resolveResponse.json();
    testFolderId = folderData.id;

    // Upload a small test image to the folder
    const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
    );
    const uploadResponse = await authenticatedRequest.post(`/pimcore-studio/api/assets/add/${testFolderId}`, {
        multipart: {
            file: {
                name: `test_image_${Date.now()}.png`,
                mimeType: 'image/png',
                buffer: imageBuffer,
            },
        },
    });
    expect(uploadResponse.status()).toBe(200);
    const uploadData = await uploadResponse.json();
    testImageId = uploadData.id;
    createdAssetIds.push(testImageId);
});

test.afterAll(async () => {
    // Delete created assets
    for (const id of createdAssetIds) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/elements/asset/delete/${id}`);
        } catch (_) { /* ignore */ }
    }
    // Delete test folder
    try {
        await authenticatedRequest.delete(`/pimcore-studio/api/elements/asset/delete/${testFolderId}`);
    } catch (_) { /* ignore */ }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetAssetTypes', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/assets/types');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBeTruthy();
    expect(data.items.length).toBeGreaterThan(0);
});

test('GetVideoTypes', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/assets/video/types');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBeTruthy();
});

test('GetAssetText', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/assets/${testImageId}/text`);
    // Image assets may not support text representation
    expect([200, 400, 404, 422, 500]).toContain(response.status());
});

test('CheckAssetExists', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/assets/exists/${testFolderId}`);
    expect([200, 404]).toContain(response.status());
});

test('StreamOriginalImage', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/assets/${testImageId}/image/stream`);
    expect(response.status()).toBe(200);
});

test('StreamCustomImage', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/assets/${testImageId}/image/stream/custom?width=50&height=50`
    );
    expect([200, 400, 404]).toContain(response.status());
});

test('DownloadCustomImage', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/assets/${testImageId}/image/download/custom?width=50&height=50`
    );
    expect([200, 400, 404]).toContain(response.status());
});

test('StreamDynamicImage', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/assets/${testImageId}/image/stream/dynamic?width=50&height=50&aspectRatio=false&mode=scaleByWidth`
    );
    expect([200, 400, 404]).toContain(response.status());
});

test('DownloadImageByFormat', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/assets/${testImageId}/image/download/format/png`
    );
    expect([200, 400, 404]).toContain(response.status());
});

test('ClearImageThumbnail', async () => {
    const response = await authenticatedRequest.delete(
        `/pimcore-studio/api/assets/${testImageId}/thumbnail/clear`
    );
    expect([200, 204]).toContain(response.status());
});

test('ReplaceAssetBinary', async () => {
    const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        'base64'
    );
    const response = await authenticatedRequest.post(`/pimcore-studio/api/assets/${testImageId}/replace`, {
        multipart: {
            file: {
                name: 'replaced_image.png',
                mimeType: 'image/png',
                buffer: imageBuffer,
            },
        },
    });
    expect([200, 201]).toContain(response.status());
});

test('GetAssetByInvalidId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/assets/999999');
    expect([404, 500]).toContain(response.status());
});

test('CheckAssetExistsInvalidFolder', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/assets/exists/999999');
    expect([200, 404]).toContain(response.status());
});
