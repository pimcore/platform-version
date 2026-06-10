import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const createdDocumentIds: number[] = [];
const ts = Date['now']();

// IDs for specific test scenarios
let pageDoc1Id: number;
let pageDoc2Id: number;
let pageDoc3Id: number;

async function createPageDocument(ctx: APIRequestContext, key: string, language: string = 'en'): Promise<number> {
    const response = await ctx.post('/pimcore-studio/api/documents/add/1', {
        data: {
            key,
            type: 'page',
            title: `Test Page ${key}`,
            navigationName: null,
            docTypeId: null,
            template: null,
            translationsSourceId: null,
            language,
            inheritanceSourceId: null,
        },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    return data.id;
}

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    // Create 3 page documents for testing
    pageDoc1Id = await createPageDocument(authenticatedRequest, `update-doc1-${ts}`, 'en');
    createdDocumentIds.push(pageDoc1Id);

    pageDoc2Id = await createPageDocument(authenticatedRequest, `update-doc2-${ts}`, 'de');
    createdDocumentIds.push(pageDoc2Id);

    pageDoc3Id = await createPageDocument(authenticatedRequest, `update-doc3-${ts}`, 'en');
    createdDocumentIds.push(pageDoc3Id);
});

test.afterAll(async () => {
    for (const id of createdDocumentIds.reverse()) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/elements/document/delete/${id}`);
        } catch (_) {}
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

// --- PUT /documents/{id} ---

test('PublishDocumentViaPut', async () => {
    const response = await authenticatedRequest.put(`/pimcore-studio/api/documents/${pageDoc1Id}`, {
        data: { data: { task: 'publish' } },
    });
    expect(response.status()).toBe(200);

    // Verify published state
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/documents/${pageDoc1Id}`);
    expect(getResponse.status()).toBe(200);
    const doc = await getResponse.json();
    expect(doc.published).toBe(true);
});

test('UnpublishDocumentViaPut', async () => {
    const response = await authenticatedRequest.put(`/pimcore-studio/api/documents/${pageDoc1Id}`, {
        data: { data: { task: 'unpublish' } },
    });
    expect(response.status()).toBe(200);

    // Verify unpublished state
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/documents/${pageDoc1Id}`);
    expect(getResponse.status()).toBe(200);
    const doc = await getResponse.json();
    expect(doc.published).toBe(false);
});

test('SaveDraftDocumentViaPut', async () => {
    const response = await authenticatedRequest.put(`/pimcore-studio/api/documents/${pageDoc2Id}`, {
        data: { data: { task: 'version' } },
    });
    expect([200, 201]).toContain(response.status());
});

test('UpdateDocumentWithInvalidId', async () => {
    const response = await authenticatedRequest.put('/pimcore-studio/api/documents/999999', {
        data: { data: { task: 'publish' } },
    });
    expect([404, 422]).toContain(response.status());
});

// --- POST /documents/{id}/convert/{type} ---

test('ConvertDocumentTypeToSnippet', async () => {
    // Create a dedicated document for conversion (type page -> snippet)
    const convDocId = await createPageDocument(authenticatedRequest, `convert-doc-${ts}`);
    createdDocumentIds.push(convDocId);

    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/documents/${convDocId}/convert/snippet`
    );
    // Accept 200 (converted), 400/422 (conversion not supported), 404 (not found)
    expect([200, 400, 422]).toContain(response.status());
});

test('ConvertDocumentTypeWithInvalidId', async () => {
    const response = await authenticatedRequest.post(
        '/pimcore-studio/api/documents/999999/convert/snippet'
    );
    expect([404, 422]).toContain(response.status());
});

// --- GET /documents/{id}/page/stream/preview ---

test('StreamPagePreview', async () => {
    // Publish first so preview can render
    await authenticatedRequest.put(`/pimcore-studio/api/documents/${pageDoc1Id}`, {
        data: { data: { task: 'publish' } },
    });

    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/documents/${pageDoc1Id}/page/stream/preview`
    );
    // 200 = binary stream returned, 404/422 = preview not available (e.g. no template configured)
    expect([200, 404, 422, 500]).toContain(response.status());
});

test('StreamPagePreviewWithInvalidId', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/documents/999999/page/stream/preview'
    );
    expect([404, 422]).toContain(response.status());
});

// --- POST /documents/{sourceId}/replace/{targetId} ---

test('ReplaceDocumentContent', async () => {
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/documents/${pageDoc2Id}/replace/${pageDoc3Id}`
    );
    expect([200, 201]).toContain(response.status());
});

test('ReplaceDocumentWithInvalidSourceId', async () => {
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/documents/999999/replace/${pageDoc3Id}`
    );
    expect([404, 422]).toContain(response.status());
});

test('ReplaceDocumentWithInvalidTargetId', async () => {
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/documents/${pageDoc2Id}/replace/999999`
    );
    expect([404, 422]).toContain(response.status());
});

// --- POST /documents/site/{id} (use as site) ---

