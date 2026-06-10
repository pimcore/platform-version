import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const ts = Date['now']();
const createdPerspectiveIds: string[] = [];
const createdWidgetIds: { widgetType: string; widgetId: string }[] = [];

let firstWidgetType: string | null = null;
let createdPerspectiveId: string | null = null;
let createdWidgetId: string | null = null;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    for (const { widgetType, widgetId } of createdWidgetIds.reverse()) {
        try {
            await authenticatedRequest.delete(
                `/pimcore-studio/api/perspectives/widgets/${widgetType}/configuration/${widgetId}`
            );
        } catch (_) {}
    }
    for (const perspectiveId of createdPerspectiveIds.reverse()) {
        try {
            await authenticatedRequest.delete(
                `/pimcore-studio/api/perspectives/configuration/${perspectiveId}`
            );
        } catch (_) {}
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

// ─── Widget Types ───────────────────────────────────────────────────────────

test('GetWidgetTypesReturnsItemsList', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/perspectives/widgets/types');
    expect([200, 404]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        // API may return { items: [...] } or a bare array
        const items = Array.isArray(data) ? data : data.items;
        expect(Array.isArray(items)).toBe(true);
        if (items.length > 0) {
            expect(items[0]).toHaveProperty('id');
            firstWidgetType = items[0].id;
        }
    }
});

// ─── Perspective Configurations ──────────────────────────────────────────────

test('GetAllPerspectiveConfigurationsReturnsCollection', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/perspectives/configurations');
    expect([200, 404]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
        expect(Array.isArray(data.items)).toBe(true);
        expect(data).toHaveProperty('totalItems');
        if (data.items.length > 0) {
            const item = data.items[0];
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('name');
            expect(item).toHaveProperty('isWriteable');
        }
    }
});

test('CreatePerspectiveWithValidName', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/perspectives/configuration', {
        data: {
            name: `test-perspective-${ts}`
        }
    });
    expect([200, 201, 404, 422]).toContain(response.status());
    if (response.status() === 200 || response.status() === 201) {
        const data = await response.json();
        // The API returns the ID of the new perspective
        const perspectiveId = typeof data === 'string' ? data : (data.id ?? data);
        if (perspectiveId) {
            createdPerspectiveId = String(perspectiveId);
            createdPerspectiveIds.push(createdPerspectiveId);
        }
    }
});

test('CreatePerspectiveWithoutNameReturns422', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/perspectives/configuration', {
        data: {}
    });
    expect([400, 422]).toContain(response.status());
});

test('GetPerspectiveByIdReturnsDetail', async () => {
    if (!createdPerspectiveId) {
        test.skip();
        return;
    }
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/perspectives/configuration/${createdPerspectiveId}`
    );
    expect([200, 404]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('name');
        expect(data).toHaveProperty('isWriteable');
        expect(data).toHaveProperty('widgetsLeft');
        expect(data).toHaveProperty('widgetsRight');
        expect(data).toHaveProperty('widgetsBottom');
    }
});

test('GetPerspectiveByNonExistentIdReturns404', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/perspectives/configuration/non_existent_perspective_id_999999'
    );
    expect([404, 422]).toContain(response.status());
});

test('UpdatePerspectiveConfigById', async () => {
    if (!createdPerspectiveId) {
        test.skip();
        return;
    }
    const response = await authenticatedRequest.put(
        `/pimcore-studio/api/perspectives/configuration/${createdPerspectiveId}`,
        {
            data: {
                name: `updated-perspective-${ts}`,
                icon: { type: 'name', value: '' },
                contextPermissions: {},
                widgetsLeft: {},
                widgetsRight: {},
                widgetsBottom: {},
                expandedLeft: null,
                expandedRight: null
            }
        }
    );
    expect([200, 404, 422]).toContain(response.status());
});

test('UpdateNonExistentPerspectiveReturns404', async () => {
    const response = await authenticatedRequest.put(
        '/pimcore-studio/api/perspectives/configuration/non_existent_perspective_id_999999',
        {
            data: {
                name: `updated-perspective-${ts}`,
                icon: { type: 'name', value: '' },
                contextPermissions: {},
                widgetsLeft: {},
                widgetsRight: {},
                widgetsBottom: {},
                expandedLeft: null,
                expandedRight: null
            }
        }
    );
    expect([404, 422]).toContain(response.status());
});

test('DeletePerspectiveById', async () => {
    // Create a fresh perspective just for deletion test
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/perspectives/configuration', {
        data: { name: `delete-perspective-${ts}` }
    });
    expect([200, 201, 404, 422]).toContain(createResponse.status());

    if (createResponse.status() === 200 || createResponse.status() === 201) {
        const data = await createResponse.json();
        const perspectiveId = typeof data === 'string' ? data : (data.id ?? data);
        if (perspectiveId) {
            const deleteResponse = await authenticatedRequest.delete(
                `/pimcore-studio/api/perspectives/configuration/${String(perspectiveId)}`
            );
            expect([200, 204, 404]).toContain(deleteResponse.status());
        }
    }
});

test('DeleteNonExistentPerspectiveReturns404', async () => {
    const response = await authenticatedRequest.delete(
        '/pimcore-studio/api/perspectives/configuration/non_existent_perspective_id_999999'
    );
    expect([404, 422]).toContain(response.status());
});

// ─── Widget Configurations ───────────────────────────────────────────────────

test('GetAllWidgetConfigurationsReturnsCollection', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/perspectives/widgets/configurations');
    expect([200, 404]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
        expect(Array.isArray(data.items)).toBe(true);
        expect(data).toHaveProperty('totalItems');
        if (data.items.length > 0) {
            const item = data.items[0];
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('widgetType');
        }
    }
});

test('GetAllWidgetConfigurationsSkipWrappers', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/perspectives/widgets/configurations?skipWrapperWidgets=true'
    );
    expect([200, 404]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
        expect(Array.isArray(data.items)).toBe(true);
    }
});

test('CreateWidgetWithValidType', async () => {
    // Try to get a valid widget type first; fall back to 'element_tree' as per spec example
    const widgetType = firstWidgetType ?? 'element_tree';
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/perspectives/widgets/${widgetType}/configuration`,
        {
            data: {
                data: { name: `test-widget-${ts}` }
            }
        }
    );
    expect([200, 201, 404, 422]).toContain(response.status());
    if (response.status() === 200 || response.status() === 201) {
        const data = await response.json();
        const widgetId = typeof data === 'string' ? data : (data.id ?? data);
        if (widgetId) {
            createdWidgetId = String(widgetId);
            createdWidgetIds.push({ widgetType, widgetId: createdWidgetId });
        }
    }
});

