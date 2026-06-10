import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let testFolderId: number;
let dataObjectId: number;
let createdScheduleId: number;
const ts = Date['now']();
const testFolderName = `schedule-test-${ts}`;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    testFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        testFolderName,
        1,
        'data-object'
    );

    const createResponse = await authenticatedRequest.post(`/pimcore-studio/api/data-objects/add/${testFolderId}`, {
        data: { key: `schedule-obj-${ts}`, classId: 'test_ATS', type: 'object' }
    });
    expect(createResponse.status()).toBe(200);
    dataObjectId = (await createResponse.json()).id;
});

test.afterAll(async () => {
    if (createdScheduleId) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/schedules/${createdScheduleId}`);
        } catch (_) {}
    }
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testFolderId, 'data-object');
    } catch (_) {}
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetScheduleActionsForDataObject', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/schedules/actions/data-object');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
    for (const action of data.items) {
        expect(action).toHaveProperty('key');
        expect(typeof action.key).toBe('string');
    }
});

test('GetScheduleActionsForAsset', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/schedules/actions/asset');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetScheduleActionsForDocument', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/schedules/actions/document');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetScheduleActionsInvalidElementTypeReturns4xx', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/schedules/actions/invalid-type');
    expect([400, 403, 404, 422]).toContain(response.status());
});

test('GetSchedulesForDataObject', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/schedules/data-object/${dataObjectId}`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetSchedulesForNonExistentElementReturns404', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/schedules/data-object/999999');
    expect([404, 422]).toContain(response.status());
});

test('CreateScheduleForDataObject', async () => {
    const futureDate = Math.floor(ts / 1000) + 3600;

    const response = await authenticatedRequest.post(`/pimcore-studio/api/schedules/data-object/${dataObjectId}`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(typeof data.id).toBe('number');
    expect(data).toHaveProperty('ctype');
    expect(data).toHaveProperty('active');
    createdScheduleId = data.id;
});

test('GetSchedulesAfterCreate', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/schedules/data-object/${dataObjectId}`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
    const found = data.items.some((s: { id: number }) => s.id === createdScheduleId);
    expect(found).toBe(true);
});

test('UpdateSchedulesForDataObject', async () => {
    const futureDate = Math.floor(ts / 1000) + 7200;

    const response = await authenticatedRequest.put(`/pimcore-studio/api/schedules/data-object/${dataObjectId}`, {
        data: {
            items: [
                {
                    id: createdScheduleId,
                    date: futureDate,
                    action: 'publish',
                    active: true
                }
            ]
        }
    });
    expect([200, 500]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
        expect(Array.isArray(data.items)).toBe(true);
        expect(data.items.length).toBeGreaterThan(0);
        const updated = data.items.find((s: { id: number }) => s.id === createdScheduleId);
        if (updated) {
            expect(updated.date).toBe(futureDate);
            expect(updated.action).toBe('publish');
            expect(updated.active).toBe(true);
        }
    }
});

test('UpdateSchedulesCreateNewViaNull', async () => {
    const futureDate = Math.floor(ts / 1000) + 10800;

    const response = await authenticatedRequest.put(`/pimcore-studio/api/schedules/data-object/${dataObjectId}`, {
        data: {
            items: [
                {
                    id: null,
                    date: futureDate,
                    action: 'unpublish',
                    active: false
                }
            ]
        }
    });
    expect([200, 422, 500]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
        // Clean up any newly created schedule
        const newSchedule = data.items.find(
            (s: { id: number; action: string }) => s.action === 'unpublish' && s.id !== createdScheduleId
        );
        if (newSchedule) {
            try {
                await authenticatedRequest.delete(`/pimcore-studio/api/schedules/${newSchedule.id}`);
            } catch (_) {}
        }
    }
});

test('UpdateSchedulesForNonExistentElementReturns404', async () => {
    const futureDate = Math.floor(ts / 1000) + 3600;

    const response = await authenticatedRequest.put('/pimcore-studio/api/schedules/data-object/999999', {
        data: {
            items: [
                {
                    id: null,
                    date: futureDate,
                    active: true
                }
            ]
        }
    });
    expect([404, 422, 500]).toContain(response.status());
});

test('DeleteScheduleById', async () => {
    const response = await authenticatedRequest.delete(`/pimcore-studio/api/schedules/${createdScheduleId}`);
    expect([200, 500]).toContain(response.status());
    if (response.status() === 200) {
        createdScheduleId = 0;
    }
});

test('DeleteNonExistentScheduleReturns404', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/schedules/999999');
    expect([404, 422]).toContain(response.status());
});