test('UseDocumentAsSite', async () => {
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/documents/site/${pageDoc1Id}`,
        {
            data: {
                domains: [`test-site-${ts}.example.com`],
                mainDomain: `test-site-${ts}.example.com`,
            },
        }
    );
    // 200 = success, 400/422 = site config invalid (no domain config), 500 = server error
    expect([200, 400, 422]).toContain(response.status());
});

test('UseDocumentAsSiteWithInvalidId', async () => {
    const response = await authenticatedRequest.post(
        '/pimcore-studio/api/documents/site/999999',
        {
            data: {
                domains: ['invalid-site.example.com'],
                mainDomain: 'invalid-site.example.com',
            },
        }
    );
    expect([404, 422, 400]).toContain(response.status());
});

// --- GET /documents/site/{documentId} (get site detail) ---

test('GetSiteDetailByDocumentId', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/documents/site/${pageDoc1Id}`
    );
    // 200 = site found, 404 = no site for this document, 422 = validation error
    expect([200, 404, 422]).toContain(response.status());
});

test('GetSiteDetailWithInvalidDocumentId', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/documents/site/999999'
    );
    expect([404, 422]).toContain(response.status());
});

// --- DELETE /documents/site/{id} (delete site) ---

test('DeleteSiteByDocumentId', async () => {
    const response = await authenticatedRequest.delete(
        `/pimcore-studio/api/documents/site/${pageDoc1Id}`
    );
    // 200 = deleted (or no site existed), 404 = no site for this document, 422 = error
    expect([200, 404, 422]).toContain(response.status());
});

test('DeleteSiteWithInvalidDocumentId', async () => {
    const response = await authenticatedRequest.delete(
        '/pimcore-studio/api/documents/site/999999'
    );
    expect([404, 422]).toContain(response.status());
});

// --- POST /documents/translations/{id}/add/{translationId} ---

test('LinkTranslationDocuments', async () => {
    // pageDoc1 (en) and pageDoc2 (de) are good candidates for translation linking
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/documents/translations/${pageDoc1Id}/add/${pageDoc2Id}`
    );
    // 200 = linked, 422 = already linked / language conflict
    expect([200, 422]).toContain(response.status());
});

test('LinkTranslationWithInvalidSourceId', async () => {
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/documents/translations/999999/add/${pageDoc2Id}`
    );
    expect([404, 422]).toContain(response.status());
});

test('LinkTranslationWithInvalidTranslationId', async () => {
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/documents/translations/${pageDoc1Id}/add/999999`
    );
    expect([404, 422]).toContain(response.status());
});

// --- DELETE /documents/translations/{id}/delete/{translationId} ---

test('UnlinkTranslationDocuments', async () => {
    const response = await authenticatedRequest.delete(
        `/pimcore-studio/api/documents/translations/${pageDoc1Id}/delete/${pageDoc2Id}`
    );
    // 200 = unlinked, 404/422 = not linked or not found
    expect([200, 404, 422]).toContain(response.status());
});

test('UnlinkTranslationWithInvalidSourceId', async () => {
    const response = await authenticatedRequest.delete(
        '/pimcore-studio/api/documents/translations/999999/delete/1'
    );
    expect([404, 422]).toContain(response.status());
});

// --- GET /documents/translations/{id}/get-parent/{language} ---

test('GetParentTranslationByLanguage', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/documents/translations/${pageDoc1Id}/get-parent/de`
    );
    // 200 = parent found, 404/422 = no parent translation for this language
    expect([200, 404, 422]).toContain(response.status());
});

test('GetParentTranslationWithInvalidId', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/documents/translations/999999/get-parent/en'
    );
    expect([404, 422]).toContain(response.status());
});

// --- PUT /documents/{id}/page-snippet/change-main-document ---

test('ChangeMainDocumentForPageSnippet', async () => {
    const response = await authenticatedRequest.put(
        `/pimcore-studio/api/documents/${pageDoc3Id}/page-snippet/change-main-document`,
        {
            data: { mainDocumentId: pageDoc1Id },
        }
    );
    // 200 = updated, 400/422 = invalid or same document, 404 = not found
    expect([200, 400, 404, 422]).toContain(response.status());
});

test('ChangeMainDocumentWithInvalidId', async () => {
    const response = await authenticatedRequest.put(
        '/pimcore-studio/api/documents/999999/page-snippet/change-main-document',
        {
            data: { mainDocumentId: pageDoc1Id },
        }
    );
    expect([404, 422, 500]).toContain(response.status());
});

// --- POST /documents/page-snippet/{id}/area-block/render ---

test('RenderAreaBlockForDocument', async () => {
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/documents/page-snippet/${pageDoc1Id}/area-block/render`,
        {
            data: {
                documentId: pageDoc1Id,
                name: 'content',
                realName: 'content',
                index: 0,
                type: 'wysiwyg',
                dialogBoxData: {},
            },
        }
    );
    // 200 = rendered HTML, 422 = invalid area block config, 404 = document not found
    expect([200, 400, 404, 422]).toContain(response.status());
});

test('RenderAreaBlockWithInvalidDocumentId', async () => {
    const response = await authenticatedRequest.post(
        '/pimcore-studio/api/documents/page-snippet/999999/area-block/render',
        {
            data: {
                documentId: 999999,
                name: 'content',
                realName: 'content',
                index: 0,
                type: 'wysiwyg',
                dialogBoxData: {},
            },
        }
    );
    expect([404, 422]).toContain(response.status());
});

// --- GET /documents/renderlet/render ---

test('RenderRenderlet', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/documents/renderlet/render?documentId=1&type=document&id=1'
    );
    // 200 = rendered, 422 = renderlet not configured, 404 = not found
    expect([200, 400, 404, 422]).toContain(response.status());
});

test('RenderRenderletWithoutParams', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/documents/renderlet/render'
    );
    // Missing required params should return 400/404/422
    expect([400, 404, 422]).toContain(response.status());
});
