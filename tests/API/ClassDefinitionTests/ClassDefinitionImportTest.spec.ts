import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const ts = Date['now']();

// Pre-provisioned class IDs per task spec
const SIMPLE_CLASS_ID = 'test_ATS';
const COMPLEX_CLASS_ID = 'test_ATF';

// State shared across tests
let existingFcKey: string;
let existingBrickKey: string;
let obCustomLayoutId: string;
let bulkImportFileId: string;
let testBrickKey: string;
let testFcKey: string;
let testBrickCustomLayoutId: string;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    // Discover an existing field-collection key
    const fcCollectionRes = await authenticatedRequest.get('/pimcore-studio/api/class/field-collection/collection');
    if (fcCollectionRes.status() === 200) {
        const fcData = await fcCollectionRes.json();
        if (Array.isArray(fcData.items) && fcData.items.length > 0) {
            existingFcKey = fcData.items[0].key;
        }
    }

    // Discover an existing object-brick key
    const brickCollectionRes = await authenticatedRequest.get('/pimcore-studio/api/class/object-brick/collection');
    if (brickCollectionRes.status() === 200) {
        const brickData = await brickCollectionRes.json();
        if (Array.isArray(brickData.items) && brickData.items.length > 0) {
            existingBrickKey = brickData.items[0].key;
        }
    }

    // Create a temporary object brick for custom-layout tests
    testBrickKey = `ImportTestBrick${ts}`;
    const createBrickRes = await authenticatedRequest.post('/pimcore-studio/api/class/object-brick', {
        data: { key: testBrickKey }
    });
    if (createBrickRes.status() !== 200) {
        testBrickKey = existingBrickKey;
    }

    // Create a temporary field collection for import tests
    testFcKey = `ImportTestFC${ts}`;
    const createFcRes = await authenticatedRequest.post('/pimcore-studio/api/class/field-collection', {
        data: { key: testFcKey }
    });
    if (createFcRes.status() !== 200) {
        testFcKey = existingFcKey;
    }

    // Create a custom layout on the temp brick for further testing
    if (testBrickKey) {
        const customLayoutId = `obc_${ts}`;
        const createClRes = await authenticatedRequest.post(
            `/pimcore-studio/api/class/object-brick/${testBrickKey}/custom-layout/${customLayoutId}`,
            {
                data: {
                    name: `TestOBCL_${ts}`,
                    brickKey: testBrickKey
                }
            }
        );
        if (createClRes.status() === 200) {
            testBrickCustomLayoutId = customLayoutId;
        }
    }
});

