import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';

let authenticatedRequest: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test('Create folder and add notes of different types to data-object folder', async () => {
    // First, get available note types for data-objects
    const noteTypesResponse = await authenticatedRequest.get('/pimcore-studio/api/notes/type/data-object');
    expect(noteTypesResponse.status()).toBe(200);
    
    const noteTypesData = await noteTypesResponse.json();
    const noteTypes = noteTypesData.items || [];
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
    
    // Create notes of different types
    const testNotes: Array<{title: string, description: string, type: string}> = [];
    
    // If we have note types from the API, use them
    if (noteTypes.length > 0) {
        for (const noteType of noteTypes) { // Use all note types
            const noteData = {
                title: `Test Note ${noteType.id}`,
                description: `Random content for ${noteType.id}: ${Math.random().toString(36).substring(7)}`,
                type: noteType.id
            };
            testNotes.push(noteData);
        }
    } else {
        // Default note types if API doesn't return any
        const defaultTypes = ['info', 'warning', 'error'];
        for (const type of defaultTypes) {
            const noteData = {
                title: `Test Note ${type}`,
                description: `Random content for ${type}: ${Math.random().toString(36).substring(7)}`,
                type: type
            };
            testNotes.push(noteData);
        }
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
    
    // Validate notes by fetching them from the API
    const fetchNotesResponse = await authenticatedRequest.get(`/pimcore-studio/api/notes/data-object/${folderId}?page=1&pageSize=100`);
    expect(fetchNotesResponse.status()).toBe(200);
    
    const fetchedNotesData = await fetchNotesResponse.json();
    const fetchedNotes = fetchedNotesData.items || [];
    
    // Validate that we have the same number of notes as created
    expect(fetchedNotes.length).toBe(testNotes.length);
    
    // Validate each created note exists in the fetched notes
    for (const testNote of testNotes) {
        const matchingNote = fetchedNotes.find((note: any) => 
            note.title === testNote.title && 
            note.description === testNote.description && 
            note.type === testNote.type
        );
        expect(matchingNote).toBeDefined();
        expect(matchingNote.title).toBe(testNote.title);
        expect(matchingNote.description).toBe(testNote.description);
        expect(matchingNote.type).toBe(testNote.type);
    }
    
    // Cleanup: Delete the created folder and its notes
    await FolderHelper.deleteFolder(authenticatedRequest, folderId, 'data-object');
});

test('Create folder and add notes of different types to asset folder', async () => {
    // First, get available note types for assets
    const noteTypesResponse = await authenticatedRequest.get('/pimcore-studio/api/notes/type/asset');
    expect(noteTypesResponse.status()).toBe(200);
    
    const noteTypesData = await noteTypesResponse.json();
    const noteTypes = noteTypesData.items || [];
    
    // Create a new folder in assets
    const folderData = {
        folderName: `TestAssetFolder_${Date.now()}`
    };
    
    const folderId = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        folderData.folderName
    );
    
    // Create notes of different types
    const testNotes: Array<{title: string, description: string, type: string}> = [];
    
    // If we have note types from the API, use them
    if (noteTypes.length > 0) {
        for (const noteType of noteTypes) { // Use all note types
            const noteData = {
                title: `Test Asset Note ${noteType.id}`,
                description: `Random content for ${noteType.id}: ${Math.random().toString(36).substring(7)}`,
                type: noteType.id
            };
            testNotes.push(noteData);
        }
    } else {
        // Default note types if API doesn't return any
        const defaultTypes = ['info', 'warning', 'error'];
        for (const type of defaultTypes) {
            const noteData = {
                title: `Test Asset Note ${type}`,
                description: `Random content for ${type}: ${Math.random().toString(36).substring(7)}`,
                type: type
            };
            testNotes.push(noteData);
        }
    }
    
    // Create each note
    for (const noteData of testNotes) {
        const createNoteResponse = await authenticatedRequest.post(`/pimcore-studio/api/notes/asset/${folderId}`, {
            data: noteData
        });
        
        expect(createNoteResponse.status()).toBe(200);
        
        const createdNote = await createNoteResponse.json();
        expect(createdNote.title).toBe(noteData.title);
        expect(createdNote.description).toBe(noteData.description);
        expect(createdNote.type).toBe(noteData.type);
    }
    
    // Validate notes by fetching them from the API
    const fetchNotesResponse = await authenticatedRequest.get(`/pimcore-studio/api/notes/asset/${folderId}?page=1&pageSize=100`);
    expect(fetchNotesResponse.status()).toBe(200);
    
    const fetchedNotesData = await fetchNotesResponse.json();
    const fetchedNotes = fetchedNotesData.items || [];
    
    // Validate that we have the same number of notes as created
    expect(fetchedNotes.length).toBe(testNotes.length);
    
    // Validate each created note exists in the fetched notes
    for (const testNote of testNotes) {
        const matchingNote = fetchedNotes.find((note: any) => 
            note.title === testNote.title && 
            note.description === testNote.description && 
            note.type === testNote.type
        );
        expect(matchingNote).toBeDefined();
        expect(matchingNote.title).toBe(testNote.title);
        expect(matchingNote.description).toBe(testNote.description);
        expect(matchingNote.type).toBe(testNote.type);
    }
    
    // Cleanup: Delete the created folder and its notes
    await FolderHelper.deleteFolder(authenticatedRequest, folderId);
});

test.afterAll(async () => {
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});