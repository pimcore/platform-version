import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;
let testFolderId: number;
let savedConfigurationId: number | null = null;
const ts = Date['now']();
const testFolderName = `asset-grid-test-${ts}`;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    testFolderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        testFolderName,
        1,
        'asset'
    );
});

test.afterAll(async () => {
    // Delete saved configuration if it was created
    if (savedConfigurationId !== null) {
        try {
            await authenticatedRequest.delete(
                `/pimcore-studio/api/assets/grid/configuration/${savedConfigurationId}/delete`
            );
        } catch (_) {}
    }

    // Delete the test folder
    try {
        await FolderHelper.deleteFolder(authenticatedRequest, testFolderId, 'asset');
    } catch (_) {}

    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetAvailableColumnsReturnsColumnList', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/assets/grid/available-columns'
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('columns');
    expect(Array.isArray(data.columns)).toBe(true);
});

test('GetAvailableColumnsColumnHasRequiredFields', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/assets/grid/available-columns'
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.columns.length).toBeGreaterThan(0);
    const firstColumn = data.columns[0];
    expect(firstColumn).toHaveProperty('key');
    expect(firstColumn).toHaveProperty('type');
});

test('GetSavedGridConfigurationsReturnsList', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/assets/grid/configurations'
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
    expect(typeof data.totalItems).toBe('number');
});

test('GetGridConfigurationByFolderIdReturnsDefaultConfig', async () => {
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/assets/grid/configuration/${testFolderId}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('columns');
    expect(data).toHaveProperty('pageSize');
});

test('GetGridConfigurationByInvalidFolderIdReturnsDefaultOrNotFound', async () => {
    const response = await authenticatedRequest.get(
        '/pimcore-studio/api/assets/grid/configuration/999999999'
    );
    // Server may return the default configuration (200) or a not-found error for an invalid folder
    expect([200, 404, 422]).toContain(response.status());
});

test('SaveGridConfigurationCreatesNewEntry', async () => {
    const configName = `test-config-${ts}`;
    const response = await authenticatedRequest.post(
        '/pimcore-studio/api/assets/grid/configuration/save',
        {
            data: {
                folderId: testFolderId,
                pageSize: 25,
                name: configName,
                description: `Test configuration created at ${ts}`,
                shareGlobal: false,
                setAsFavorite: false,
                saveFilter: false,
                sharedUsers: [],
                sharedRoles: [],
                columns: [
                    {
                        key: 'id',
                        locale: null,
                        group: ['system']
                    },
                    {
                        key: 'filename',
                        locale: null,
                        group: ['system']
                    }
                ],
                filter: null
            }
        }
    );
    expect([200, 201]).toContain(response.status());
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name');
    expect(data.name).toBe(configName);
    savedConfigurationId = data.id;
});

test('GetGridConfigurationByFolderIdWithConfigurationId', async () => {
    if (savedConfigurationId === null) {
        test.skip();
        return;
    }
    const response = await authenticatedRequest.get(
        `/pimcore-studio/api/assets/grid/configuration/${testFolderId}?configurationId=${savedConfigurationId}`
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('columns');
});

test('UpdateGridConfigurationModifiesExistingEntry', async () => {
    if (savedConfigurationId === null) {
        test.skip();
        return;
    }
    const updatedName = `updated-config-${ts}`;
    const response = await authenticatedRequest.put(
        `/pimcore-studio/api/assets/grid/configuration/update/${savedConfigurationId}`,
        {
            data: {
                folderId: testFolderId,
                pageSize: 50,
                name: updatedName,
                description: `Updated test configuration at ${ts}`,
                shareGlobal: false,
                setAsFavorite: false,
                saveFilter: false,
                sharedUsers: [],
                sharedRoles: [],
                columns: [
                    {
                        key: 'id',
                        locale: null,
                        group: ['system']
                    },
                    {
                        key: 'filename',
                        locale: null,
                        group: ['system']
                    },
                    {
                        key: 'size',
                        locale: null,
                        group: ['system']
                    }
                ],
                filter: null
            }
        }
    );
    expect([200, 204]).toContain(response.status());
});

test('UpdateGridConfigurationWithInvalidIdReturns404', async () => {
    const response = await authenticatedRequest.put(
        '/pimcore-studio/api/assets/grid/configuration/update/999999999',
        {
            data: {
                folderId: testFolderId,
                pageSize: 25,
                name: `nonexistent-config-${ts}`,
                description: 'This should not exist',
                shareGlobal: false,
                setAsFavorite: false,
                saveFilter: false,
                sharedUsers: [],
                sharedRoles: [],
                columns: [
                    {
                        key: 'id',
                        locale: null,
                        group: ['system']
                    }
                ],
                filter: null
            }
        }
    );
    expect([404, 422]).toContain(response.status());
});

test('SetGridConfigurationAsFavoriteSucceeds', async () => {
    if (savedConfigurationId === null) {
        test.skip();
        return;
    }
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/assets/grid/configuration/set-as-favorite/${savedConfigurationId}/${testFolderId}`
    );
    expect([200, 204]).toContain(response.status());
});

test('SetFavoriteWithInvalidConfigurationIdReturns404', async () => {
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/assets/grid/configuration/set-as-favorite/999999999/${testFolderId}`
    );
    expect([404, 422]).toContain(response.status());
});