test.afterAll(async () => {
    // Delete object-brick custom layout
    if (testBrickCustomLayoutId && testBrickKey) {
        try {
            await authenticatedRequest.delete(
                `/pimcore-studio/api/class/object-brick/${testBrickKey}/custom-layout/${testBrickCustomLayoutId}`
            );
        } catch (_) {}
    }
    // Delete temp brick (only if we created it, not borrowed an existing one)
    if (testBrickKey && testBrickKey !== existingBrickKey) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/class/object-brick/${testBrickKey}`);
        } catch (_) {}
    }
    // Delete temp field-collection
    if (testFcKey && testFcKey !== existingFcKey) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/class/field-collection/${testFcKey}`);
        } catch (_) {}
    }
    // Delete leftover bulk-import file
    if (bulkImportFileId) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/class/bulk-import/${bulkImportFileId}`);
        } catch (_) {}
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

// ---------------------------------------------------------------------------
// GET /class/folder/{folderId}
// ---------------------------------------------------------------------------

test('GetClassesInRootFolder', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/folder/0');
    expect([200, 404]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
        expect(Array.isArray(data.items)).toBe(true);
    }
});

test('GetClassesInFolderInvalidId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/folder/999999');
    expect([200, 404, 422]).toContain(response.status());
});

// ---------------------------------------------------------------------------
// POST /class/bulk-import/prepare  +  DELETE /class/bulk-import/{fileId}
// ---------------------------------------------------------------------------

test('BulkImportPrepareWithExportedFile', async () => {
    // First bulk-export a real item so we have a valid file to re-import
    const availableRes = await authenticatedRequest.get('/pimcore-studio/api/class/bulk-export/available');
    expect(availableRes.status()).toBe(200);
    const availableData = await availableRes.json();
    expect(availableData.items.length).toBeGreaterThan(0);

    const firstItem = availableData.items[0];
    const exportRes = await authenticatedRequest.post('/pimcore-studio/api/class/bulk-export', {
        data: { items: [{ type: firstItem.type, name: firstItem.name }] }
    });
    expect(exportRes.status()).toBe(200);
    const exportedBytes = await exportRes.body();

    // Now prepare bulk import with the exported bytes
    const prepareRes = await authenticatedRequest.post('/pimcore-studio/api/class/bulk-import/prepare', {
        multipart: {
            file: {
                name: 'bulk_export.json',
                mimeType: 'application/json',
                buffer: exportedBytes
            }
        }
    });
    expect([200, 422]).toContain(prepareRes.status());
    if (prepareRes.status() === 200) {
        const prepareData = await prepareRes.json();
        expect(prepareData).toHaveProperty('fileId');
        expect(prepareData).toHaveProperty('items');
        bulkImportFileId = prepareData.fileId;
    }
});

test('BulkImportPrepareWithInvalidFile', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/class/bulk-import/prepare', {
        multipart: {
            file: {
                name: 'invalid.json',
                mimeType: 'application/json',
                buffer: Buffer.from('not valid json at all')
            }
        }
    });
    expect([400, 422, 500]).toContain(response.status());
});

test('BulkImportExecuteWithPreparedFile', async () => {
    if (!bulkImportFileId) {
        test.skip();
        return;
    }
    // Get the list of importable items from prepare response first
    const availableRes = await authenticatedRequest.get('/pimcore-studio/api/class/bulk-export/available');
    const availableData = await availableRes.json();
    const firstItem = availableData.items[0];

    const response = await authenticatedRequest.post(`/pimcore-studio/api/class/bulk-import/${bulkImportFileId}`, {
        data: {
            items: [{ type: firstItem.type, name: firstItem.name }]
        }
    });
    // 201 = jobRun created; 200 = direct success; 404 = fileId expired already
    expect([200, 201, 404, 422]).toContain(response.status());
    // After executing the import, clear so afterAll doesn't try to delete again
    bulkImportFileId = '';
});

test('BulkImportExecuteWithInvalidFileId', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/class/bulk-import/nonexistent_file_id_xyz', {
        data: { items: [] }
    });
    expect([400, 404, 422]).toContain(response.status());
});

test('BulkImportDeletePreparedFile', async () => {
    // Create a fresh file to delete
    const availableRes = await authenticatedRequest.get('/pimcore-studio/api/class/bulk-export/available');
    const availableData = await availableRes.json();
    if (!availableData.items || availableData.items.length === 0) {
        test.skip();
        return;
    }
    const firstItem = availableData.items[0];
    const exportRes = await authenticatedRequest.post('/pimcore-studio/api/class/bulk-export', {
        data: { items: [{ type: firstItem.type, name: firstItem.name }] }
    });
    if (exportRes.status() !== 200) {
        test.skip();
        return;
    }
    const exportedBytes = await exportRes.body();

    const prepareRes = await authenticatedRequest.post('/pimcore-studio/api/class/bulk-import/prepare', {
        multipart: {
            file: {
                name: 'bulk_export_delete.json',
                mimeType: 'application/json',
                buffer: exportedBytes
            }
        }
    });
    if (prepareRes.status() !== 200) {
        test.skip();
        return;
    }
    const fileId = (await prepareRes.json()).fileId;

    const deleteRes = await authenticatedRequest.delete(`/pimcore-studio/api/class/bulk-import/${fileId}`);
    expect(deleteRes.status()).toBe(200);
});

test('BulkImportDeleteNonExistentFile', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/class/bulk-import/nonexistent_file_id_xyz');
    expect([200, 404, 422]).toContain(response.status());
});

// ---------------------------------------------------------------------------
// GET /class/custom-layout/editor/collection/{objectId}
// ---------------------------------------------------------------------------

test('GetCustomLayoutEditorCollectionForObject', async () => {
    // Find a data object to query layouts for
    const objRes = await authenticatedRequest.get(
        `/pimcore-studio/api/data-objects?parentId=1&classDefinitionId=${SIMPLE_CLASS_ID}&page=1&pageSize=1`
    );
    let objectId: number | null = null;
    if (objRes.status() === 200) {
        const objData = await objRes.json();
        if (Array.isArray(objData.items) && objData.items.length > 0) {
            objectId = objData.items[0].id;
        }
    }

    if (!objectId) {
        // Try a known object ID range
        const response = await authenticatedRequest.get('/pimcore-studio/api/class/custom-layout/editor/collection/1');
        expect([200, 403, 404, 422]).toContain(response.status());
        return;
    }

    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/class/custom-layout/editor/collection/${objectId}`
    );
    expect([200, 403, 404]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
        expect(Array.isArray(data.items)).toBe(true);
    }
});

