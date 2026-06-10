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

test('Create ZIP file from folder and download', async () => {
    test.setTimeout(300000); // 5 minutes timeout for this test
    
    const timestamp = Date.now();
    const folderName = `zip-folder-test-${timestamp}`;

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

    // Upload second asset
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

    // Create ZIP export job from folder
    const zipExportResponse = await authenticatedRequest.post('/pimcore-studio/api/assets/export/zip/folder', {
        data: {
            folders: [folderId]
        }
    });

    expect(zipExportResponse.status()).toBe(201);
    const zipExportData = await zipExportResponse.json();
    expect(zipExportData.jobRunId).toBeDefined();
    expect(typeof zipExportData.jobRunId).toBe('number');

    // Wait for the ZIP job to complete
    let jobCompleted = false;
    let attempts = 0;
    console.log(`Waiting for ZIP export job ${zipExportData.jobRunId} to complete...`);
    while (!jobCompleted) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const jobStatusResponse = await authenticatedRequest.post('/pimcore-studio/api/execution-engine/running-jobs', {
            data: { filters: { page: 1, pageSize: 50 } }
        });
        expect(jobStatusResponse.status()).toBe(200);
        
        const jobData = await jobStatusResponse.json();
        const currentJob = jobData.items.find((job: any) => job.id === zipExportData.jobRunId);
        
        if (!currentJob) {
            // Job is no longer in running-jobs list — it already completed
            console.log(`Job ${zipExportData.jobRunId} not found in running jobs — assuming finished`);
            jobCompleted = true;
            break;
        }
        
        if (currentJob.state === 'finished') {
            jobCompleted = true;
        } else if (currentJob.state === 'failed' || currentJob.state === 'error') {
            throw new Error(`Job ${zipExportData.jobRunId} failed with state: ${currentJob.state}`);
        }
        
        attempts++;
        console.log(`Attempt ${attempts}: Job status is ${currentJob.state}`);
    }

    // Download the ZIP archive
    const zipDownloadResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/download/zip/${zipExportData.jobRunId}`);
    expect(zipDownloadResponse.status()).toBe(200);

    const contentType = zipDownloadResponse.headers()['content-type'];
    expect(contentType).toBe('application/zip');

    const contentDisposition = zipDownloadResponse.headers()['content-disposition'];
    expect(contentDisposition).toContain('attachment');

    const zipContent = await zipDownloadResponse.body();
    expect(zipContent.length).toBeGreaterThan(100);

    // Clean up
    await authenticatedRequest.delete(`/pimcore-studio/api/assets/download/zip/${zipExportData.jobRunId}`);
    await FolderHelper.deleteFolder(authenticatedRequest, folderId);
});
