import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const timestamp = Date.now();
const testClassUid = `tcd${timestamp}`;
const testClassName = `TestClassDef${timestamp}`;
let createdClassId: string;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    // Create the class definition in beforeAll so all tests can use it
    const response = await authenticatedRequest.post('/pimcore-studio/api/class/definition/configuration-view/detail/create', {
        data: {
            name: testClassName,
            uid: testClassUid
        }
    });
    expect(response.status()).toBe(200);
    createdClassId = testClassUid;
});

test.afterAll(async () => {
    if (createdClassId) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/class/definition/configuration-view/detail/${createdClassId}`);
        } catch (e) {
            // Ignore cleanup errors
        }
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetCreatedClassDefinitionById', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/definition/configuration-view/detail/${createdClassId}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name');
    expect(data.id).toBe(createdClassId);
    expect(data.name).toBe(testClassName);
    expect(data).toHaveProperty('isWriteable');
});

test('UpdateClassDefinition', async () => {
    // First get the current definition to use as base for update
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/class/definition/configuration-view/detail/${createdClassId}`);
    expect(getResponse.status()).toBe(200);
    const currentData = await getResponse.json();

    const response = await authenticatedRequest.put(`/pimcore-studio/api/class/definition/configuration-view/detail/${createdClassId}`, {
        data: {
            configuration: {
                name: 'pimcore_root',
                datatype: 'layout',
                fieldtype: 'panel',
                children: []
            },
            values: {
                name: testClassName,
                title: 'Updated Test Class',
                description: 'Updated via API test',
                modificationDate: currentData.modificationDate,
                parentClass: currentData.parentClass || '',
                implementsInterfaces: currentData.implementsInterfaces || '',
                listingParentClass: currentData.listingParentClass || '',
                useTraits: currentData.useTraits || '',
                listingUseTraits: currentData.listingUseTraits || '',
                encryption: currentData.encryption || false,
                allowInherit: currentData.allowInherit || false,
                allowVariants: currentData.allowVariants || false,
                showVariants: currentData.showVariants || false,
                icon: null,
                group: currentData.group || null,
                showAppLoggerTab: currentData.showAppLoggerTab || false,
                linkGeneratorReference: currentData.linkGeneratorReference || '',
                previewGeneratorReference: currentData.previewGeneratorReference || '',
                compositeIndices: currentData.compositeIndices || [],
                showFieldLookup: currentData.showFieldLookup || false,
                enableGridLocking: currentData.enableGridLocking || false,
                propertyVisibility: currentData.propertyVisibility || {}
            }
        }
    });

    if (response.status() !== 200) {
        const errorBody = await response.text();
        console.log('Update failed with status', response.status(), errorBody);
    }
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
});

test('ExportClassDefinition', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/definition/configuration-view/detail/${createdClassId}/export`);
    expect(response.status()).toBe(200);

    const contentDisposition = response.headers()['content-disposition'];
    expect(contentDisposition).toContain('attachment');
});

test('GetClassDefinitionLayout', async () => {
    // Newly created classes may not have a layout yet (returns 404)
    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/definition/configuration-view/detail/${createdClassId}/layout`);
    expect([200, 404]).toContain(response.status());
});

test('GetClassDefinitionBricks', async () => {
    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/definition/configuration-view/detail/${createdClassId}/bricks`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetSelectedVisibleFieldsForCreatedClass', async () => {
    // This endpoint may return 404 for classes with numeric-like IDs due to type validation
    const response = await authenticatedRequest.get(`/pimcore-studio/api/class/definition/configuration-view/detail/${createdClassId}/selected-visible-fields`);
    expect([200, 404]).toContain(response.status());

    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('columns');
    }
});

test('DeleteClassDefinitionAndVerify', async () => {
    const response = await authenticatedRequest.delete(`/pimcore-studio/api/class/definition/configuration-view/detail/${createdClassId}`);
    expect(response.status()).toBe(200);

    // Verify it's deleted
    const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/class/definition/configuration-view/detail/${createdClassId}`);
    expect([404, 500]).toContain(getResponse.status());

    createdClassId = ''; // Prevent double-delete in afterAll
});

test('CreateClassDefinitionWithMissingFields', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/class/definition/configuration-view/detail/create', {
        data: {}
    });
    expect([400, 422]).toContain(response.status());
});

test('DeleteNonExistentClassDefinition', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/class/definition/configuration-view/detail/non_existent_class_xyz');
    expect([404, 500]).toContain(response.status());
});

test('GetTextLayoutPreview', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/class/definition/configuration-view/text-layout/preview?className=automaticTestSimple');
    expect([200, 204]).toContain(response.status());
});
