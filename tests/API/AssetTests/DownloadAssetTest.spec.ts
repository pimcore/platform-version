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

test('Download asset from folder', async () => {
    const timestamp = Date.now();
    const folderName = `download-test-folder-${timestamp}`;

    // Create folder
    const folderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        folderName
    );

    // Read the test image file
    const testImagePath = path.join(__dirname, './../assets', 'test_1.jpg');
    const testImageData = fs.readFileSync(testImagePath);
    
    // Upload the image asset to folder
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

    // Download the asset
    const downloadResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/${assetId}/download`);
    expect(downloadResponse.status()).toBe(200);

    // Verify the downloaded content
    const downloadedData = await downloadResponse.body();
    expect(downloadedData).toBeDefined();
    expect(downloadedData.length).toBeGreaterThan(0);

    // Verify the downloaded file matches the original
    expect(downloadedData.length).toBe(testImageData.length);
    expect(Buffer.compare(downloadedData, testImageData)).toBe(0);

    // Verify Content-Disposition header
    const contentDisposition = downloadResponse.headers()['content-disposition'];
    expect(contentDisposition).toBeDefined();
    expect(contentDisposition).toContain('attachment');
    expect(contentDisposition).toContain('test_1.jpg');

    // Clean up: Delete the folder and its contents
    await FolderHelper.deleteFolder(authenticatedRequest, folderId);
});
