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

test('Clone asset between folders', async () => {
    const timestamp = Date.now();
    const sourceFolderName = `source-folder-${timestamp}`;
    const targetFolderName = `target-folder-${timestamp}`;

    // Create source folder
    const sourceFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        sourceFolderName
    );

    // Create target folder
    const targetFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        targetFolderName
    );

    // Read the test image file
    const testImagePath = path.join(__dirname, './../assets', 'test_1.jpg');
    const testImageData = fs.readFileSync(testImagePath);
    
    // Upload the image asset to source folder
    const uploadResponse = await authenticatedRequest.post(`/pimcore-studio/api/assets/add/${sourceFolderId}`, {
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
    const originalAssetId = uploadData.id;
    expect(originalAssetId).toBeDefined();
    expect(typeof originalAssetId).toBe('number');

    // Clone the asset to target folder
    const cloneResponse = await authenticatedRequest.post(`/pimcore-studio/api/assets/${originalAssetId}/clone/${targetFolderId}`);
    expect(cloneResponse.status()).toBe(200);

    // Verify original asset still exists in source folder
    const originalAssetResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/${originalAssetId}`);
    expect(originalAssetResponse.status()).toBe(200);
    const originalAssetData = await originalAssetResponse.json();
    expect(originalAssetData.filename).toBe('test_1.jpg');
    expect(originalAssetData.parentId).toBe(sourceFolderId);

    // Get assets in target folder using tree API
    const targetFolderResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/tree?parentId=${targetFolderId}&page=1&pageSize=10`);
    
    expect(targetFolderResponse.status()).toBe(200);
    const targetFolderData = await targetFolderResponse.json();
    expect(targetFolderData.totalItems).toBe(1);
    
    const clonedAsset = targetFolderData.items[0];
    const clonedAssetId = clonedAsset.id;
    expect(clonedAssetId).toBeDefined();
    expect(clonedAssetId).not.toBe(originalAssetId); // Should be different ID

    // Verify cloned asset details
    const clonedAssetResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/${clonedAssetId}`);
    expect(clonedAssetResponse.status()).toBe(200);
    const clonedAssetData = await clonedAssetResponse.json();
    expect(clonedAssetData.filename).toBe('test_1.jpg');
    expect(clonedAssetData.parentId).toBe(targetFolderId);
    expect(clonedAssetData.type).toBe('image');

    // Verify cloned asset can be downloaded and has same content
    const clonedDownloadResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/${clonedAssetId}/download`);
    expect(clonedDownloadResponse.status()).toBe(200);
    const clonedDownloadData = await clonedDownloadResponse.body();

    // Compare cloned file with original
    expect(clonedDownloadData.length).toBe(testImageData.length);
    expect(Buffer.compare(clonedDownloadData, testImageData)).toBe(0);

    // Clean up: Delete both folders and their contents
    await FolderHelper.deleteFolder(authenticatedRequest, sourceFolderId);
    await FolderHelper.deleteFolder(authenticatedRequest, targetFolderId);
});
