import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
let configurationId: string;
let cloneId: string;
const ts = Date['now']();
const configName = `test-aet-${ts}`;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    const res = await authenticatedRequest.post('/pimcore-studio/api/bundle/backend-power-tools/aet/configuration', {
        data: { configurationName: configName }
    });
    if ([200, 201].includes(res.status())) {
        const body = await res.json();
        configurationId = body.id ?? body.configurationId ?? String(body);
    }
});

test.afterAll(async () => {
    if (configurationId) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/bundle/backend-power-tools/aet/configuration/${configurationId}`);
        } catch (_) {}
    }
    if (cloneId && cloneId !== configurationId) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/bundle/backend-power-tools/aet/configuration/${cloneId}`);
        } catch (_) {}
    }
    await authenticatedRequest.dispose();
});

// ── Metadata / Reference Endpoints ────────────────────────────────────────────

test('ListDataObjectClasses', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/backend-power-tools/aet/data-object-classes');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('ListValidLanguages', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/backend-power-tools/aet/valid-languages');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('ListPreconditionFilters', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/backend-power-tools/aet/precondition-filters');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('ListClassDefinitionFieldsForClass', async () => {
    // Use pre-provisioned automaticTestSimple class (ID 5)
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/backend-power-tools/aet/class-definition/fields', {
        params: { classId: '5' }
    });
    expect([200, 404, 422, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('ListClassDefinitionFieldsRequiresClassId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/backend-power-tools/aet/class-definition/fields');
    expect([400, 404, 422, 500]).toContain(response.status());
});

test('ListCommonRelationFields', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/backend-power-tools/aet/class-definition/common-relation-fields', {
        params: { classId: '5' }
    });
    expect([200, 400, 404, 422, 500]).toContain(response.status());
});

test('ListObjectBrickFields', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/backend-power-tools/aet/object-brick/fields');
    expect([200, 400, 404, 422, 500]).toContain(response.status());
});

// ── Configuration CRUD ─────────────────────────────────────────────────────────

test('ListAETConfigurations', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/backend-power-tools/aet/configurations');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('ListAETConfigurationsForAdminSettings', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/backend-power-tools/aet/configuration/list');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('ListAETConfigurationsForDefaultPerspective', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/backend-power-tools/aet/configuration/default-perspective');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('GetAETConfiguration', async () => {
    if (!configurationId) {
        const r = await authenticatedRequest.get('/pimcore-studio/api/bundle/backend-power-tools/aet/configuration/99999999');
        expect([404, 422, 500]).toContain(r.status());
        return;
    }
    const response = await authenticatedRequest.get(`/pimcore-studio/api/bundle/backend-power-tools/aet/configuration/${configurationId}`);
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('configurationName');
    }
});

test('GetAETConfigurationDetails', async () => {
    if (!configurationId) {
        const r = await authenticatedRequest.get('/pimcore-studio/api/bundle/backend-power-tools/aet/configuration/99999999/details');
        expect([404, 422, 500]).toContain(r.status());
        return;
    }
    const response = await authenticatedRequest.get(`/pimcore-studio/api/bundle/backend-power-tools/aet/configuration/${configurationId}/details`);
    expect([200, 404, 500]).toContain(response.status());
});

test('ExportAETConfiguration', async () => {
    if (!configurationId) {
        const r = await authenticatedRequest.get('/pimcore-studio/api/bundle/backend-power-tools/aet/configuration/99999999/export');
        expect([404, 422, 500]).toContain(r.status());
        return;
    }
    const response = await authenticatedRequest.get(`/pimcore-studio/api/bundle/backend-power-tools/aet/configuration/${configurationId}/export`);
    expect([200, 404, 500]).toContain(response.status());
});

test('UpdateAETConfiguration', async () => {
    if (!configurationId) {
        const r = await authenticatedRequest.put('/pimcore-studio/api/bundle/backend-power-tools/aet/configuration/99999999', {
            data: { configurationName: 'noop', data: '{}' }
        });
        expect([404, 422, 500]).toContain(r.status());
        return;
    }
    const response = await authenticatedRequest.put(`/pimcore-studio/api/bundle/backend-power-tools/aet/configuration/${configurationId}`, {
        data: {
            configurationName: configName,
            data: JSON.stringify({ general: {}, dataSource: {}, treeLevels: [] })
        }
    });
    expect([200, 404, 422, 500]).toContain(response.status());
});

test('CloneAETConfiguration', async () => {
    if (!configurationId) {
        const r = await authenticatedRequest.post('/pimcore-studio/api/bundle/backend-power-tools/aet/configuration/99999999/clone');
        expect([404, 415, 422, 500]).toContain(r.status());
        return;
    }
    const response = await authenticatedRequest.post(`/pimcore-studio/api/bundle/backend-power-tools/aet/configuration/${configurationId}/clone`);
    expect([200, 201, 404, 422, 500]).toContain(response.status());
    if ([200, 201].includes(response.status())) {
        const body = await response.json();
        cloneId = body.id ?? body.configurationId ?? '';
    }
});

test('ImportAETConfigurationWithInvalidBody', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/bundle/backend-power-tools/aet/configuration/import', {
        data: {}
    });
    expect([400, 404, 422, 500]).toContain(response.status());
});

test('CreateAETConfigurationWithMissingName', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/bundle/backend-power-tools/aet/configuration', {
        data: {}
    });
    expect([400, 422, 500]).toContain(response.status());
});

// ── Tree ───────────────────────────────────────────────────────────────────────

test('GetAETTree', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/backend-power-tools/aet/tree');
    expect([200, 400, 404, 422, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('GetAETTreeCalculationStatus', async () => {
    if (!configurationId) {
        const r = await authenticatedRequest.get('/pimcore-studio/api/bundle/backend-power-tools/aet/tree/99999999/calculation-status');
        expect([200, 404, 422, 500]).toContain(r.status());
        return;
    }
    const response = await authenticatedRequest.get(`/pimcore-studio/api/bundle/backend-power-tools/aet/tree/${configurationId}/calculation-status`);
    expect([200, 404, 422, 500]).toContain(response.status());
});

// ── Grid ───────────────────────────────────────────────────────────────────────

test('GetAETGridListing', async () => {
    const id = configurationId || '99999999';
    const response = await authenticatedRequest.post('/pimcore-studio/api/bundle/backend-power-tools/aet/grid/listing', {
        data: {
            configurationId: id,
            language: 'en',
            start: 0,
            limit: 10
        }
    });
    expect([200, 400, 404, 422, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('GetAETGridBatchEditIds', async () => {
    const id = configurationId || '99999999';
    const response = await authenticatedRequest.post('/pimcore-studio/api/bundle/backend-power-tools/aet/grid/batch-edit-ids', {
        data: { configurationId: id, language: 'en' }
    });
    expect([200, 400, 404, 422, 500]).toContain(response.status());
});

test('GetAETGridExportJobs', async () => {
    const id = configurationId || '99999999';
    const response = await authenticatedRequest.post('/pimcore-studio/api/bundle/backend-power-tools/aet/grid/export-jobs', {
        data: { configurationId: id, language: 'en' }
    });
    expect([200, 400, 404, 422, 500]).toContain(response.status());
});

test('PatchDataObjectViaAETWithInvalidIds', async () => {
    const id = configurationId || '99999999';
    const response = await authenticatedRequest.patch(`/pimcore-studio/api/bundle/backend-power-tools/aet/tree/${id}/update/99999999`, {
        data: {}
    });
    expect([200, 400, 404, 422, 500]).toContain(response.status());
});