test('RemoveFavoriteGridConfigurationSucceeds', async () => {
    if (savedConfigurationId === null) {
        test.skip();
        return;
    }
    const response = await authenticatedRequest.delete(
        `/pimcore-studio/api/assets/grid/configuration/remove-favorite/${savedConfigurationId}/${testFolderId}`
    );
    expect([200, 204]).toContain(response.status());
});

test('RemoveFavoriteWithInvalidConfigurationIdReturns404', async () => {
    const response = await authenticatedRequest.delete(
        `/pimcore-studio/api/assets/grid/configuration/remove-favorite/999999999/${testFolderId}`
    );
    expect([404, 422]).toContain(response.status());
});

test('PostGridReturnsItemsForFolder', async () => {
    const response = await authenticatedRequest.post(
        '/pimcore-studio/api/assets/grid',
        {
            data: {
                folderId: testFolderId,
                columns: [
                    {
                        key: 'id',
                        type: 'system.id',
                        locale: null,
                        group: ['system']
                    },
                    {
                        key: 'filename',
                        type: 'system.filename',
                        locale: null,
                        group: ['system']
                    }
                ],
                filters: {
                    page: 1,
                    pageSize: 25,
                    includeDescendants: false
                }
            }
        }
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
    expect(typeof data.totalItems).toBe('number');
});

test('PostGridWithMinimalColumnsReturnsTotalItems', async () => {
    const response = await authenticatedRequest.post(
        '/pimcore-studio/api/assets/grid',
        {
            data: {
                folderId: testFolderId,
                columns: [
                    {
                        key: 'id',
                        type: 'system.id',
                        locale: null,
                        group: ['system']
                    }
                ],
                filters: {
                    page: 1,
                    pageSize: 10,
                    includeDescendants: false
                }
            }
        }
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
});

test('PostGridWithInvalidFolderIdReturns404', async () => {
    const response = await authenticatedRequest.post(
        '/pimcore-studio/api/assets/grid',
        {
            data: {
                folderId: 999999999,
                filters: {
                    page: 1,
                    pageSize: 25,
                    includeDescendants: false
                }
            }
        }
    );
    expect([404, 422]).toContain(response.status());
});

test('PostGridWithIncludeDescendantsReturnsItems', async () => {
    const response = await authenticatedRequest.post(
        '/pimcore-studio/api/assets/grid',
        {
            data: {
                folderId: testFolderId,
                columns: [
                    {
                        type: 'system.id'
                    },
                    {
                        type: 'system.string',
                        key: 'filename'
                    }
                ],
                filters: {
                    page: 1,
                    pageSize: 5,
                    includeDescendants: true
                }
            }
        }
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
});

test('DeleteGridConfigurationRemovesEntry', async () => {
    if (savedConfigurationId === null) {
        test.skip();
        return;
    }
    const response = await authenticatedRequest.delete(
        `/pimcore-studio/api/assets/grid/configuration/${savedConfigurationId}/delete`
    );
    expect([200, 204]).toContain(response.status());
    // Mark as deleted so afterAll does not try again
    savedConfigurationId = null;
});

test('DeleteGridConfigurationWithInvalidIdReturns404', async () => {
    const response = await authenticatedRequest.delete(
        '/pimcore-studio/api/assets/grid/configuration/999999999/delete'
    );
    expect([404, 422]).toContain(response.status());
});
