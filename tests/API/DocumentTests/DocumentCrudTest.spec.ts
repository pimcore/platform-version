import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const createdDocumentIds: number[] = [];
const createdDocTypeIds: number[] = [];

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    // Delete created documents (reverse order)
    for (const id of createdDocumentIds.reverse()) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/elements/document/delete/${id}`);
        } catch (_) { /* ignore */ }
    }
    // Delete created doc types
    for (const id of createdDocTypeIds.reverse()) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/documents/doc-types/${id}`);
        } catch (_) { /* ignore */ }
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

// --- Document Types ---

test('GetDocumentTypes', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/documents/types');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBeTruthy();
    expect(data.items.length).toBeGreaterThan(0);
});

test('GetDocTypeTypes', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/documents/doc-types/types');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBeTruthy();
});

test('CreateDocType', async () => {
    const uniqueName = `TestDocType_${Date.now()}`;
    const response = await authenticatedRequest.post('/pimcore-studio/api/documents/doc-types/add', {
        data: { name: uniqueName, type: 'page' },
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.name).toBe(uniqueName);
    createdDocTypeIds.push(data.id);
});

test('ListDocTypes', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/documents/doc-types');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBeTruthy();
});

test('UpdateDocType', async () => {
    // Create a doc type to update
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/documents/doc-types/add', {
        data: { name: `UpdateDocType_${Date.now()}`, type: 'page' },
    });
    expect(createResponse.status()).toBe(200);
    const created = await createResponse.json();
    createdDocTypeIds.push(created.id);

    const updatedName = `Updated_${Date.now()}`;
    const updateResponse = await authenticatedRequest.put(`/pimcore-studio/api/documents/doc-types/${created.id}`, {
        data: {
            name: updatedName,
            type: 'page',
            group: null,
            controller: null,
            template: null,
            priority: 0,
            staticGeneratorEnabled: false,
        },
    });
    expect(updateResponse.status()).toBe(200);

    const updated = await updateResponse.json();
    expect(updated.name).toBe(updatedName);
});

test('DeleteDocType', async () => {
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/documents/doc-types/add', {
        data: { name: `DeleteDocType_${Date.now()}`, type: 'page' },
    });
    expect(createResponse.status()).toBe(200);
    const created = await createResponse.json();

    const deleteResponse = await authenticatedRequest.delete(`/pimcore-studio/api/documents/doc-types/${created.id}`);
    expect(deleteResponse.status()).toBe(200);
});

test('DeleteDocTypeWithInvalidId', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/documents/doc-types/999999');
    expect([404, 422, 500]).toContain(response.status());
});

// --- Documents CRUD ---

test('AddDocument', async () => {
    const uniqueKey = `test_doc_${Date.now()}`;
    const response = await authenticatedRequest.post('/pimcore-studio/api/documents/add/1', {
        data: {
            key: uniqueKey,
            type: 'page',
            title: 'Test Document',
            navigationName: null,
            docTypeId: null,
            template: null,
            translationsSourceId: null,
            language: 'en',
            inheritanceSourceId: null,
        },
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    createdDocumentIds.push(data.id);
});

test('GetDocumentById', async () => {
    // Create a document first
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/documents/add/1', {
        data: {
            key: `get_doc_${Date.now()}`,
            type: 'page',
            title: 'Get Test',
            navigationName: null,
            docTypeId: null,
            template: null,
            translationsSourceId: null,
            language: 'en',
            inheritanceSourceId: null,
        },
    });
    expect(createResponse.status()).toBe(200);
    const created = await createResponse.json();
    createdDocumentIds.push(created.id);

    const response = await authenticatedRequest.get(`/pimcore-studio/api/documents/${created.id}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.id).toBe(created.id);
});

test('GetDocumentTree', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/documents/tree?page=1&pageSize=10&parentId=1');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBeTruthy();
});

test('CloneDocument', async () => {
    // Create a document to clone
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/documents/add/1', {
        data: {
            key: `clone_src_${Date.now()}`,
            type: 'page',
            title: 'Clone Source',
            navigationName: null,
            docTypeId: null,
            template: null,
            translationsSourceId: null,
            language: 'en',
            inheritanceSourceId: null,
        },
    });
    expect(createResponse.status()).toBe(200);
    const source = await createResponse.json();
    createdDocumentIds.push(source.id);

    const cloneResponse = await authenticatedRequest.post(`/pimcore-studio/api/documents/${source.id}/clone/1`, {
        data: {
            language: null,
            enableInheritance: false,
            recursive: false,
            updateReferences: false,
        },
    });
    expect([200, 201]).toContain(cloneResponse.status());

    // Clone may return a job run ID (201) or the cloned document (200)
    const responseText = await cloneResponse.text();
    if (responseText) {
        try {
            const cloned = JSON.parse(responseText);
            if (cloned.id && !cloned.jobRunId) {
                createdDocumentIds.push(cloned.id);
            }
        } catch (_) { /* non-JSON response is OK */ }
    }
});

test('CheckPrettyUrl', async () => {
    // Create a document to test pretty URL
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/documents/add/1', {
        data: {
            key: `pretty_url_${Date.now()}`,
            type: 'page',
            title: 'Pretty URL Test',
            navigationName: null,
            docTypeId: null,
            template: null,
            translationsSourceId: null,
            language: 'en',
            inheritanceSourceId: null,
        },
    });
    expect(createResponse.status()).toBe(200);
    const created = await createResponse.json();
    createdDocumentIds.push(created.id);

    const response = await authenticatedRequest.post(`/pimcore-studio/api/documents/${created.id}/page/check-pretty-url`, {
        data: { prettyUrl: `/test-pretty-url-${Date.now()}` },
    });
    expect(response.status()).toBe(200);
});

test('GetAvailableControllers', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/documents/get-available-controllers');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBeTruthy();
});

test('GetAvailableTemplates', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/documents/get-available-templates');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBeTruthy();
});

test('ListAvailableSites', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/documents/sites/list-available');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBeTruthy();
});

test('GetDocumentTranslations', async () => {
    // Create a document
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/documents/add/1', {
        data: {
            key: `trans_doc_${Date.now()}`,
            type: 'page',
            title: 'Translation Test',
            navigationName: null,
            docTypeId: null,
            template: null,
            translationsSourceId: null,
            language: 'en',
            inheritanceSourceId: null,
        },
    });
    expect(createResponse.status()).toBe(200);
    const created = await createResponse.json();
    createdDocumentIds.push(created.id);

    const response = await authenticatedRequest.get(`/pimcore-studio/api/documents/translations/${created.id}`);
    // 200 if translations exist, 422 if translations not configured for this document
    expect([200, 422]).toContain(response.status());
});

test('GetDocumentByInvalidId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/documents/999999');
    expect([404, 500]).toContain(response.status());
});

test('AddDocumentWithMissingFields', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/documents/add/1', {
        data: {},
    });
    expect([400, 422]).toContain(response.status());
});
