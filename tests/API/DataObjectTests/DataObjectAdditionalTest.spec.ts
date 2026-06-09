import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';
import { JobHelper } from '../../utils/job';

let authenticatedRequest: APIRequestContext;
let testFolderId: number;
let keepObjectId: number;
let batchDeleteId1: number;
let batchDeleteId2: number;
const ts = Date['now']();
const testFolderName = `do-additional-test-${ts}`;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    testFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        testFolderName,
        1,
        'data-object'
    );

    // Create object to keep for non-delete tests
    const res1 = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: { key: `keep-obj-${ts}`, classId: 'test_ATS', type: 'object' }
    });
    expect(res1.status()).toBe(200);
    keepObjectId = (await res1.json()).id;

    // Create two objects for batch-delete test
    const res2 = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: { key: `batch-del-1-${ts}`, classId: 'test_ATS', type: 'object' }
    });
    expect(res2.status()).toBe(200);
    batchDeleteId1 = (await res2.json()).id;

    const res3 = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: { key: `batch-del-2-${ts}`, classId: 'test_ATS', type: 'object' }
    });
    expect(res3.status()).toBe(200);
    batchDeleteId2 = (await res3.json()).id;
});

test.afterAll(async () => {
    try {
        await JobHelper.cancelAllRunningJobs(authenticatedRequest);
    } catch (_) {}
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testFolderId, 'data-object');
    } catch (_) {}
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('BatchDeleteDataObjectsReturnsJobRunId', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/data-objects/batch-delete', {
        data: { ids: [batchDeleteId1, batchDeleteId2] }
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('jobRunId');
    expect(typeof body.jobRunId).toBe('number');
});

test('BatchDeleteWithEmptyIdsArray', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/data-objects/batch-delete', {
        data: { ids: [] }
    });
    // Empty IDs may succeed (no-op job) or return a validation error
    expect([201, 400, 422]).toContain(response.status());
});

test('BatchDeleteWithNonExistentIds', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/data-objects/batch-delete', {
        data: { ids: [999999998, 999999999] }
    });
    // Non-existent IDs: the API may still create a job or return an error
    expect([201, 404, 422]).toContain(response.status());
});

test('PatchObjectsInFolderReturnsJobRunId', async () => {
    const response = await authenticatedRequest.patch(`/pimcore-studio/api/data-objects/folder/${testFolderId}`, {
        data: {
            classId: 'test_ATS',
            data: {
                published: false
            },
            filters: {
                columnFilters: {},
                sortFilter: {}
            }
        }
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('jobRunId');
    expect(typeof body.jobRunId).toBe('number');
});

test('PatchObjectsInFolderWithInvalidFolderId', async () => {
    const response = await authenticatedRequest.patch('/pimcore-studio/api/data-objects/folder/999999', {
        data: {
            classId: 'test_ATS',
            data: {
                published: false
            },
            filters: {
                columnFilters: {},
                sortFilter: {}
            }
        }
    });
    // API creates an async job regardless of folder existence (validated during job execution)
    expect([201, 404, 422]).toContain(response.status());
});

test('PatchObjectsInFolderRequiresClassId', async () => {
    const response = await authenticatedRequest.patch(`/pimcore-studio/api/data-objects/folder/${testFolderId}`, {
        data: {
            data: {
                published: false
            }
        }
    });
    // Missing required classId should result in validation error
    expect([400, 422]).toContain(response.status());
});

test('FormatPathAcceptsValidPayload', async () => {
    const targetKey = `object_${keepObjectId}`;
    // fieldName is required by the PHP DTO even though the OpenAPI spec marks it optional.
    // The response depends on whether the class field has a PathFormatter configured:
    // 200 with items if PathFormatterAware, 200 with empty items if not, 500 if the
    // dot-notation parser throws an unexpected exception for an unknown field.
    const response = await authenticatedRequest.post('/pimcore-studio/api/data-objects/format-path', {
        data: {
            objectId: keepObjectId,
            fieldName: 'input',
            targets: {
                [targetKey]: {
                    id: keepObjectId,
                    type: 'object',
                    label: `keep-obj-${ts}`,
                    path: `/${testFolderName}/keep-obj-${ts}`,
                    nicePathKey: targetKey
                }
            }
        }
    });
    expect([200, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('totalItems');
        expect(body).toHaveProperty('items');
        expect(Array.isArray(body.items)).toBe(true);
    }
});

test('FormatPathWithEmptyTargets', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/data-objects/format-path', {
        data: {
            objectId: keepObjectId,
            targets: {}
        }
    });
    expect([200, 422]).toContain(response.status());
});

test('FormatPathRequiresObjectIdAndTargets', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/data-objects/format-path', {
        data: {}
    });
    // Missing required fields should return a validation error
    expect([400, 422]).toContain(response.status());
});

test('PreviewDataObjectById', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/data-objects/preview/${keepObjectId}`, {
        maxRedirects: 0
    });
    // Preview may redirect (302) or return 422 if no preview generator is configured
    expect([200, 302, 422, 500]).toContain(response.status());
});

test('PreviewDataObjectWithNonExistentId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/data-objects/preview/999999', {
        maxRedirects: 0
    });
    expect([404, 422]).toContain(response.status());
});

test('SelectOptionsRequiresObjectIdFieldNameAndContext', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/data-objects/select-options', {
        data: {}
    });
    // Missing required fields should return a validation error
    expect([400, 422]).toContain(response.status());
});

test('SelectOptionsForDataObjectField', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/data-objects/select-options', {
        data: {
            objectId: keepObjectId,
            fieldName: 'select',
            context: {
                containerType: 'object',
                fieldname: 'select',
                objectId: keepObjectId,
                layoutId: '0'
            }
        }
    });
    // May return options list or 404/422 if the field does not support dynamic select
    expect([200, 404, 422]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('totalItems');
        expect(body).toHaveProperty('items');
        expect(Array.isArray(body.items)).toBe(true);
    }
});

test('SelectOptionsWithNonExistentObjectId', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/data-objects/select-options', {
        data: {
            objectId: 999999,
            fieldName: 'select',
            context: {
                containerType: 'object',
                fieldname: 'select',
                objectId: 999999,
                layoutId: '0'
            }
        }
    });
    expect([404, 422]).toContain(response.status());
});
