import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test('Paginate notes for element by id with limit of 10', async () => {
    // Create a new folder in data-objects
    const folderData = {
        folderName: `TestFolder_${Date.now()}`
    };
    
    const folderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        folderData.folderName,
        1,
        'data-object'
    );
    
    // Get available note types for data-objects
    const noteTypesResponse = await authenticatedRequest.get('/pimcore-studio/api/notes/type/data-object');
    expect(noteTypesResponse.status()).toBe(200);
    
    const noteTypesData = await noteTypesResponse.json();
    const noteTypes = noteTypesData.items || [];
    
    // Create exactly 20 random notes
    const testNotes: Array<{title: string, description: string, type: string}> = [];
    const noteTypesToUse = noteTypes.length > 0 ? noteTypes : [{id: 'info'}, {id: 'warning'}, {id: 'error'}];
    
    for (let i = 0; i < 20; i++) {
        // Cycle through available note types
        const selectedType = noteTypesToUse[i % noteTypesToUse.length];
        const noteData = {
            title: `Test Note ${i + 1}`,
            description: `Random content for note ${i + 1}: ${Math.random().toString(36).substring(7)}`,
            type: selectedType.id
        };
        testNotes.push(noteData);
    }
    
    // Create each note
    for (const noteData of testNotes) {
        const createNoteResponse = await authenticatedRequest.post(`/pimcore-studio/api/notes/data-object/${folderId}`, {
            data: noteData
        });
        
        expect(createNoteResponse.status()).toBe(200);
        
        const createdNote = await createNoteResponse.json();
        expect(createdNote.title).toBe(noteData.title);
        expect(createdNote.description).toBe(noteData.description);
        expect(createdNote.type).toBe(noteData.type);
    }
    
    // Test pagination with limit of 10
    const pageSize = 10;
    
    // Get first page
    const firstPageResponse = await authenticatedRequest.get(`/pimcore-studio/api/notes/data-object/${folderId}?page=1&pageSize=${pageSize}`);
    expect(firstPageResponse.status()).toBe(200);
    
    const firstPageData = await firstPageResponse.json();
    expect(firstPageData.totalItems).toBe(20);
    expect(firstPageData.items.length).toBe(10);
    
    // Get second page
    const secondPageResponse = await authenticatedRequest.get(`/pimcore-studio/api/notes/data-object/${folderId}?page=2&pageSize=${pageSize}`);
    expect(secondPageResponse.status()).toBe(200);
    
    const secondPageData = await secondPageResponse.json();
    expect(secondPageData.totalItems).toBe(20);
    expect(secondPageData.items.length).toBe(10);
    
    // Verify pagination calculations
    const totalPages = Math.ceil(20 / pageSize);
    expect(totalPages).toBe(2);
    
    // Verify that notes from first page are different from second page
    const firstPageNoteIds = firstPageData.items.map((note: any) => note.id);
    const secondPageNoteIds = secondPageData.items.map((note: any) => note.id);
    
    // Check that there are no duplicate note IDs between pages
    const duplicateIds = firstPageNoteIds.filter((id: any) => secondPageNoteIds.includes(id));
    expect(duplicateIds.length).toBe(0);
    
    // Test that page 3 should be empty or return appropriate response
    const thirdPageResponse = await authenticatedRequest.get(`/pimcore-studio/api/notes/data-object/${folderId}?page=3&pageSize=${pageSize}`);
    expect(thirdPageResponse.status()).toBe(200);
    
    const thirdPageData = await thirdPageResponse.json();
    expect(thirdPageData.totalItems).toBe(20);
    expect(thirdPageData.items.length).toBe(0);
    
    // Verify total items consistency across all pages
    expect(firstPageData.totalItems).toBe(20);
    expect(secondPageData.totalItems).toBe(20);
    expect(thirdPageData.totalItems).toBe(20);
    
    // Cleanup: Delete the created folder and its notes
    await FolderHelper.deleteFolder(authenticatedRequest, folderId, 'data-object');
});