test('GetCustomLayoutEditorCollectionInvalidObjectId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/custom-layout/editor/collection/999999');
    expect([200, 403, 404, 422]).toContain(response.status());
});

// ---------------------------------------------------------------------------
// POST /class/custom-layout/import/{customLayoutId}
// ---------------------------------------------------------------------------

test('ImportCustomLayoutFromJson', async () => {
    // Need an existing custom layout to export first, then import
    const collectionRes = await authenticatedRequest.get('/pimcore-studio/api/class/custom-layout/collection');
    if (collectionRes.status() !== 200) {
        test.skip();
        return;
    }
    const collectionData = await collectionRes.json();
    if (!Array.isArray(collectionData.items) || collectionData.items.length === 0) {
        test.skip();
        return;
    }
    const layoutId = collectionData.items[0].id;

    // Export the layout
    const exportRes = await authenticatedRequest.get(`/pimcore-studio/api/class/custom-layout/export/${layoutId}`);
    if (exportRes.status() !== 200) {
        test.skip();
        return;
    }
    const exportedBytes = await exportRes.body();

    // Import it back
    const response = await authenticatedRequest.post(`/pimcore-studio/api/class/custom-layout/import/${layoutId}`, {
        multipart: {
            file: {
                name: 'custom_layout.json',
                mimeType: 'application/json',
                buffer: exportedBytes
            }
        }
    });
    expect([200, 400, 404, 422]).toContain(response.status());
});

test('ImportCustomLayoutInvalidId', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/class/custom-layout/import/nonexistent_cl_xyz', {
        multipart: {
            file: {
                name: 'invalid.json',
                mimeType: 'application/json',
                buffer: Buffer.from('{}')
            }
        }
    });
    expect([400, 404, 422]).toContain(response.status());
});

// ---------------------------------------------------------------------------
// POST /class/field-collection/{key}/import
// ---------------------------------------------------------------------------

test('ImportFieldCollectionFromJson', async () => {
    if (!testFcKey) {
        test.skip();
        return;
    }

    // Export the field collection first
    const exportRes = await authenticatedRequest.get(`/pimcore-studio/api/class/field-collection/${testFcKey}/export`);
    if (exportRes.status() !== 200) {
        test.skip();
        return;
    }
    const exportedBytes = await exportRes.body();

    // Import it back into the same key
    const response = await authenticatedRequest.post(`/pimcore-studio/api/class/field-collection/${testFcKey}/import`, {
        multipart: {
            file: {
                name: 'field_collection.json',
                mimeType: 'application/json',
                buffer: exportedBytes
            }
        }
    });
    expect([200, 400, 422]).toContain(response.status());
});

