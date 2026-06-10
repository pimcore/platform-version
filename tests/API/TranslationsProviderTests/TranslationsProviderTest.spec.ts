import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const INVALID_JOB_ID = 999999999;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    await authenticatedRequest.dispose();
});

// ── Config ─────────────────────────────────────────────────────────────────────

test('GetTranslationsProviderConfig', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/translations-provider-interfaces/config');
    // Returns 200 if provider configured, 404 if bundle not installed, 422 if no provider
    expect([200, 404, 422]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

test('UpdateTranslationsProviderConfig', async () => {
    const response = await authenticatedRequest.put('/pimcore-studio/api/bundle/translations-provider-interfaces/config', {
        data: {}
    });
    expect([200, 404, 422]).toContain(response.status());
});

test('GetTranslationsProviderUiSettings', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/translations-provider-interfaces/config/ui-settings');
    expect([200, 404, 422]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(typeof body).toBe('object');
    }
});

// ── Translation Jobs - Views ───────────────────────────────────────────────────

test('GetTranslationJobsListView', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/view/list');
    expect([200, 404, 422]).toContain(response.status());
    if (response.status() === 200) {
        const ct = response.headers()['content-type'] ?? '';
        if (ct.includes('application/json')) {
            const body = await response.json();
            expect(typeof body).toBe('object');
        }
    }
});

test('GetTranslationJobsListViewWithFilter', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/view/list', {
        params: { page: 1, state: 'open' }
    });
    expect([200, 404, 422]).toContain(response.status());
});

test('GetTranslationJobResolveElements', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/view/resolve-elements');
    expect([200, 400, 404, 422]).toContain(response.status());
});

test('GetTranslationJobCompareResultView', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/view/compare-result-data/${INVALID_JOB_ID}`);
    expect([404, 422]).toContain(response.status());
});

// ── Translation Jobs - Data ────────────────────────────────────────────────────

test('GetTranslationJobExportData', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/data/${INVALID_JOB_ID}/export`);
    expect([404, 422]).toContain(response.status());
});

test('GetTranslationJobExportDataXml', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/data/${INVALID_JOB_ID}/export-xml`);
    expect([404, 422]).toContain(response.status());
});

test('GetTranslationJobResultData', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/data/${INVALID_JOB_ID}/result`);
    expect([404, 422]).toContain(response.status());
});

test('GetTranslationJobResultDataXml', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/data/${INVALID_JOB_ID}/result-xml`);
    expect([404, 422]).toContain(response.status());
});

// ── Translation Jobs - Actions ─────────────────────────────────────────────────

test('CancelNonExistentTranslationJob', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/action/${INVALID_JOB_ID}/cancel`);
    expect([404, 422]).toContain(response.status());
});

test('CheckRedeliveryForNonExistentTranslationJob', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/action/${INVALID_JOB_ID}/check-redelivery`);
    expect([404, 422]).toContain(response.status());
});

test('DeleteNonExistentTranslationJob', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/action/${INVALID_JOB_ID}/delete`);
    expect([404, 422]).toContain(response.status());
});

test('ProcessNonExistentTranslationJob', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/action/${INVALID_JOB_ID}/process`);
    expect([404, 422]).toContain(response.status());
});

test('ReceiveNonExistentTranslationJob', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/action/${INVALID_JOB_ID}/receive`);
    expect([404, 422]).toContain(response.status());
});

test('ResetErrorForNonExistentTranslationJob', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/action/${INVALID_JOB_ID}/reset-error`);
    expect([404, 422]).toContain(response.status());
});

test('SubmitNonExistentTranslationJob', async () => {
    const response = await authenticatedRequest.post(`/pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/action/${INVALID_JOB_ID}/submit`);
    expect([404, 422]).toContain(response.status());
});

// ── Translation Requests ───────────────────────────────────────────────────────

test('GetTranslationItemCount', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/bundle/translations-provider-interfaces/translation/get-item-count', {
        data: {}
    });
    expect([200, 400, 404, 422]).toContain(response.status());
    if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('count');
    }
});

test('RequestTranslationWithInvalidPayload', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/bundle/translations-provider-interfaces/translation/request', {
        data: {}
    });
    expect([200, 400, 404, 422]).toContain(response.status());
});
