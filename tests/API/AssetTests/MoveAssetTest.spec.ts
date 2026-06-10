import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';
import * as fs from 'fs';
import * as path from 'path';

let authenticatedRequest: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('Upload asset and move to another folder', async () => {
    const timestamp = Date.now();
    const folder1Name = `upload-folder-${timestamp}`;
    const folder2Name = `target-folder-${timestamp}`;

    // Create both folders and get their IDs
    const [folder1Id, folder2Id] = await FolderHelper.createFoldersAndGetIds(
        authenticatedRequest,
        [folder1Name, folder2Name]
    );

    // Read the test image file
    const testImagePath = path.join(__dirname, './../assets', 'test_1.jpg');
    const testImageData = fs.readFileSync(testImagePath);

    // Upload the image asset to folder1
    const uploadResponse = await authenticatedRequest.post(`/pimcore-studio/api/assets/add/${folder1Id}`, {
        multipart: {
            file: {
                name: 'test_1.jpg',
                mimeType: 'image/jpeg',
                buffer: testImageData
            }
        }
    });
    expect(uploadResponse.status()).toBe(200);

    const uploadData = await uploadResponse.json();
    const assetId = uploadData.id;
    expect(assetId).toBeDefined();
    expect(typeof assetId).toBe('number');

    // Validate asset is in folder1
    const assetResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/${assetId}`);
    expect(assetResponse.status()).toBe(200);
    const assetData = await assetResponse.json();
    expect(assetData.filename).toBe('test_1.jpg');
    expect(assetData.parentId).toBe(folder1Id);

    // Move asset from folder1 to folder2
    const moveResponse = await authenticatedRequest.patch('/pimcore-studio/api/assets', {
        data: {
            data: [{
                id: assetId,
                parentId: folder2Id
            }]
        }
    });
    expect(moveResponse.status()).toBe(200);

    // Validate asset is now in folder2
    const movedAssetResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/${assetId}`);
    expect(movedAssetResponse.status()).toBe(200);
    const movedAssetData = await movedAssetResponse.json();
    expect(movedAssetData.filename).toBe('test_1.jpg');
    expect(movedAssetData.parentId).toBe(folder2Id);

    // Validate asset can still be downloaded after move
    const downloadResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/${assetId}/download`);
    expect(downloadResponse.status()).toBe(200);
    const downloadedData = await downloadResponse.body();
    expect(Buffer.compare(downloadedData, testImageData)).toBe(0);

    // Clean up: Delete both folders and their contents
    await FolderHelper.deleteFolders(authenticatedRequest, [folder1Id, folder2Id]);
});