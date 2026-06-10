import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let testFolderId: number;
let savedConfigId: number;
const timestamp = Date.now();
const testFolderName = `do-gridcfg-test-${timestamp}`;
const configName = `test-grid-config-${timestamp}`;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    testFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        testFolderName,
        1,
        'data-object'
    );
});

test.afterAll(async () => {
    // Clean up config if it exists
    if (savedConfigId) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/data-object/grid/configuration/${savedConfigId}`);
        } catch (e) { /* ignore */ }
    }
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testFolderId, 'data-object');
    } catch (e) { /* ignore */ }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('SaveGridConfiguration', async () => {
    // Migrates k6 testSaveGridOptions (C3004)
    const saveResponse = await authenticatedRequest.post('/pimcore-studio/api/data-object/grid/configuration/save/test_ATS', {
        data: {
            folderId: testFolderId,
            pageSize: 25,
            name: configName,
            description: 'Test grid configuration',
            columns: [
                { key: 'id', locale: null, type: 'system.id', group: ['system'], config: [] },
                { key: 'fullpath', locale: null, type: 'system.string', group: ['system'], config: [] },
                { key: 'published', locale: null, type: 'system.boolean', group: ['system'], config: [] }
            ],
            shareGlobal: false,
            setAsFavorite: false,
            saveFilter: false
        }
    });
    expect(saveResponse.status()).toBe(200);

    const saveData = await saveResponse.json();
    expect(saveData.id).toBeDefined();
    expect(saveData.name).toBe(configName);
    savedConfigId = saveData.id;
});

test('GetGridConfiguration', async () => {
    // Migrates k6 testOpenGridOpensDialog (C3031) — get grid config
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/data-object/grid/configuration/${testFolderId}/test_ATS`
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.columns).toBeDefined();
    expect(Array.isArray(data.columns)).toBe(true);
    expect(data.pageSize).toBeDefined();
});

test('ListGridConfigurations', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/data-object/grid/configurations/test_ATS'
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.totalItems).toBeGreaterThan(0);
    expect(data.items).toBeDefined();

    // Find our saved config
    const ourConfig = data.items.find((item: any) => item.name === configName);
    expect(ourConfig).toBeDefined();
    expect(ourConfig.id).toBe(savedConfigId);
});

test('UpdateGridConfiguration', async () => {
    // Migrates k6 testChangeItemsPerPageInGrid (C3033)
    const updateResponse = await authenticatedRequest.put(
        `/pimcore-studio/api/data-object/grid/configuration/update/${savedConfigId}`, {
            data: {
                folderId: testFolderId,
                pageSize: 10,
                name: configName,
                description: 'Updated grid configuration',
                columns: [
                    { key: 'id', locale: null, type: 'system.id', group: ['system'], config: [] },
                    { key: 'fullpath', locale: null, type: 'system.string', group: ['system'], config: [] }
                ],
                shareGlobal: false,
                setAsFavorite: false,
                saveFilter: false
            }
        }
    );
    expect(updateResponse.status()).toBe(200);
});

test('SetAndRemoveFavorite', async () => {
    // Set as favorite
    const setResponse = await authenticatedRequest.post(
        `/pimcore-studio/api/data-object/grid/configuration/set-as-favorite/${savedConfigId}/${testFolderId}`
    );
    expect(setResponse.status()).toBe(200);

    // Remove favorite
    const removeResponse = await authenticatedRequest.delete(
        `/pimcore-studio/api/data-object/grid/configuration/remove-favorite/${savedConfigId}/${testFolderId}`
    );
    expect(removeResponse.status()).toBe(200);
});

test('DeleteGridConfiguration', async () => {
    const deleteResponse = await authenticatedRequest.delete(
        `/pimcore-studio/api/data-object/grid/configuration/${savedConfigId}`
    );
    expect(deleteResponse.status()).toBe(200);

    // Verify it's gone from the list
    const listResponse = await authenticatedRequest.get(
        '/pimcore-studio/api/data-object/grid/configurations/test_ATS'
    );
    expect(listResponse.status()).toBe(200);
    const data = await listResponse.json();
    const deleted = data.items.find((item: any) => item.id === savedConfigId);
    expect(deleted).toBeUndefined();

    // Reset so afterAll doesn't try to delete again
    savedConfigId = 0;
});
