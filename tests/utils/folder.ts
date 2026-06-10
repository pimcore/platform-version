import { APIRequestContext, expect } from '@playwright/test';

export type FolderType = 'asset' | 'data-object';

export class FolderHelper {
    /**
     * Creates a new folder and returns its ID
     * @param request - Authenticated APIRequestContext
     * @param folderName - Name of the folder to create
     * @param parentId - ID of the parent folder (defaults to 1)
     * @param folderType - Type of folder to create: 'asset' or 'data-object' (defaults to 'asset')
     * @param parentPath - Path to the parent folder (optional, used for nested folders)
     * @returns Promise<number> - The ID of the created folder
     */
    static async createFolderAndGetId(
        request: APIRequestContext,
        folderName: string,
        parentId: number = 1,
        folderType: FolderType = 'asset',
        parentPath: string = ''
    ): Promise<number> {
        const endpoint = folderType === 'asset' 
            ? `/pimcore-studio/api/elements/asset/folder/${parentId}`
            : `/pimcore-studio/api/elements/data-object/folder/${parentId}`;
        
        // Create the folder
        const folderResponse = await request.post(endpoint, {
            data: {
                folderName: folderName
            }
        });
        expect(folderResponse.status()).toBe(200);

        // Build the search path
        const searchPath = parentPath ? `${parentPath}/${folderName}` : `/${folderName}`;
        
        // Get the folder ID by resolving the folder name
        const folderResolveResponse = await request.get(`/pimcore-studio/api/elements/${folderType}/resolve?searchTerm=${searchPath}`);
        expect(folderResolveResponse.status()).toBe(200);
        const folderData = await folderResolveResponse.json();
        
        expect(folderData.id).toBeDefined();
        expect(typeof folderData.id).toBe('number');
        
        return folderData.id;
    }

    /**
     * Creates multiple folders and returns their IDs
     * @param request - Authenticated APIRequestContext
     * @param folderNames - Array of folder names to create
     * @param parentId - ID of the parent folder (defaults to 1)
     * @param folderType - Type of folder to create: 'asset' or 'data-object' (defaults to 'asset')
     * @param parentPath - Path to the parent folder (optional, used for nested folders)
     * @returns Promise<number[]> - Array of folder IDs in the same order as folderNames
     */
    static async createFoldersAndGetIds(
        request: APIRequestContext,
        folderNames: string[],
        parentId: number = 1,
        folderType: FolderType = 'asset',
        parentPath: string = ''
    ): Promise<number[]> {
        const folderIds: number[] = [];
        
        for (const folderName of folderNames) {
            const folderId = await this.createFolderAndGetId(request, folderName, parentId, folderType, parentPath);
            folderIds.push(folderId);
        }
        
        return folderIds;
    }

    /**
     * Deletes a folder and all its contents
     * @param request - Authenticated APIRequestContext
     * @param folderId - ID of the folder to delete
     * @param folderType - Type of folder to delete: 'asset' or 'data-object' (defaults to 'asset')
     */
    static async deleteFolder(
        request: APIRequestContext, 
        folderId: number, 
        folderType: FolderType = 'asset'
    ): Promise<void> {
        const endpoint = `/pimcore-studio/api/elements/${folderType}/delete/${folderId}`;
        const deleteResponse = await request.delete(endpoint);
        // Note: Delete operations may return 200 or 201 depending on the content
        expect([200, 201]).toContain(deleteResponse.status());
    }

    /**
     * Deletes multiple folders
     * @param request - Authenticated APIRequestContext
     * @param folderIds - Array of folder IDs to delete
     * @param folderType - Type of folder to delete: 'asset' or 'data-object' (defaults to 'asset')
     */
    static async deleteFolders(
        request: APIRequestContext, 
        folderIds: number[], 
        folderType: FolderType = 'asset'
    ): Promise<void> {
        for (const folderId of folderIds) {
            await this.deleteFolder(request, folderId, folderType);
        }
    }
}