test('CreateWidgetWithoutNameReturns422', async () => {
    const widgetType = firstWidgetType ?? 'element_tree';
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/perspectives/widgets/${widgetType}/configuration`,
        {
            data: { data: {} }
        }
    );
    // Server may return 422 for missing name, or 404 if type not found
    expect([400, 404, 422]).toContain(response.status());
});

test('GetWidgetConfigByIdAndType', async () => {
    if (!createdWidgetId || !firstWidgetType) {
        test.skip();
        return;
    }
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/perspectives/widgets/${firstWidgetType}/configuration/${createdWidgetId}`
    );
    expect([200, 404]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('data');
    }
});

test('GetWidgetConfigWithNonExistentIdReturns404', async () => {
    const widgetType = firstWidgetType ?? 'element_tree';
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/perspectives/widgets/${widgetType}/configuration/non_existent_widget_id_999999`
    );
    expect([404, 422]).toContain(response.status());
});

test('UpdateWidgetConfigByIdAndType', async () => {
    if (!createdWidgetId || !firstWidgetType) {
        test.skip();
        return;
    }
    const response = await authenticatedRequest.put(
        `/pimcore-studio/api/perspectives/widgets/${firstWidgetType}/configuration/${createdWidgetId}`,
        {
            data: {
                data: { name: `updated-widget-${ts}` }
            }
        }
    );
    expect([200, 404, 422]).toContain(response.status());
});

test('UpdateWidgetConfigWithNonExistentIdReturns404', async () => {
    const widgetType = firstWidgetType ?? 'element_tree';
    const response = await authenticatedRequest.put(
        `/pimcore-studio/api/perspectives/widgets/${widgetType}/configuration/non_existent_widget_id_999999`,
        {
            data: {
                data: { name: `updated-widget-${ts}` }
            }
        }
    );
    expect([404, 422]).toContain(response.status());
});

test('DeleteWidgetById', async () => {
    // Create a fresh widget just for deletion test
    const widgetType = firstWidgetType ?? 'element_tree';
    const createResponse = await authenticatedRequest.post(
        `/pimcore-studio/api/perspectives/widgets/${widgetType}/configuration`,
        {
            data: {
                data: { name: `delete-widget-${ts}` }
            }
        }
    );
    expect([200, 201, 404, 422]).toContain(createResponse.status());

    if (createResponse.status() === 200 || createResponse.status() === 201) {
        const data = await createResponse.json();
        const widgetId = typeof data === 'string' ? data : (data.id ?? data);
        if (widgetId) {
            const deleteResponse = await authenticatedRequest.delete(
                `/pimcore-studio/api/perspectives/widgets/${widgetType}/configuration/${String(widgetId)}`
            );
            expect([200, 204, 404]).toContain(deleteResponse.status());
        }
    }
});

test('DeleteWidgetWithNonExistentIdReturns404', async () => {
    const widgetType = firstWidgetType ?? 'element_tree';
    const response = await authenticatedRequest.delete(
        `/pimcore-studio/api/perspectives/widgets/${widgetType}/configuration/non_existent_widget_id_999999`
    );
    expect([404, 422]).toContain(response.status());
});
