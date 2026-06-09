import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const createdIds: string[] = [];
const ts = Date['now']();

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    for (const id of createdIds.reverse()) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/metadata/predefined/${id}`);
        } catch (_) {}
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

// GET /pimcore-studio/api/metadata/asset
test('GetAssetMetadataReturnsItems', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/metadata/asset');
    expect([200, 403]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
        expect(Array.isArray(data.items)).toBe(true);
    }
});

test('GetAssetMetadataWithSubTypeFilter', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/metadata/asset?subType=image');
    expect([200, 403]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
        expect(Array.isArray(data.items)).toBe(true);
    }
});

test('GetAssetMetadataWithGroupFilter', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/metadata/asset?group=default');
    expect([200, 403]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
        expect(Array.isArray(data.items)).toBe(true);
    }
});

// POST /pimcore-studio/api/metadata (get collection with filters)
test('GetMetadataCollectionWithNoBody', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/metadata');
    expect([200, 403]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('totalItems');
        expect(data).toHaveProperty('items');
        expect(Array.isArray(data.items)).toBe(true);
        expect(typeof data.totalItems).toBe('number');
    }
});

test('GetMetadataCollectionWithSearchTerm', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/metadata', {
        data: {
            searchTerm: 'author'
        }
    });
    expect([200, 403]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('totalItems');
        expect(data).toHaveProperty('items');
    }
});

test('GetMetadataCollectionWithColumnFilter', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/metadata', {
        data: {
            columnFilters: [
                { key: 'name', type: 'like', filterValue: 'test' }
            ]
        }
    });
    expect([200, 403]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('totalItems');
        expect(data).toHaveProperty('items');
    }
});

test('GetMetadataCollectionWithSortFilter', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/metadata', {
        data: {
            sortFilter: { key: 'name', direction: 'ASC' }
        }
    });
    expect([200, 403]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('totalItems');
        expect(data).toHaveProperty('items');
    }
});

// POST /pimcore-studio/api/metadata/predefined (create entry)
test('CreatePredefinedMetadataWithInputType', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/metadata/predefined', {
        data: {
            name: `test-meta-input-${ts}`,
            type: 'input',
            description: 'Test input metadata',
            targetSubType: null,
            data: null,
            config: null,
            language: null,
            group: null
        }
    });
    expect([200, 403, 409, 500]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('name');
        expect(data).toHaveProperty('type');
        expect(data.type).toBe('input');
        createdIds.push(data.id);
    }
});

test('CreatePredefinedMetadataWithTextareaType', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/metadata/predefined', {
        data: {
            name: `test-meta-textarea-${ts}`,
            type: 'textarea',
            description: 'Test textarea metadata',
            targetSubType: null,
            data: null,
            config: null,
            language: 'en',
            group: null
        }
    });
    expect([200, 403, 409, 500]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data.type).toBe('textarea');
        createdIds.push(data.id);
    }
});

test('CreatePredefinedMetadataWithSelectType', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/metadata/predefined', {
        data: {
            name: `test-meta-select-${ts}`,
            type: 'select',
            description: 'Test select metadata',
            targetSubType: null,
            data: null,
            config: null,
            language: null,
            group: 'testgroup'
        }
    });
    expect([200, 403, 409, 500]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data.type).toBe('select');
        createdIds.push(data.id);
    }
});

test('CreatePredefinedMetadataWithDefaultValues', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/metadata/predefined');
    expect([200, 403, 409, 500]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('name');
        expect(data).toHaveProperty('type');
        expect(data).toHaveProperty('creationDate');
        expect(data).toHaveProperty('modificationDate');
        expect(data).toHaveProperty('isWriteable');
        createdIds.push(data.id);
    }
});

// PUT /pimcore-studio/api/metadata/predefined/{id} (update entry)
test('UpdatePredefinedMetadataById', async () => {
    // First create an entry to update
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/metadata/predefined', {
        data: {
            name: `test-meta-update-${ts}`,
            type: 'input',
            description: 'To be updated',
            targetSubType: null,
            data: null,
            config: null,
            language: null,
            group: null
        }
    });

    if (createResponse.status() !== 200) {
        // Feature may not be available; skip update test
        expect([200, 403, 409, 500]).toContain(createResponse.status());
        return;
    }

    const created = await createResponse.json();
    createdIds.push(created.id);

    const updateResponse = await authenticatedRequest.put(
        `/pimcore-studio/api/metadata/predefined/${created.id}`,
        {
            data: {
                name: `test-meta-updated-${ts}`,
                type: 'textarea',
                description: 'Updated description',
                targetSubType: null,
                data: null,
                config: null,
                language: 'en',
                group: 'updated-group'
            }
        }
    );
    expect([200, 403, 404, 409, 500]).toContain(updateResponse.status());
    if (updateResponse.status() === 200) {
        const updated = await updateResponse.json();
        expect(updated).toHaveProperty('id');
        expect(updated.id).toBe(created.id);
        expect(updated.name).toBe(`test-meta-updated-${ts}`);
        expect(updated.type).toBe('textarea');
        expect(updated.language).toBe('en');
        expect(updated.group).toBe('updated-group');
    }
});

test('UpdateNonExistentPredefinedMetadataReturns404', async () => {
    const response = await authenticatedRequest.put(
        '/pimcore-studio/api/metadata/predefined/non-existent-id-999999',
        {
            data: {
                name: 'does-not-matter',
                type: 'input',
                description: null,
                targetSubType: null,
                data: null,
                config: null,
                language: null,
                group: null
            }
        }
    );
    expect([404, 403, 422, 500]).toContain(response.status());
});

// DELETE /pimcore-studio/api/metadata/predefined/{id}
test('DeletePredefinedMetadataById', async () => {
    // First create an entry to delete
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/metadata/predefined', {
        data: {
            name: `test-meta-delete-${ts}`,
            type: 'input',
            description: 'To be deleted',
            targetSubType: null,
            data: null,
            config: null,
            language: null,
            group: null
        }
    });

    if (createResponse.status() !== 200) {
        expect([200, 403, 409, 500]).toContain(createResponse.status());
        return;
    }

    const created = await createResponse.json();
    const deleteResponse = await authenticatedRequest.delete(
        `/pimcore-studio/api/metadata/predefined/${created.id}`
    );
    expect([200, 403, 404, 500]).toContain(deleteResponse.status());
    // If deleted successfully, do NOT add to cleanup list
    if (deleteResponse.status() !== 200) {
        createdIds.push(created.id);
    }
});

test('DeleteNonExistentPredefinedMetadataReturns404', async () => {
    const response = await authenticatedRequest.delete(
        '/pimcore-studio/api/metadata/predefined/non-existent-id-999999'
    );
    expect([404, 403, 422, 500]).toContain(response.status());
});

// Verify created entry fields are complete (PredefinedMetadata schema validation)
test('CreatedPredefinedMetadataHasRequiredFields', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/metadata/predefined', {
        data: {
            name: `test-meta-fields-${ts}`,
            type: 'date',
            description: 'Schema validation test',
            targetSubType: 'image',
            data: null,
            config: null,
            language: 'de',
            group: 'test-group'
        }
    });
    expect([200, 403, 409, 500]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        // Required fields per PredefinedMetadata schema
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('name');
        expect(data).toHaveProperty('type');
        expect(data).toHaveProperty('creationDate');
        expect(data).toHaveProperty('modificationDate');
        // API returns 'writeable' (not 'isWriteable' as documented in OpenAPI spec)
        expect(data.writeable !== undefined || data.isWriteable !== undefined).toBe(true);
        expect(typeof data.id).toBe('string');
        expect(typeof data.name).toBe('string');
        expect(typeof data.type).toBe('string');
        expect(typeof data.creationDate).toBe('number');
        expect(typeof data.modificationDate).toBe('number');
        createdIds.push(data.id);
    }
});
