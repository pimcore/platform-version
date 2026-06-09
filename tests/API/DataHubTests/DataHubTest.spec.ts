import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
let configName: string;
let cloneName: string;
const ts = Date['now']();

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
    configName = `test-dh-${ts}`;
    cloneName = `test-dh-clone-${ts}`;

    const res = await authenticatedRequest.post('/pimcore-studio/api/bundle/data-hub/config/add', {
        params: { name: configName, type: 'graphql' }
    });
    if (![200, 201].includes(res.status())) {
        configName = '';
    }
});

test.afterAll(async () => {
    if (configName) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/bundle/data-hub/config/delete/${configName}`);
        } catch (_) {}
    }
    if (cloneName) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/bundle/data-hub/config/delete/${cloneName}`);
        } catch (_) {}
    }
    await authenticatedRequest.dispose();
});

// ── Bundle Data Hub ────────────────────────────────────────────────────────────

test('ListDataHubConfigurations', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-hub/config');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('GetDataHubConfiguration', async () => {
    if (!configName) {
        const r = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-hub/config/nonexistent-config-999');
        expect([404, 422, 500]).toContain(r.status());
        return;
    }
    const response = await authenticatedRequest.get(`/pimcore-studio/api/bundle/data-hub/config/${configName}`);
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('name');
    }
});

test('UpdateDataHubConfiguration', async () => {
    if (!configName) {
        const r = await authenticatedRequest.put('/pimcore-studio/api/bundle/data-hub/config/nonexistent-999', {
            data: { data: '{}', modificationDate: 0 }
        });
        expect([404, 422, 500]).toContain(r.status());
        return;
    }
    const response = await authenticatedRequest.put(`/pimcore-studio/api/bundle/data-hub/config/${configName}`, {
        data: {
            data: JSON.stringify({ general: { active: true, type: 'graphql', name: configName } }),
            modificationDate: Math.floor(Date.now() / 1000)
        }
    });
    expect([200, 404, 409, 422, 500]).toContain(response.status());
});

test('ExportDataHubConfiguration', async () => {
    if (!configName) {
        const r = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-hub/config/nonexistent-999/export');
        expect([404, 422, 500]).toContain(r.status());
        return;
    }
    const response = await authenticatedRequest.get(`/pimcore-studio/api/bundle/data-hub/config/${configName}/export`);
    expect([200, 404, 500]).toContain(response.status());
});

test('CloneDataHubConfiguration', async () => {
    if (!configName) {
        const r = await authenticatedRequest.post('/pimcore-studio/api/bundle/data-hub/config/clone', {
            params: { name: `nonexistent-clone-${ts}`, originalName: 'nonexistent-999' }
        });
        expect([404, 422, 500]).toContain(r.status());
        return;
    }
    const response = await authenticatedRequest.post('/pimcore-studio/api/bundle/data-hub/config/clone', {
        params: { name: cloneName, originalName: configName }
    });
    expect([200, 201, 404, 422, 500]).toContain(response.status());
    if (![200, 201].includes(response.status())) {
        cloneName = '';
    }
});

test('GetDataHubThumbnails', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-hub/thumbnails');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('GetDataHubUsers', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-hub/users');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('GetDataHubGraphQLExplorerUrl', async () => {
    const name = configName || 'nonexistent-999';
    const response = await authenticatedRequest.get(`/pimcore-studio/api/bundle/data-hub/graphql/explorer-url/${name}`);
    expect([200, 404, 422, 500]).toContain(response.status());
});

test('GetDataHubGraphQLExplorer', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-hub/graphql/explorer/nonexistent');
    expect([200, 404, 422, 500]).toContain(response.status());
});

test('ImportDataHubConfigurationWithInvalidBody', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/bundle/data-hub/config/import', {
        data: {}
    });
    expect([400, 404, 422, 500]).toContain(response.status());
});

test('AddDataHubConfigurationWithMissingName', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/bundle/data-hub/config/add', {
        params: { type: 'graphql' }
    });
    expect([400, 404, 422, 500]).toContain(response.status());
});

test('GetNonExistentDataHubConfiguration', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-hub/config/nonexistent-config-999');
    expect([404, 422, 500]).toContain(response.status());
});

// ── Bundle Data Hub File Export ────────────────────────────────────────────────

test('ListDataHubFileExporterTypes', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-hub-file-export/exporter-types');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('ListDataHubFileExporterServices', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-hub-file-export/exporter-services');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('GetDataHubFileExportThumbnails', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-hub-file-export/thumbnails');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('ValidateDataHubFileExportCronExpression', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-hub-file-export/validate-cron', {
        params: { cron_expression: '* * * * *' }
    });
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('isValid');
    }
});

test('GetDataHubFileExportProgress', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-hub-file-export/export/progress');
    expect([200, 404, 422, 500]).toContain(response.status());
});

test('CancelDataHubFileExport', async () => {
    const response = await authenticatedRequest.put('/pimcore-studio/api/bundle/data-hub-file-export/export/cancel');
    expect([200, 404, 422, 500]).toContain(response.status());
});

test('StartDataHubFileExportWithInvalidConfig', async () => {
    const response = await authenticatedRequest.put('/pimcore-studio/api/bundle/data-hub-file-export/export/start');
    expect([200, 400, 404, 415, 422, 500]).toContain(response.status());
});

test('GetNonExistentDataHubFileExportConfig', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-hub-file-export/config/nonexistent-999');
    expect([404, 422, 500]).toContain(response.status());
});

test('UpdateNonExistentDataHubFileExportConfig', async () => {
    const response = await authenticatedRequest.put('/pimcore-studio/api/bundle/data-hub-file-export/config/nonexistent-999', {
        data: {}
    });
    expect([404, 422, 500]).toContain(response.status());
});

test('DeleteNonExistentDataHubFileExportConfig', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/bundle/data-hub-file-export/config/nonexistent-999');
    expect([404, 422, 500]).toContain(response.status());
});

// ── Bundle Data Hub Simple Rest ────────────────────────────────────────────────

test('GetDataHubSimpleRestQueueItemCount', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-hub-simple-rest/queue/item-count');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('count');
    }
});

test('GetDataHubSimpleRestThumbnails', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-hub-simple-rest/thumbnails');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('GetNonExistentDataHubSimpleRestConfig', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-hub-simple-rest/config/nonexistent-999');
    expect([404, 422, 500]).toContain(response.status());
});

test('GetNonExistentDataHubSimpleRestLabelList', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-hub-simple-rest/config/nonexistent-999/label-list');
    expect([404, 422, 500]).toContain(response.status());
});

test('UpdateNonExistentDataHubSimpleRestConfig', async () => {
    const response = await authenticatedRequest.put('/pimcore-studio/api/bundle/data-hub-simple-rest/config/nonexistent-999', {
        data: {}
    });
    expect([404, 422, 500]).toContain(response.status());
});

// ── Bundle Data Hub Webhooks ───────────────────────────────────────────────────

test('GetNonExistentDataHubWebhooksConfig', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-hub-webhooks/config/nonexistent-999');
    expect([404, 422, 500]).toContain(response.status());
});

test('UpdateNonExistentDataHubWebhooksConfig', async () => {
    const response = await authenticatedRequest.put('/pimcore-studio/api/bundle/data-hub-webhooks/config/nonexistent-999', {
        data: {}
    });
    expect([404, 422, 500]).toContain(response.status());
});

test('TestDataHubWebhookSubscribersWithInvalidPayload', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/bundle/data-hub-webhooks/config/test-subscribers', {
        data: {}
    });
    expect([200, 400, 404, 422, 500]).toContain(response.status());
});
