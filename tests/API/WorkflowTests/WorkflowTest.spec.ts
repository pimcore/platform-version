import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let testFolderId: number;
let objectId: number;
const ts = Date['now']();
const testFolderName = `workflow-test-${ts}`;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    testFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        testFolderName,
        1,
        'data-object'
    );

    const createResponse = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: { key: `workflow-obj-${ts}`, classId: 'test_ATS', type: 'object' }
    });
    expect(createResponse.status()).toBe(200);
    objectId = (await createResponse.json()).id;
});

test.afterAll(async () => {
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testFolderId, 'data-object');
    } catch (_) {}
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetWorkflowDetailsForDataObject', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/workflows/details', {
        params: {
            elementType: 'data-object',
            elementId: objectId,
        }
    });
    // Workflows may not be configured on the test instance - accept 200 or error codes
    expect([200, 404, 422]).toContain(response.status());

    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
        expect(data).toHaveProperty('layoutId');
        expect(Array.isArray(data.items)).toBe(true);
    }
});

test('GetWorkflowDetailsForAssetElementType', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/workflows/details', {
        params: {
            elementType: 'asset',
            elementId: 1,
        }
    });
    expect([200, 404, 422]).toContain(response.status());

    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
        expect(data).toHaveProperty('layoutId');
        expect(Array.isArray(data.items)).toBe(true);
    }
});

test('GetWorkflowDetailsMissingElementIdReturnsError', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/workflows/details', {
        params: {
            elementType: 'data-object',
            // elementId intentionally omitted
        }
    });
    expect([400, 404, 422]).toContain(response.status());
});

test('GetWorkflowDetailsMissingElementTypeReturnsError', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/workflows/details', {
        params: {
            elementId: objectId,
            // elementType intentionally omitted
        }
    });
    expect([400, 404, 422]).toContain(response.status());
});

test('GetWorkflowDetailsNonExistentElementId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/workflows/details', {
        params: {
            elementType: 'data-object',
            elementId: 999999999,
        }
    });
    expect([200, 404, 422]).toContain(response.status());
});

test('SubmitWorkflowActionWithInvalidWorkflow', async () => {
    // Submit an action for a non-existent workflow - should fail gracefully
    const response = await authenticatedRequest.post('/pimcore-studio/api/workflows/action', {
        data: {
            actionType: 'transition',
            elementId: objectId,
            elementType: 'data-object',
            workflowId: 'non_existent_workflow',
            transitionId: 'non_existent_transition',
            workflowOptions: null,
        }
    });
    // Workflow not configured: 400, 404, 422 are all acceptable
    expect([400, 404, 422]).toContain(response.status());
});

test('SubmitWorkflowActionWithMissingRequiredFields', async () => {
    // Missing required fields should produce a validation error
    const response = await authenticatedRequest.post('/pimcore-studio/api/workflows/action', {
        data: {
            actionType: 'transition',
            // elementId, elementType, workflowId, transitionId, workflowOptions all missing
        }
    });
    expect([400, 422]).toContain(response.status());
});

test('SubmitWorkflowActionWithInvalidElementType', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/workflows/action', {
        data: {
            actionType: 'transition',
            elementId: objectId,
            elementType: 'invalid-type',
            workflowId: 'some_workflow',
            transitionId: 'some_transition',
            workflowOptions: null,
        }
    });
    expect([400, 404, 422]).toContain(response.status());
});

test('SubmitWorkflowActionWithGlobalActionType', async () => {
    // Test with globalAction type for a non-existent workflow
    const response = await authenticatedRequest.post('/pimcore-studio/api/workflows/action', {
        data: {
            actionType: 'globalAction',
            elementId: objectId,
            elementType: 'data-object',
            workflowId: 'non_existent_workflow',
            transitionId: 'non_existent_action',
            workflowOptions: { notes: 'Test note' },
        }
    });
    expect([200, 400, 404, 422]).toContain(response.status());
});
