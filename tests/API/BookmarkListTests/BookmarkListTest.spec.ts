import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

const BL = '/pimcore-studio/api/bundle/backend-power-tools/bl';

let authenticatedRequest: APIRequestContext;
const createdListIds: number[] = [];
let primaryListId: number;
let folderId: number | null = null;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    const ts = Date['now']();
    const res = await authenticatedRequest.post(`${BL}/add`, {
        data: { name: `test-bl-primary-${ts}`, sortBy: 'name' },
    });
    expect(res.status()).toBe(200);
    const created = await res.json();
    primaryListId = created.id;
    createdListIds.push(primaryListId);
});

test.afterAll(async () => {
    for (const id of [...createdListIds].reverse()) {
        try {
            await authenticatedRequest.delete(`${BL}/${id}`);
        } catch (_) {}
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

// --- Collection ---

test('GetBookmarkListCollection', async () => {
    const res = await authenticatedRequest.post(`${BL}/`, {
        data: { filters: { page: 1, pageSize: 25 } },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('totalItems');
    expect(Array.isArray(data.items)).toBeTruthy();
});

test('GetBookmarkListCollectionWithSearch', async () => {
    const res = await authenticatedRequest.post(`${BL}/`, {
        data: { filters: { page: 1, pageSize: 25, searchTerm: 'test-bl-primary' } },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBeTruthy();
});

// --- CRUD ---

test('AddBookmarkListSortedByName', async () => {
    const ts = Date['now']();
    const res = await authenticatedRequest.post(`${BL}/add`, {
        data: { name: `test-bl-add-${ts}`, sortBy: 'name' },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('sortBy');
    expect(data).toHaveProperty('isOwner');
    createdListIds.push(data.id);
});

test('AddBookmarkListSortedManually', async () => {
    const ts = Date['now']();
    const res = await authenticatedRequest.post(`${BL}/add`, {
        data: { name: `test-bl-manual-${ts}`, sortBy: 'manual' },
    });
    expect([200, 422]).toContain(res.status());
    if (res.status() === 200) {
        const data = await res.json();
        expect(data).toHaveProperty('id');
        createdListIds.push(data.id);
    }
});

test('AddBookmarkListWithMissingName', async () => {
    const res = await authenticatedRequest.post(`${BL}/add`, {
        data: {},
    });
    expect([400, 422]).toContain(res.status());
});

test('GetBookmarkListById', async () => {
    const res = await authenticatedRequest.get(`${BL}/${primaryListId}`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.id).toBe(primaryListId);
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('sortBy');
    expect(data).toHaveProperty('isOwner');
    expect(data).toHaveProperty('itemCount');
});

test('GetBookmarkListByInvalidId', async () => {
    const res = await authenticatedRequest.get(`${BL}/999999`);
    expect([404, 422]).toContain(res.status());
});

test('UpdateBookmarkListName', async () => {
    const ts = Date['now']();
    const res = await authenticatedRequest.put(`${BL}/update/${primaryListId}`, {
        data: { name: `test-bl-updated-${ts}`, sortBy: 'name' },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('id');
    expect(data.id).toBe(primaryListId);
    expect(data.name).toContain('test-bl-updated-');
});

test('UpdateBookmarkListWithInvalidId', async () => {
    const res = await authenticatedRequest.put(`${BL}/update/999999`, {
        data: { name: 'doesnt-matter', sortBy: 'name' },
    });
    expect([404, 422]).toContain(res.status());
});

// --- Tree ---

test('GetBookmarkListTree', async () => {
    const res = await authenticatedRequest.get(`${BL}/${primaryListId}/tree`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBeTruthy();
    expect(data).toHaveProperty('totalItems');
});

test('AddFolderToBookmarkListTree', async () => {
    const res = await authenticatedRequest.post(`${BL}/${primaryListId}/tree/folder`, {
        data: { folderName: 'test-folder', parentId: 0 },
    });
    expect([200, 201]).toContain(res.status());

    // Retrieve folder ID for rename test
    const treeRes = await authenticatedRequest.get(`${BL}/${primaryListId}/tree`);
    if (treeRes.status() === 200) {
        const tree = await treeRes.json();
        const items: any[] = tree.items || [];
        const folder = items.find(
            (n: any) => n.key === 'test-folder' || n.text === 'test-folder' || n.name === 'test-folder',
        );
        if (folder) {
            folderId = folder.id;
        }
    }
});

test('RenameFolderInBookmarkListTree', async () => {
    if (!folderId) {
        test.skip();
        return;
    }
    const res = await authenticatedRequest.put(`${BL}/${primaryListId}/tree/folder`, {
        data: { folderName: 'test-folder-renamed', folderId },
    });
    expect([200, 201]).toContain(res.status());
});

test('AddItemsToBookmarkListTree', async () => {
    // Add the asset root folder (id=1) as a bookmark item
    const res = await authenticatedRequest.post(`${BL}/${primaryListId}/tree/items`, {
        data: {
            selectedNodes: [{ id: 1, type: 'asset' }],
            elementSortOrder: [],
        },
    });
    expect([200, 201, 422]).toContain(res.status());
});

test('RemoveItemsFromBookmarkListTree', async () => {
    const res = await authenticatedRequest.delete(`${BL}/${primaryListId}/tree/items`, {
        data: { nodesToRemove: [] },
    });
    expect([200, 201, 422]).toContain(res.status());
});

// --- Sharing ---

test('GetShareableUsers', async () => {
    const res = await authenticatedRequest.get(`${BL}/${primaryListId}/share/users`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('totalItems');
    expect(Array.isArray(data.items)).toBeTruthy();
});

test('GetShareRecipients', async () => {
    const res = await authenticatedRequest.get(`${BL}/${primaryListId}/share/recipients`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('totalItems');
    expect(Array.isArray(data.items)).toBeTruthy();
});

test('PatchShareRecipientsEmpty', async () => {
    const res = await authenticatedRequest.patch(`${BL}/${primaryListId}/share/recipients`, {
        data: { shares: [], deletedShares: [] },
    });
    expect([200, 201, 422]).toContain(res.status());
});

test('GetShareRecipientsForInvalidId', async () => {
    const res = await authenticatedRequest.get(`${BL}/999999/share/recipients`);
    expect([404, 422]).toContain(res.status());
});

// --- Delete ---

test('DeleteBookmarkList', async () => {
    const ts = Date['now']();
    const createRes = await authenticatedRequest.post(`${BL}/add`, {
        data: { name: `test-bl-delete-${ts}`, sortBy: 'name' },
    });
    expect(createRes.status()).toBe(200);
    const created = await createRes.json();

    const deleteRes = await authenticatedRequest.delete(`${BL}/${created.id}`);
    expect([200, 204]).toContain(deleteRes.status());

    const getRes = await authenticatedRequest.get(`${BL}/${created.id}`);
    expect([404, 422]).toContain(getRes.status());
});

test('DeleteBookmarkListWithInvalidId', async () => {
    const res = await authenticatedRequest.delete(`${BL}/999999`);
    expect([404, 422]).toContain(res.status());
});
