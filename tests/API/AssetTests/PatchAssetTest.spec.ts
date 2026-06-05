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

test('Patch asset properties and verify integrity', async () => {
    const timestamp = Date.now();
    const folderName = `update-test-folder-${timestamp}`;

    // Create a folder to upload the image to
    const folderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        folderName
    );

    // Read the test image file
    const testImagePath = path.join(__dirname, './../assets', 'test_1.jpg');
    const testImageData = fs.readFileSync(testImagePath);
    
    // Upload the image asset
    const uploadResponse = await authenticatedRequest.post(`/pimcore-studio/api/assets/add/${folderId}`, {
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

    // Get the original asset to verify current state
    const originalAssetResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/${assetId}`);
    expect(originalAssetResponse.status()).toBe(200);
    const originalAssetData = await originalAssetResponse.json();
    expect(originalAssetData.filename).toBe('test_1.jpg');
    expect(originalAssetData.parentId).toBe(folderId);

    // Update asset using PATCH endpoint - only update supported fields
    const updateResponse = await authenticatedRequest.patch('/pimcore-studio/api/assets', {
        data: {
            data: [
                {
                    id: assetId,
                    parentId: folderId,
                    locked: null
                }
            ]
        }
    });
    
    // Debug the response if it's not 200
    if (updateResponse.status() !== 200) {
        console.log('Update response status:', updateResponse.status());
        console.log('Update response body:', await updateResponse.text());
    }
    
    expect(updateResponse.status()).toBe(200);
    
    // Handle empty response from PATCH endpoint
    let updatedAssetData;
    const responseText = await updateResponse.text();
    if (responseText.trim()) {
        updatedAssetData = JSON.parse(responseText);
    } else {
        // PATCH endpoint might return empty response, so we'll get the asset data separately
        const assetResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/${assetId}`);
        expect(assetResponse.status()).toBe(200);
        updatedAssetData = await assetResponse.json();
    }

    // Verify the asset was updated (the asset should still exist and be accessible)
    expect(updatedAssetData.id).toBe(assetId);
    expect(updatedAssetData.parentId).toBe(folderId);
    expect(updatedAssetData.filename).toBe('test_1.jpg');  // Original filename should be preserved

    // Get the updated asset to verify changes
    const verifyResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/${assetId}`);
    expect(verifyResponse.status()).toBe(200);
    const verifyData = await verifyResponse.json();
    
    // Verify asset details
    expect(verifyData.id).toBe(assetId);
    expect(verifyData.filename).toBe('test_1.jpg');
    expect(verifyData.parentId).toBe(folderId);

    // Verify the asset can still be downloaded after update
    const downloadResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/${assetId}/download`);
    expect(downloadResponse.status()).toBe(200);
    const downloadedData = await downloadResponse.body();
    expect(downloadedData.length).toBe(testImageData.length);
    expect(Buffer.compare(downloadedData, testImageData)).toBe(0);

    // Verify the asset filename in the download response
    const contentDisposition = downloadResponse.headers()['content-disposition'];
    if (contentDisposition) {
        expect(contentDisposition).toContain('test_1.jpg');
    }

    // Clean up: Delete the created folder and its contents
    await FolderHelper.deleteFolder(authenticatedRequest, folderId);
});