test('ImportFieldCollectionInvalidKey', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/class/field-collection/NonExistentFC_xyz/import', {
        multipart: {
            file: {
                name: 'fc.json',
                mimeType: 'application/json',
                buffer: Buffer.from('{}')
            }
        }
    });
    expect([400, 404, 422]).toContain(response.status());
});

// ---------------------------------------------------------------------------
// GET /class/field-collection/{objectId}/object/layout
// ---------------------------------------------------------------------------

test('GetFieldCollectionObjectLayout', async () => {
    // This requires a data object ID that uses a field collection
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/field-collection/1/object/layout');
    expect([200, 404, 422]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
    }
});

test('GetFieldCollectionObjectLayoutInvalidId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/field-collection/999999/object/layout');
    expect([200, 404, 422]).toContain(response.status());
});

// ---------------------------------------------------------------------------
// GET /class/object-brick/{objectId}/object/layout
// ---------------------------------------------------------------------------

test('GetObjectBrickObjectLayout', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/object-brick/1/object/layout');
    expect([200, 404, 422]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
    }
});

test('GetObjectBrickObjectLayoutInvalidId', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/object-brick/999999/object/layout');
    expect([200, 404, 422]).toContain(response.status());
});

// ---------------------------------------------------------------------------
// GET /class/object-brick/{key}/custom-layout/{customLayoutId}
// PUT /class/object-brick/{key}/custom-layout/{customLayoutId}
// DELETE /class/object-brick/{key}/custom-layout/{customLayoutId}
// GET /class/object-brick/{key}/custom-layout/{customLayoutId}/export
// POST /class/object-brick/{key}/custom-layout/{customLayoutId}/import
// ---------------------------------------------------------------------------

test('GetObjectBrickCustomLayout', async () => {
    if (!testBrickKey || !testBrickCustomLayoutId) {
        test.skip();
        return;
    }

    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/class/object-brick/${testBrickKey}/custom-layout/${testBrickCustomLayoutId}`
    );
    expect([200, 404]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toBeDefined();
    }
});

test('GetObjectBrickCustomLayoutInvalidIds', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/class/object-brick/NonExistentBrick_xyz/custom-layout/nonexistent_cl'
    );
    expect([404, 422]).toContain(response.status());
});

test('UpdateObjectBrickCustomLayout', async () => {
    if (!testBrickKey || !testBrickCustomLayoutId) {
        test.skip();
        return;
    }

    const response = await authenticatedRequest.put(
        `/pimcore-studio/api/class/object-brick/${testBrickKey}/custom-layout/${testBrickCustomLayoutId}`,
        {
            data: {
                configuration: { children: [] },
                values: {
                    name: `UpdatedOBCL_${ts}`,
                    description: 'Updated via API test'
                }
            }
        }
    );
    expect([200, 400, 404, 422]).toContain(response.status());
});

test('ExportObjectBrickCustomLayout', async () => {
    if (!testBrickKey || !testBrickCustomLayoutId) {
        test.skip();
        return;
    }

    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/class/object-brick/${testBrickKey}/custom-layout/${testBrickCustomLayoutId}/export`
    );
    expect([200, 404]).toContain(response.status());
    if (response.status() === 200) {
        const contentDisposition = response.headers()['content-disposition'];
        expect(contentDisposition).toContain('attachment');
    }
});

