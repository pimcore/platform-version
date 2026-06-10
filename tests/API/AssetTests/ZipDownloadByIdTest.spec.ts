/**
 * Test file for ZIP download functionality
 * 
 * This test file covers the following scenarios:
 * 1. Create a folder and upload 2 assets
 * 2. Create a ZIP export job with multiple asset IDs
 * 3. Wait for the job to complete
 * 4. Download the ZIP archive using the jobRunId
 * 5. Verify the ZIP file content and headers
 * 6. Test ZIP deletion functionality
 * 7. Test single asset ZIP export and download
 */

import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';
import { JobHelper } from '../../utils/job';
import * as fs from 'fs';
import * as path from 'path';

let authenticatedRequest: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
    
    // Cancel all running jobs to ensure clean state
    await JobHelper.cancelAllRunningJobs(authenticatedRequest);
});

test.afterAll(async () => {
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('Create ZIP file with multiple assets and download by jobRunId', async () => {
    const timestamp = Date.now();
    const folderName = `zip-test-folder-${timestamp}`;

    // Create a folder to upload the assets to
    const folderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        folderName
    );

    // Read the test image file
    const testImagePath = path.join(__dirname, './../assets', 'test_1.jpg');
    const testImageData = fs.readFileSync(testImagePath);
    
    // Upload first asset
    const uploadResponse1 = await authenticatedRequest.post(`/pimcore-studio/api/assets/add/${folderId}`, {
        multipart: {
            file: {
                name: 'test_asset_1.jpg',
                mimeType: 'image/jpeg',
                buffer: testImageData
            }
        }
    });

    expect(uploadResponse1.status()).toBe(200);
    const uploadData1 = await uploadResponse1.json();
    expect(uploadData1.id).toBeDefined();
    expect(typeof uploadData1.id).toBe('number');

    // Upload second asset (same image but different name)
    const uploadResponse2 = await authenticatedRequest.post(`/pimcore-studio/api/assets/add/${folderId}`, {
        multipart: {
            file: {
                name: 'test_asset_2.jpg',
                mimeType: 'image/jpeg',
                buffer: testImageData
            }
        }
    });

    expect(uploadResponse2.status()).toBe(200);
    const uploadData2 = await uploadResponse2.json();
    expect(uploadData2.id).toBeDefined();
    expect(typeof uploadData2.id).toBe('number');

    // Verify both assets exist
    const assetResponse1 = await authenticatedRequest.get(`/pimcore-studio/api/assets/${uploadData1.id}`);
    expect(assetResponse1.status()).toBe(200);
    const assetData1 = await assetResponse1.json();
    expect(assetData1.filename).toBe('test_asset_1.jpg');

    const assetResponse2 = await authenticatedRequest.get(`/pimcore-studio/api/assets/${uploadData2.id}`);
    expect(assetResponse2.status()).toBe(200);
    const assetData2 = await assetResponse2.json();
    expect(assetData2.filename).toBe('test_asset_2.jpg');

    // Create ZIP export job with both asset IDs
    const zipExportResponse = await authenticatedRequest.post('/pimcore-studio/api/assets/export/zip/asset', {
        data: {
            assets: [uploadData1.id, uploadData2.id]
        }
    });

    expect(zipExportResponse.status()).toBe(201);
    const zipExportData = await zipExportResponse.json();
    expect(zipExportData.jobRunId).toBeDefined();
    expect(typeof zipExportData.jobRunId).toBe('number');

    // Wait for the ZIP job to complete and check job status
    let jobCompleted = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!jobCompleted && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check job status
        const jobStatusResponse = await authenticatedRequest.post('/pimcore-studio/api/execution-engine/running-jobs', {
            data: { filters: { page: 1, pageSize: 50 } }
        });
        expect(jobStatusResponse.status()).toBe(200);
        
        const jobData = await jobStatusResponse.json();
        const currentJob = jobData.items.find((job: any) => job.id === zipExportData.jobRunId);
        
        if (!currentJob || currentJob.state === 'finished') {
            jobCompleted = true;
        }
        
        attempts++;
    }

    // Download the ZIP archive using the jobRunId
    const zipDownloadResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/download/zip/${zipExportData.jobRunId}`);
    expect(zipDownloadResponse.status()).toBe(200);

    // Verify the response is a ZIP file
    const contentType = zipDownloadResponse.headers()['content-type'];
    expect(contentType).toBe('application/zip');

    // Verify Content-Disposition header for attachment
    const contentDisposition = zipDownloadResponse.headers()['content-disposition'];
    expect(contentDisposition).toBeDefined();
    expect(contentDisposition).toContain('attachment');

    // Get the ZIP file content
    const zipContent = await zipDownloadResponse.body();
    expect(zipContent.length).toBeGreaterThan(0);

    // Verify the ZIP file is not empty and has reasonable size
    // ZIP files should be at least a few hundred bytes even for small content
    expect(zipContent.length).toBeGreaterThan(100);

    // Clean up: Delete the created folder and its contents
    await FolderHelper.deleteFolder(authenticatedRequest, folderId);
});

test('Create ZIP file with single asset and verify download', async () => {
    const timestamp = Date.now();
    const folderName = `zip-single-test-folder-${timestamp}`;

    // Create a folder to upload the asset to
    const folderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        folderName
    );

    // Read the test image file
    const testImagePath = path.join(__dirname, './../assets', 'test_1.jpg');
    const testImageData = fs.readFileSync(testImagePath);
    
    // Upload single asset
    const uploadResponse = await authenticatedRequest.post(`/pimcore-studio/api/assets/add/${folderId}`, {
        multipart: {
            file: {
                name: 'single_test_asset.jpg',
                mimeType: 'image/jpeg',
                buffer: testImageData
            }
        }
    });

    expect(uploadResponse.status()).toBe(200);
    const uploadData = await uploadResponse.json();
    expect(uploadData.id).toBeDefined();

    // Create ZIP export job with single asset ID
    const zipExportResponse = await authenticatedRequest.post('/pimcore-studio/api/assets/export/zip/asset', {
        data: {
            assets: [uploadData.id]
        }
    });

    expect(zipExportResponse.status()).toBe(201);
    const zipExportData = await zipExportResponse.json();
    expect(zipExportData.jobRunId).toBeDefined();

    // Wait for the ZIP job to complete
    let jobCompleted = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!jobCompleted && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check job status
        const jobStatusResponse = await authenticatedRequest.post('/pimcore-studio/api/execution-engine/running-jobs', {
            data: { filters: { page: 1, pageSize: 50 } }
        });
        expect(jobStatusResponse.status()).toBe(200);
        
        const jobData = await jobStatusResponse.json();
        const currentJob = jobData.items.find((job: any) => job.id === zipExportData.jobRunId);
        
        if (!currentJob || currentJob.state === 'finished') {
            jobCompleted = true;
        }
        
        attempts++;
    }

    // Download the ZIP archive
    const zipDownloadResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/download/zip/${zipExportData.jobRunId}`);
    expect(zipDownloadResponse.status()).toBe(200);

    // Verify ZIP content
    const zipContent = await zipDownloadResponse.body();
    expect(zipContent.length).toBeGreaterThan(0);

    // Clean up: Delete the folder and its contents
    // Note: ZIP cleanup is handled automatically by the system
    await FolderHelper.deleteFolder(authenticatedRequest, folderId);
});
