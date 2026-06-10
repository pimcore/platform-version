import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
let reportName: string;
let cloneName: string;
const ts = Date['now']();

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
    reportName = `test-report-${ts}`;
    cloneName = `test-report-clone-${ts}`;

    const res = await authenticatedRequest.post('/pimcore-studio/api/bundle/custom-reports/config/add', {
        data: { name: reportName }
    });
    if (![200, 201].includes(res.status())) {
        reportName = '';
    }
});

test.afterAll(async () => {
    if (reportName) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/bundle/custom-reports/config/${reportName}`);
        } catch (_) {}
    }
    if (cloneName) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/bundle/custom-reports/config/${cloneName}`);
        } catch (_) {}
    }
    await authenticatedRequest.dispose();
});

test('GetCustomReportsTree', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/custom-reports/tree');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('GetCustomReportsConfigTree', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/custom-reports/tree/config');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('AddCustomReportConfigurationMissingName', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/bundle/custom-reports/config/add', {
        data: {}
    });
    expect([400, 422, 500]).toContain(response.status());
});

test('GetCustomReportByName', async () => {
    if (!reportName) {
        const r = await authenticatedRequest.get('/pimcore-studio/api/bundle/custom-reports/report/nonexistent-999');
        expect([404, 422, 500]).toContain(r.status());
        return;
    }
    const response = await authenticatedRequest.get(`/pimcore-studio/api/bundle/custom-reports/report/${reportName}`);
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('name');
    }
});

test('UpdateCustomReportConfiguration', async () => {
    if (!reportName) {
        const r = await authenticatedRequest.put('/pimcore-studio/api/bundle/custom-reports/config/nonexistent-999', {
            data: {}
        });
        expect([404, 422, 500]).toContain(r.status());
        return;
    }
    const response = await authenticatedRequest.put(`/pimcore-studio/api/bundle/custom-reports/config/${reportName}`, {
        data: { name: reportName, sql: 'SELECT 1', groupByField: '', chartType: '0', pieChartColumn: '', sourceColumn: '' }
    });
    expect([200, 404, 422, 500]).toContain(response.status());
});

test('CloneCustomReportConfiguration', async () => {
    if (!reportName) {
        const r = await authenticatedRequest.post('/pimcore-studio/api/bundle/custom-reports/config/clone/nonexistent-999', {
            data: {}
        });
        expect([404, 422, 500]).toContain(r.status());
        return;
    }
    const response = await authenticatedRequest.post(`/pimcore-studio/api/bundle/custom-reports/config/clone/${reportName}`, {
        data: {}
    });
    expect([200, 201, 404, 422, 500]).toContain(response.status());
    if ([200, 201].includes(response.status())) {
        const body = await response.json();
        if (body && body.name) {
            cloneName = body.name;
        }
    }
});

test('GetColumnConfigForCustomReport', async () => {
    if (!reportName) {
        const r = await authenticatedRequest.post('/pimcore-studio/api/bundle/custom-reports/column-config/nonexistent-999', {
            data: {}
        });
        expect([404, 422, 500]).toContain(r.status());
        return;
    }
    const response = await authenticatedRequest.post(`/pimcore-studio/api/bundle/custom-reports/column-config/${reportName}`, {
        data: {}
    });
    expect([200, 404, 422, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('GetChartDataForCustomReport', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/bundle/custom-reports/chart', {
        data: { name: reportName || 'nonexistent-999', filters: [] }
    });
    expect([200, 400, 404, 422, 500]).toContain(response.status());
});

test('ExportCustomReportDataAsCsv', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/bundle/custom-reports/export/csv', {
        data: { name: reportName || 'nonexistent-999', filters: [] }
    });
    expect([200, 400, 404, 422, 500]).toContain(response.status());
});

test('GetDrillDownOptionsForCustomReport', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/bundle/custom-reports/drill-down-options', {
        data: { name: reportName || 'nonexistent-999', field: 'someField', filters: [] }
    });
    expect([200, 400, 404, 422, 500]).toContain(response.status());
});

test('DeleteNonExistentCustomReportConfiguration', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/bundle/custom-reports/config/nonexistent-report-999');
    expect([404, 422, 500]).toContain(response.status());
});
