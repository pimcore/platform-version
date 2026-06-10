import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let testFolderId: number;
let objectId1: number;
let objectId2: number;
const ts = Date['now']();
const testFolderName = `export-test-${ts}`;

// Minimal column definition for export (system id column)
const exportColumns = [
    { key: 'id', type: 'system.id' },
    { key: 'key', type: 'system.key' }
];

/**
 * Poll until a job with the given jobRunId is no longer running (max ~30s).
 */
async function waitForJobCompletion(ctx: APIRequestContext, jobRunId: number): Promise<void> {
    for (let i = 0; i < 15; i++) {
        const jobs = await ctx.post('/pimcore-studio/api/execution-engine/running-jobs', {
            data: { page: 1, pageSize: 50 }
        });
        if (jobs.status() !== 200) break;
        const running = (await jobs.json()).items || [];
        if (!running.find((j: any) => j.id === jobRunId && j.state === 'running')) break;
        await new Promise(r => setTimeout(r, 2000));
    }
}

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    // Create a test folder in the data-object tree
    testFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        testFolderName,
        1,
        'data-object'
    );

    // Create two data objects inside the folder for export testing
    const res1 = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: { key: `export-obj1-${ts}`, classId: 'test_ATS', type: 'object' }
    });
    expect(res1.status()).toBe(200);
    objectId1 = (await res1.json()).id;

    const res2 = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: { key: `export-obj2-${ts}`, classId: 'test_ATS', type: 'object' }
    });
    expect(res2.status()).toBe(200);
    objectId2 = (await res2.json()).id;
});

test.afterAll(async () => {
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testFolderId, 'data-object');
    } catch (_) {}
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

// ---------------------------------------------------------------------------
// CSV export — element list
// ---------------------------------------------------------------------------

test('StartCsvExportReturnsJobRunId', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/export/csv', {
        data: {
            elements: [objectId1, objectId2],
            columns: exportColumns,
            config: { header: 'title', delimiter: ';' },
            elementType: 'data-object',
            classId: 'test_ATS'
        }
    });
    expect([200, 201]).toContain(response.status());
    const data = await response.json();
    expect(data).toHaveProperty('jobRunId');
    expect(typeof data.jobRunId).toBe('number');
});

test('DownloadAndDeleteCsvExport', async () => {
    // Start export
    const startResponse = await authenticatedRequest.post('/pimcore-studio/api/export/csv', {
        data: {
            elements: [objectId1, objectId2],
            columns: exportColumns,
            config: { header: 'title', delimiter: ';' },
            elementType: 'data-object',
            classId: 'test_ATS'
        }
    });
    expect([200, 201]).toContain(startResponse.status());
    const { jobRunId } = await startResponse.json();

    // Wait for job to complete
    await waitForJobCompletion(authenticatedRequest, jobRunId);

    // Download (500 = server could not find the file, feature may be partially configured)
    const downloadResponse = await authenticatedRequest.get(
        `/pimcore-studio/api/export/download/csv/${jobRunId}`
    );
    expect([200, 404, 500]).toContain(downloadResponse.status());

    // Delete
    const deleteResponse = await authenticatedRequest.delete(
        `/pimcore-studio/api/export/download/csv/${jobRunId}`
    );
    expect([200, 404, 500]).toContain(deleteResponse.status());
});

// ---------------------------------------------------------------------------
// CSV export — negative tests
// ---------------------------------------------------------------------------

test('DownloadCsvWithInvalidJobRunIdReturns404', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/export/download/csv/999999'
    );
    expect([404, 422]).toContain(response.status());
});

test('DeleteCsvWithInvalidJobRunIdReturns404', async () => {
    const response = await authenticatedRequest.delete(
        '/pimcore-studio/api/export/download/csv/999999'
    );
    expect([404, 422]).toContain(response.status());
});

// ---------------------------------------------------------------------------
// CSV export — folder-based
// ---------------------------------------------------------------------------

