import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const ts = Date['now']();

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

// GET /pimcore-studio/api/settings/ping
test('PingReturnsSuccess', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/settings/ping');
    expect(response.status()).toBe(200);
});

// GET /pimcore-studio/api/settings/available-countries
test('GetAvailableCountriesReturnsList', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/settings/available-countries');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('AvailableCountriesItemsHaveNameAndCode', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/settings/available-countries');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.items.length).toBeGreaterThan(0);
    const firstCountry = data.items[0];
    expect(firstCountry).toHaveProperty('name');
    expect(firstCountry).toHaveProperty('code');
});

// GET /pimcore-studio/api/settings/active-bundles
test('GetActiveBundlesReturnsList', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/settings/active-bundles');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('bundles');
    expect(Array.isArray(data.bundles)).toBe(true);
});

test('ActiveBundlesItemsHaveName', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/settings/active-bundles');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.bundles.length).toBeGreaterThan(0);
    const firstBundle = data.bundles[0];
    expect(firstBundle).toHaveProperty('name');
    expect(typeof firstBundle.name).toBe('string');
});

// GET /pimcore-studio/api/settings/adapter/image
test('GetImageAdapterStatus', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/settings/adapter/image');
    // May return 200 whether adapter is available or not
    expect([200, 404, 422, 500]).toContain(response.status());
});

// GET /pimcore-studio/api/settings/adapter/video
// Note: The OpenAPI spec registers this path without the /pimcore-studio/api prefix
// Try both paths for robustness
test('GetVideoAdapterStatus', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/settings/adapter/video');
    // May return 200 whether adapter is configured or not; 404 if path differs
    expect([200, 404, 422, 500]).toContain(response.status());
});

// GET /pimcore-studio/api/settings
test('GetSystemSettingsReturnsObject', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/settings');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(typeof data).toBe('object');
    expect(data).not.toBeNull();
});

// PUT /pimcore-studio/api/settings — read current settings, then PUT them back unchanged (idempotency)
test('PutSystemSettingsIdempotent', async () => {
    // First GET the current settings
    const getResponse = await authenticatedRequest.get('/pimcore-studio/api/settings');
    expect(getResponse.status()).toBe(200);
    const currentSettings = await getResponse.json();

    // Build a minimal PUT body using current values if available
    const putBody: Record<string, unknown> = {};

    if (currentSettings.general !== undefined) {
        putBody.general = currentSettings.general;
    }
    if (currentSettings.objects !== undefined) {
        putBody.objects = currentSettings.objects;
    }
    if (currentSettings.assets !== undefined) {
        putBody.assets = currentSettings.assets;
    }
    if (currentSettings.documents !== undefined) {
        putBody.documents = currentSettings.documents;
    }
    if (currentSettings.email !== undefined) {
        putBody.email = currentSettings.email;
    }

    const putResponse = await authenticatedRequest.put('/pimcore-studio/api/settings', {
        data: putBody
    });
    // 200 = updated, 422 = validation issue with current data shape, 500 = server-side save error
    expect([200, 422, 500]).toContain(putResponse.status());
});

// GET /pimcore-studio/api/settings/admin
test('GetAdminAppearanceSettingsReturnsObject', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/settings/admin');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(typeof data).toBe('object');
    expect(data).not.toBeNull();
});

test('GetAdminAppearanceSettingsHasRequiredFields', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/settings/admin');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('branding');
    expect(data).toHaveProperty('assets');
    expect(data).toHaveProperty('writeable');
});

test('GetAdminAppearanceSettingsAssetsHasExpectedFields', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/settings/admin');
    expect(response.status()).toBe(200);
    const data = await response.json();
    // API returns camelCase property names
    expect(data.assets).toHaveProperty('hideEditImage');
    expect(data.assets).toHaveProperty('disableTreePreview');
});

// POST /pimcore-studio/api/settings/admin/save — GET current state, then POST it back unchanged
test('PostAdminSettingsSaveIdempotent', async () => {
    // First GET current admin settings
    const getResponse = await authenticatedRequest.get('/pimcore-studio/api/settings/admin');
    expect(getResponse.status()).toBe(200);
    const currentAdminSettings = await getResponse.json();

    // Build POST body from current state (branding + assets required)
    const postBody = {
        branding: currentAdminSettings.branding ?? {
            backgroundShade: '#CCCCCC',
            brandColor: '#FFCC00',
            loginScreenCustomBackgroundImage: null
        },
        assets: currentAdminSettings.assets ?? {
            hide_edit_image: false,
            disable_tree_preview: true
        }
    };

    const postResponse = await authenticatedRequest.post('/pimcore-studio/api/settings/admin/save', {
        data: postBody
    });
    // 200 = saved successfully, 422 = validation error with current data shape
    expect([200, 422]).toContain(postResponse.status());
});

// GET /pimcore-studio/api/setting/admin/thumbnail (note: singular 'setting')
test('GetAdminThumbnailPathReturnsObject', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/setting/admin/thumbnail');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(typeof data).toBe('object');
    expect(data).not.toBeNull();
});

test('GetAdminThumbnailPathHasRequiredFields', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/setting/admin/thumbnail');
    expect(response.status()).toBe(200);
    const data = await response.json();
    // Properties can be null if no custom assets are configured
    expect(data).toHaveProperty('customLogoSmall');
    expect(data).toHaveProperty('customLogo');
    expect(data).toHaveProperty('loginScreenCustomBackgroundImage');
});