test('Test sort order by id, type, and date for notes', async () => {
    // Create a new folder in data-objects
    const folderData = {
        folderName: `TestSortFolder_${Date.now()}`
    };
    
    const folderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        folderData.folderName,
        1,
        'data-object'
    );
    
    // Get available note types for data-objects
    const noteTypesResponse = await authenticatedRequest.get('/pimcore-studio/api/notes/type/data-object');
    expect(noteTypesResponse.status()).toBe(200);
    
    const noteTypesData = await noteTypesResponse.json();
    const noteTypes = noteTypesData.items || [];
    const noteTypesToUse = noteTypes.length > 0 ? noteTypes : [{id: 'info'}, {id: 'warning'}, {id: 'error'}];
    
    // Create 10 notes with different types and add small delays to ensure different creation times
    const testNotes: Array<{title: string, description: string, type: string}> = [];
    
    for (let i = 0; i < 10; i++) {
        const selectedType = noteTypesToUse[i % noteTypesToUse.length];
        const noteData = {
            title: `Sort Test Note ${i + 1}`,
            description: `Sort test content ${i + 1}: ${Math.random().toString(36).substring(7)}`,
            type: selectedType.id
        };
        testNotes.push(noteData);
        
        // Create the note
        const createNoteResponse = await authenticatedRequest.post(`/pimcore-studio/api/notes/data-object/${folderId}`, {
            data: noteData
        });
        
        expect(createNoteResponse.status()).toBe(200);
        
        // Add a small delay to ensure different creation timestamps
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Test sorting by ID ascending
    const sortByIdAscResponse = await authenticatedRequest.get(`/pimcore-studio/api/notes/data-object/${folderId}?page=1&pageSize=10&sortBy=id&sortOrder=ASC`);
    expect(sortByIdAscResponse.status()).toBe(200);
    
    const sortByIdAscData = await sortByIdAscResponse.json();
    const notesByIdAsc = sortByIdAscData.items;
    
    // Verify ascending order by ID
    for (let i = 0; i < notesByIdAsc.length - 1; i++) {
        expect(notesByIdAsc[i].id).toBeLessThan(notesByIdAsc[i + 1].id);
    }
    
    // Test sorting by ID descending
    const sortByIdDescResponse = await authenticatedRequest.get(`/pimcore-studio/api/notes/data-object/${folderId}?page=1&pageSize=10&sortBy=id&sortOrder=DESC`);
    expect(sortByIdDescResponse.status()).toBe(200);
    
    const sortByIdDescData = await sortByIdDescResponse.json();
    const notesByIdDesc = sortByIdDescData.items;
    
    // Verify descending order by ID
    for (let i = 0; i < notesByIdDesc.length - 1; i++) {
        expect(notesByIdDesc[i].id).toBeGreaterThan(notesByIdDesc[i + 1].id);
    }
    
    // Test sorting by type ascending
    const sortByTypeAscResponse = await authenticatedRequest.get(`/pimcore-studio/api/notes/data-object/${folderId}?page=1&pageSize=10&sortBy=type&sortOrder=ASC`);
    expect(sortByTypeAscResponse.status()).toBe(200);
    
    const sortByTypeAscData = await sortByTypeAscResponse.json();
    const notesByTypeAsc = sortByTypeAscData.items;
    
    // Verify ascending order by type
    for (let i = 0; i < notesByTypeAsc.length - 1; i++) {
        expect(notesByTypeAsc[i].type.localeCompare(notesByTypeAsc[i + 1].type)).toBeLessThanOrEqual(0);
    }
    
    // Test sorting by type descending
    const sortByTypeDescResponse = await authenticatedRequest.get(`/pimcore-studio/api/notes/data-object/${folderId}?page=1&pageSize=10&sortBy=type&sortOrder=DESC`);
    expect(sortByTypeDescResponse.status()).toBe(200);
    
    const sortByTypeDescData = await sortByTypeDescResponse.json();
    const notesByTypeDesc = sortByTypeDescData.items;
    
    // Verify descending order by type
    for (let i = 0; i < notesByTypeDesc.length - 1; i++) {
        expect(notesByTypeDesc[i].type.localeCompare(notesByTypeDesc[i + 1].type)).toBeGreaterThanOrEqual(0);
    }
    
    // Test sorting by date ascending
    const sortByDateAscResponse = await authenticatedRequest.get(`/pimcore-studio/api/notes/data-object/${folderId}?page=1&pageSize=10&sortBy=date&sortOrder=ASC`);
    expect(sortByDateAscResponse.status()).toBe(200);
    
    const sortByDateAscData = await sortByDateAscResponse.json();
    const notesByDateAsc = sortByDateAscData.items;
    
    // Verify ascending order by date
    for (let i = 0; i < notesByDateAsc.length - 1; i++) {
        expect(notesByDateAsc[i].date).toBeLessThanOrEqual(notesByDateAsc[i + 1].date);
    }
    
    // Test sorting by date descending
    const sortByDateDescResponse = await authenticatedRequest.get(`/pimcore-studio/api/notes/data-object/${folderId}?page=1&pageSize=10&sortBy=date&sortOrder=DESC`);
    expect(sortByDateDescResponse.status()).toBe(200);
    
    const sortByDateDescData = await sortByDateDescResponse.json();
    const notesByDateDesc = sortByDateDescData.items;
    
    // Verify descending order by date
    for (let i = 0; i < notesByDateDesc.length - 1; i++) {
        expect(notesByDateDesc[i].date).toBeGreaterThanOrEqual(notesByDateDesc[i + 1].date);
    }
    
    // Verify that different sort orders return different arrangements
    expect(notesByIdAsc[0].id).not.toBe(notesByIdDesc[0].id);
    expect(notesByDateAsc[0].date).toBeLessThanOrEqual(notesByDateDesc[0].date);
    
    // Verify that all sorting methods return the same total count
    expect(sortByIdAscData.totalItems).toBe(10);
    expect(sortByIdDescData.totalItems).toBe(10);
    expect(sortByTypeAscData.totalItems).toBe(10);
    expect(sortByTypeDescData.totalItems).toBe(10);
    expect(sortByDateAscData.totalItems).toBe(10);
    expect(sortByDateDescData.totalItems).toBe(10);
    
    // Cleanup: Delete the created folder and its notes
    await FolderHelper.deleteFolder(authenticatedRequest, folderId, 'data-object');
});

test.afterAll(async () => {
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});