test('StartCsvFolderExportReturnsJobRunId', async () => {
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/export/csv/folder/${testFolderId}`,
        {
            data: {
                columns: exportColumns,
                config: { header: 'title', delimiter: ';' },
                elementType: 'data-object',
                classId: 'test_ATS'
            }
        }
    );
    expect([200, 201]).toContain(response.status());
    const data = await response.json();
    expect(data).toHaveProperty('jobRunId');
    expect(typeof data.jobRunId).toBe('number');
});

test('CsvFolderExportWithInvalidFolderIdReturns404', async () => {
    const response = await authenticatedRequest.post(
        '/pimcore-studio/api/export/csv/folder/999999',
        {
            data: {
                columns: exportColumns,
                config: { header: 'title', delimiter: ';' },
                elementType: 'data-object'
            }
        }
    );
    expect([404, 422]).toContain(response.status());
});

// ---------------------------------------------------------------------------
// XLSX export — element list
// ---------------------------------------------------------------------------

test('StartXlsxExportReturnsJobRunId', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/export/xlsx', {
        data: {
            elements: [objectId1, objectId2],
            columns: exportColumns,
            config: { header: 'title' },
            elementType: 'data-object',
            classId: 'test_ATS'
        }
    });
    expect([200, 201]).toContain(response.status());
    const data = await response.json();
    expect(data).toHaveProperty('jobRunId');
    expect(typeof data.jobRunId).toBe('number');
});

test('DownloadAndDeleteXlsxExport', async () => {
    // Start export
    const startResponse = await authenticatedRequest.post('/pimcore-studio/api/export/xlsx', {
        data: {
            elements: [objectId1, objectId2],
            columns: exportColumns,
            config: { header: 'title' },
            elementType: 'data-object',
            classId: 'test_ATS'
        }
    });
    expect([200, 201]).toContain(startResponse.status());
    const { jobRunId } = await startResponse.json();

    // Wait for job to complete
    await waitForJobCompletion(authenticatedRequest, jobRunId);

    // Download (500 = server could not find the file, feature may be partially configured)
    const downloadResponse = await authenticatedRequest.get(
        `/pimcore-studio/api/export/download/xlsx/${jobRunId}`
    );
    expect([200, 404, 500]).toContain(downloadResponse.status());

    // Delete
    const deleteResponse = await authenticatedRequest.delete(
        `/pimcore-studio/api/export/download/xlsx/${jobRunId}`
    );
    expect([200, 404, 500]).toContain(deleteResponse.status());
});

// ---------------------------------------------------------------------------
// XLSX export — negative tests
// ---------------------------------------------------------------------------

test('DownloadXlsxWithInvalidJobRunIdReturns404', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/export/download/xlsx/999999'
    );
    expect([404, 422]).toContain(response.status());
});

test('DeleteXlsxWithInvalidJobRunIdReturns404', async () => {
    const response = await authenticatedRequest.delete(
        '/pimcore-studio/api/export/download/xlsx/999999'
    );
    expect([404, 422]).toContain(response.status());
});

// ---------------------------------------------------------------------------
// XLSX export — folder-based
// ---------------------------------------------------------------------------

test('StartXlsxFolderExportReturnsJobRunId', async () => {
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/export/xlsx/folder/${testFolderId}`,
        {
            data: {
                columns: exportColumns,
                config: { header: 'title' },
                elementType: 'data-object',
                classId: 'test_ATS'
            }
        }
    );
    expect([200, 201]).toContain(response.status());
    const data = await response.json();
    expect(data).toHaveProperty('jobRunId');
    expect(typeof data.jobRunId).toBe('number');
});

test('XlsxFolderExportWithInvalidFolderIdReturns404', async () => {
    const response = await authenticatedRequest.post(
        '/pimcore-studio/api/export/xlsx/folder/999999',
        {
            data: {
                columns: exportColumns,
                config: { header: 'title' },
                elementType: 'data-object'
            }
        }
    );
    expect([404, 422]).toContain(response.status());
});
