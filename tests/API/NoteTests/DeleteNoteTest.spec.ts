import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test('Delete note from data-object element', async () => {
    const folderData = {
        folderName: `TestFolder_${Date.now()}`
    };
    
    const folderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        folderData.folderName,
        1,
        'data-object'
    );
    
    const noteTypesResponse = await authenticatedRequest.get('/pimcore-studio/api/notes/type/data-object');
    expect(noteTypesResponse.status()).toBe(200);
    const noteTypesData = await noteTypesResponse.json();
    const noteTypes = noteTypesData.items || [];
    
    const createdNoteIds: number[] = [];
    
    for (const noteType of noteTypes) {
        const noteData = {
            title: `Test Note ${noteType.id}`,
            description: `Test note for deletion: ${Math.random().toString(36).substring(7)}`,
            type: noteType.id
        };
        
        const createNoteResponse = await authenticatedRequest.post(`/pimcore-studio/api/notes/data-object/${folderId}`, {
            data: noteData
        });
        
        expect(createNoteResponse.status()).toBe(200);
        const createdNote = await createNoteResponse.json();
        createdNoteIds.push(createdNote.id);
    }
    
    for (const noteId of createdNoteIds) {
        const deleteResponse = await authenticatedRequest.delete(`/pimcore-studio/api/notes/${noteId}`);
        expect(deleteResponse.status()).toBe(200);
    }
    
    const fetchNotesResponse = await authenticatedRequest.get(`/pimcore-studio/api/notes/data-object/${folderId}?page=1&pageSize=100`);
    expect(fetchNotesResponse.status()).toBe(200);
    const fetchedNotesData = await fetchNotesResponse.json();
    const fetchedNotes = fetchedNotesData.items || [];
    
    expect(fetchedNotes.length).toBe(0);
    
    await FolderHelper.deleteFolder(authenticatedRequest, folderId, 'data-object');
});

test('Delete note from asset element', async () => {
    const folderData = {
        folderName: `TestAssetFolder_${Date.now()}`
    };
    
    const folderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        folderData.folderName
    );
    
    const noteTypesResponse = await authenticatedRequest.get('/pimcore-studio/api/notes/type/asset');
    expect(noteTypesResponse.status()).toBe(200);
    const noteTypesData = await noteTypesResponse.json();
    const noteTypes = noteTypesData.items || [];
    
    const createdNoteIds: number[] = [];
    
    for (const noteType of noteTypes) {
        const noteData = {
            title: `Test Asset Note ${noteType.id}`,
            description: `Test asset note for deletion: ${Math.random().toString(36).substring(7)}`,
            type: noteType.id
        };
        
        const createNoteResponse = await authenticatedRequest.post(`/pimcore-studio/api/notes/asset/${folderId}`, {
            data: noteData
        });
        
        expect(createNoteResponse.status()).toBe(200);
        const createdNote = await createNoteResponse.json();
        createdNoteIds.push(createdNote.id);
    }
    
    for (const noteId of createdNoteIds) {
        const deleteResponse = await authenticatedRequest.delete(`/pimcore-studio/api/notes/${noteId}`);
        expect(deleteResponse.status()).toBe(200);
    }
    
    const fetchNotesResponse = await authenticatedRequest.get(`/pimcore-studio/api/notes/asset/${folderId}?page=1&pageSize=100`);
    expect(fetchNotesResponse.status()).toBe(200);
    const fetchedNotesData = await fetchNotesResponse.json();
    const fetchedNotes = fetchedNotesData.items || [];
    
    expect(fetchedNotes.length).toBe(0);
    
    await FolderHelper.deleteFolder(authenticatedRequest, folderId);
});

test.afterAll(async () => {
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});