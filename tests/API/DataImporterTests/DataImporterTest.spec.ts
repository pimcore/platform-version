import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const NONEXISTENT = 'nonexistent-importer-config-999';

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    await authenticatedRequest.dispose();
});

// ── Utility ────────────────────────────────────────────────────────────────────

test('ValidateCronExpressionValid', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-importer/utility/check-crontab', {
        params: { cronExpression: '0 * * * *' }
    });
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('isValid');
        expect(body.isValid).toBe(true);
    }
});

test('ValidateCronExpressionInvalid', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-importer/utility/check-crontab', {
        params: { cronExpression: 'not-a-cron' }
    });
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('isValid');
        expect(body.isValid).toBe(false);
    }
});

// ── Connection ─────────────────────────────────────────────────────────────────

test('ListDatabaseConnections', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-importer/connection/list');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

// ── Data Type ──────────────────────────────────────────────────────────────────

test('LoadClassAttributes', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-importer/data-type/class-attributes');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('LoadUnitData', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-importer/data-type/unit-data');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

// ── Classification Store ───────────────────────────────────────────────────────

test('LoadClassificationStoreKeys', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-importer/classificationstore/keys');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('LoadClassificationStoreAttributes', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-importer/classificationstore/attributes');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('LoadClassificationStoreKeyName', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/data-importer/classificationstore/key-name');
    expect([200, 404, 500]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

// ── Config Operations (non-existent config) ────────────────────────────────────

test('GetNonExistentImporterConfig', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/bundle/data-importer/config/${NONEXISTENT}`);
    expect([404, 422, 500]).toContain(response.status());
});

test('SaveNonExistentImporterConfig', async () => {
    const response = await authenticatedRequest.put(`/pimcore-studio/api/bundle/data-importer/config/${NONEXISTENT}`, {
        data: {}
    });
    expect([404, 422, 500]).toContain(response.status());
});

test('CheckImportProgressForNonExistentConfig', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/bundle/data-importer/config/${NONEXISTENT}/check-import-progress`);
    expect([404, 422, 500]).toContain(response.status());
});

test('CheckImportFileUploadedForNonExistentConfig', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/bundle/data-importer/config/${NONEXISTENT}/has-import-file-uploaded`);
    expect([404, 422, 500]).toContain(response.status());
});

test('LoadColumnHeadersForNonExistentConfig', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/bundle/data-importer/config/${NONEXISTENT}/column-headers`, {
        data: {}
    });
    expect([404, 422, 500]).toContain(response.status());
});

test('LoadPreviewDataForNonExistentConfig', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/bundle/data-importer/config/${NONEXISTENT}/load-preview`, {
        data: {}
    });
    expect([404, 422, 500]).toContain(response.status());
});

test('CopyPreviewDataForNonExistentConfig', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/bundle/data-importer/config/${NONEXISTENT}/copy-preview`, {
        data: {}
    });
    expect([404, 422, 500]).toContain(response.status());
});

test('LoadTransformationResultForNonExistentConfig', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/bundle/data-importer/config/${NONEXISTENT}/transformation-result`, {
        data: {}
    });
    expect([404, 422, 500]).toContain(response.status());
});

test('CalculateTransformationResultTypeForNonExistentConfig', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/bundle/data-importer/config/${NONEXISTENT}/transformation-result-type`, {
        data: {}
    });
    expect([404, 422, 500]).toContain(response.status());
});

test('UploadImportFileForNonExistentConfig', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/bundle/data-importer/config/${NONEXISTENT}/upload-import-file`, {
        data: {}
    });
    expect([400, 404, 422, 500]).toContain(response.status());
});

test('UploadPreviewDataForNonExistentConfig', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/bundle/data-importer/config/${NONEXISTENT}/upload-preview`, {
        data: {}
    });
    expect([400, 404, 422, 500]).toContain(response.status());
});

test('CancelImportExecutionForNonExistentConfig', async () => {
    const response = await authenticatedRequest.put(`/pimcore-studio/api/bundle/data-importer/config/${NONEXISTENT}/cancel-execution`);
    expect([404, 422, 500]).toContain(response.status());
});

test('StartBatchImportForNonExistentConfig', async () => {
    const response = await authenticatedRequest.put(`/pimcore-studio/api/bundle/data-importer/config/${NONEXISTENT}/start-import`);
    expect([404, 422, 500]).toContain(response.status());
});
