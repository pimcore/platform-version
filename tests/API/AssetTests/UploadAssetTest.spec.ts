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

test('Upload image asset with folder creation', async () => {
    const timestamp = Date.now();
    const folderName = `upload-test-folder-${timestamp}`;

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
    expect(uploadData.id).toBeDefined();
    expect(typeof uploadData.id).toBe('number');

    // Validate the uploaded asset exists
    const assetResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/${uploadData.id}`);
    expect(assetResponse.status()).toBe(200);
    const assetData = await assetResponse.json();
    expect(assetData.filename).toBe('test_1.jpg');
    expect(assetData.parentId).toBe(folderId);

    // Download the uploaded asset
    const downloadResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/${uploadData.id}/download`);
    expect(downloadResponse.status()).toBe(200);
    const downloadedData = await downloadResponse.body();

    // Compare original and downloaded file
    expect(downloadedData.length).toBe(testImageData.length);
    expect(Buffer.compare(downloadedData, testImageData)).toBe(0);

    // Check if preview is available for the image
    const previewResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/${uploadData.id}/image/stream/preview`);
    expect(previewResponse.status()).toBe(200);
    
    const previewData = await previewResponse.body();
    expect(previewData.length).toBeGreaterThan(0);
    
    // Verify preview content type is image
    const contentType = previewResponse.headers()['content-type'];
    expect(contentType).toMatch(/^image\//);

    // Clean up: Delete the created folder and its contents
    await FolderHelper.deleteFolder(authenticatedRequest, folderId);
});