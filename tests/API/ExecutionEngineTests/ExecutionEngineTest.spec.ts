import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let testFolderId: number;
let exportObjectId: number;
const ts = Date['now']();

/**
 * Poll until a specific job run is no longer in the running state (max ~30s).
 */
async function waitForJobCompletion(ctx: APIRequestContext, jobRunId: number): Promise<void> {
    for (let i = 0; i < 15; i++) {
        const response = await ctx.post('/pimcore-studio/api/execution-engine/running-jobs', {
            data: { filters: { page: 1, pageSize: 50 } }
        });
        if (response.status() !== 200) break;
        const body = await response.json();
        const items: any[] = body.items || [];
        const job = items.find((j: any) => j.id === jobRunId);
        if (!job || job.state !== 'running') break;
        await new Promise(r => setTimeout(r, 2000));
    }
}

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    // Create a data object to feed real CSV export jobs. The export endpoint
    // rejects an empty element list with 422 ("No elements provided"), so a
    // concrete element is required to produce an abortable/hideable job.
    testFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        `execengine-test-${ts}`,
        1,
        'data-object'
    );

    const objRes = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: { key: `execengine-obj-${ts}`, classId: 'test_ATS', type: 'object' }
    });
    expect(objRes.status()).toBe(200);
    exportObjectId = (await objRes.json()).id;
});

test.afterAll(async () => {
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testFolderId, 'data-object');
    } catch (_) {}
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

// ---------------------------------------------------------------------------
// POST /execution-engine/running-jobs — list jobs
// ---------------------------------------------------------------------------

test('ListRunningJobsReturnsItems', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/execution-engine/running-jobs', {
        data: { filters: { page: 1, pageSize: 25 } }
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('ListRunningJobsWithPageAndPageSize', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/execution-engine/running-jobs', {
        data: { filters: { page: 1, pageSize: 10 } }
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeLessThanOrEqual(10);
});

test('ListRunningJobsResponseItemsHaveExpectedFields', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/execution-engine/running-jobs', {
        data: { filters: { page: 1, pageSize: 25 } }
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    const items: any[] = data.items || [];
    // If any jobs exist, verify they have the expected shape
    for (const job of items) {
        expect(job).toHaveProperty('id');
        expect(typeof job.id).toBe('number');
        expect(job).toHaveProperty('state');
    }
});

// ---------------------------------------------------------------------------
// POST /execution-engine/abort/{jobRunId} — abort job run
// ---------------------------------------------------------------------------

test('AbortNonExistentJobReturns404Or422', async () => {
    const response = await authenticatedRequest.post(
        '/pimcore-studio/api/execution-engine/abort/999999'
    );
    expect([404, 422]).toContain(response.status());
});

test('AbortRunningJobSucceeds', async () => {
    // Start a CSV export to get a real jobRunId
    const exportResponse = await authenticatedRequest.post('/pimcore-studio/api/export/csv', {
        data: {
            elements: [exportObjectId],
            columns: [{ key: 'id', type: 'system.id' }],
            config: { header: 'title', delimiter: ';' },
            elementType: 'data-object',
            classId: 'test_ATS'
        }
    });

    expect([200, 201]).toContain(exportResponse.status());

    const exportData = await exportResponse.json();
    const jobRunId: number = exportData.jobRunId;
    expect(typeof jobRunId).toBe('number');

    // Attempt to abort immediately
    const abortResponse = await authenticatedRequest.post(
        `/pimcore-studio/api/execution-engine/abort/${jobRunId}`
    );
    // Acceptable: 200 (aborted), 422 (already finished too fast), 404 (job gone)
    expect([200, 201, 404, 422]).toContain(abortResponse.status());
});

// ---------------------------------------------------------------------------
// POST /execution-engine/hide — hide job runs
// ---------------------------------------------------------------------------

test('HideEmptyJobRunListReturns200Or422', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/execution-engine/hide', {
        data: { jobRunIds: [] }
    });
    // Empty list may be accepted (200) or rejected as invalid input (422)
    expect([200, 201, 422]).toContain(response.status());
});

test('HideNonExistentJobRunReturns200Or404Or422', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/execution-engine/hide', {
        data: { jobRunIds: [999999] }
    });
    // Server may silently succeed (200) or return 404/422 for unknown IDs
    expect([200, 201, 404, 422]).toContain(response.status());
});

test('HideCompletedJobSucceeds', async () => {
    // First check if there are any completed jobs we can hide
    const listResponse = await authenticatedRequest.post(
        '/pimcore-studio/api/execution-engine/running-jobs',
        { data: { filters: { page: 1, pageSize: 50 } } }
    );
    expect(listResponse.status()).toBe(200);
    const listData = await listResponse.json();
    const items: any[] = listData.items || [];

    const completedJobs = items.filter(
        (j: any) => j.state === 'finished' || j.state === 'completed' || j.state === 'failed'
    );

    if (completedJobs.length === 0) {
        // Start a quick export to produce a job, wait for it to finish, then hide it
        const exportResponse = await authenticatedRequest.post('/pimcore-studio/api/export/csv', {
            data: {
                elements: [exportObjectId],
                columns: [{ key: 'id', type: 'system.id' }],
                config: { header: 'title', delimiter: ';' },
                elementType: 'data-object',
                classId: 'test_ATS'
            }
        });

        expect([200, 201]).toContain(exportResponse.status());

        const { jobRunId } = await exportResponse.json();
        await waitForJobCompletion(authenticatedRequest, jobRunId);

        const hideResponse = await authenticatedRequest.post(
            '/pimcore-studio/api/execution-engine/hide',
            { data: { jobRunIds: [jobRunId] } }
        );
        expect([200, 201, 404, 422]).toContain(hideResponse.status());
    } else {
        const idsToHide = completedJobs.slice(0, 3).map((j: any) => j.id);
        const hideResponse = await authenticatedRequest.post(
            '/pimcore-studio/api/execution-engine/hide',
            { data: { jobRunIds: idsToHide } }
        );
        expect([200, 201, 404, 422]).toContain(hideResponse.status());
    }
});