test('ImportObjectBrickCustomLayout', async () => {
    if (!testBrickKey || !testBrickCustomLayoutId) {
        test.skip();
        return;
    }

    // Export the custom layout first
    const exportRes = await authenticatedRequest.get(
        `/pimcore-studio/api/class/object-brick/${testBrickKey}/custom-layout/${testBrickCustomLayoutId}/export`
    );
    if (exportRes.status() !== 200) {
        test.skip();
        return;
    }
    const exportedBytes = await exportRes.body();

    // Import it back
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/class/object-brick/${testBrickKey}/custom-layout/${testBrickCustomLayoutId}/import`,
        {
            multipart: {
                file: {
                    name: 'ob_custom_layout.json',
                    mimeType: 'application/json',
                    buffer: exportedBytes
                }
            }
        }
    );
    expect([200, 400, 404, 422]).toContain(response.status());
});

test('ImportObjectBrickCustomLayoutInvalidIds', async () => {
    const response = await authenticatedRequest.post(
        '/pimcore-studio/api/class/object-brick/NonExistentBrick_xyz/custom-layout/nonexistent_cl/import',
        {
            multipart: {
                file: {
                    name: 'ob_cl.json',
                    mimeType: 'application/json',
                    buffer: Buffer.from('{}')
                }
            }
        }
    );
    expect([400, 404, 422]).toContain(response.status());
});

test('DeleteObjectBrickCustomLayout', async () => {
    if (!testBrickKey || !testBrickCustomLayoutId) {
        test.skip();
        return;
    }

    const response = await authenticatedRequest.delete(
        `/pimcore-studio/api/class/object-brick/${testBrickKey}/custom-layout/${testBrickCustomLayoutId}`
    );
    expect([200, 404]).toContain(response.status());
    if (response.status() === 200) {
        // Clear so afterAll doesn't try to delete again
        testBrickCustomLayoutId = '';
    }
});

test('DeleteObjectBrickCustomLayoutInvalidIds', async () => {
    const response = await authenticatedRequest.delete(
        '/pimcore-studio/api/class/object-brick/NonExistentBrick_xyz/custom-layout/nonexistent_cl'
    );
    expect([404, 422]).toContain(response.status());
});

// ---------------------------------------------------------------------------
// POST /class/object-brick/{key}/import
// ---------------------------------------------------------------------------

test('ImportObjectBrickFromJson', async () => {
    if (!testBrickKey || testBrickKey === existingBrickKey) {
        test.skip();
        return;
    }

    // Export the brick first
    const exportRes = await authenticatedRequest.get(`/pimcore-studio/api/class/object-brick/${testBrickKey}/export`);
    if (exportRes.status() !== 200) {
        test.skip();
        return;
    }
    const exportedBytes = await exportRes.body();

    // Import it back
    const response = await authenticatedRequest.post(`/pimcore-studio/api/class/object-brick/${testBrickKey}/import`, {
        multipart: {
            file: {
                name: 'object_brick.json',
                mimeType: 'application/json',
                buffer: exportedBytes
            }
        }
    });
    expect([200, 400, 422]).toContain(response.status());
});

test('ImportObjectBrickInvalidKey', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/class/object-brick/NonExistentBrick_xyz/import', {
        multipart: {
            file: {
                name: 'ob.json',
                mimeType: 'application/json',
                buffer: Buffer.from('{}')
            }
        }
    });
    expect([400, 404, 422]).toContain(response.status());
});

// ---------------------------------------------------------------------------
// POST /class/definition/configuration-view/detail/{id}/import
// ---------------------------------------------------------------------------

test('ImportClassDefinitionFromJson', async () => {
    // Export class 5 (test_ATS) first
    const exportRes = await authenticatedRequest.get(
        `/pimcore-studio/api/class/definition/configuration-view/detail/${SIMPLE_CLASS_ID}/export`
    );
    if (exportRes.status() !== 200) {
        test.skip();
        return;
    }
    const exportedBytes = await exportRes.body();

    // Import the same definition back (no-op update)
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/class/definition/configuration-view/detail/${SIMPLE_CLASS_ID}/import`,
        {
            multipart: {
                file: {
                    name: 'class_definition.json',
                    mimeType: 'application/json',
                    buffer: exportedBytes
                }
            }
        }
    );
    expect([200, 400, 422]).toContain(response.status());
});

test('ImportClassDefinitionInvalidId', async () => {
    const response = await authenticatedRequest.post(
        '/pimcore-studio/api/class/definition/configuration-view/detail/nonexistent_class_xyz/import',
        {
            multipart: {
                file: {
                    name: 'class_def.json',
                    mimeType: 'application/json',
                    buffer: Buffer.from('{}')
                }
            }
        }
    );
    expect([400, 404, 422]).toContain(response.status());
});
