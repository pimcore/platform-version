import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';
import * as path from 'path';
import * as fs from 'fs';

interface FolderNode {
  id: number;
  name: string;
  path: string;
  parentId: number;
  level: number;
}

interface AssetInfo {
  id: number;
  filename: string;
  path: string;
  folderId: number;
}

let authenticatedRequest: APIRequestContext;
let createdFolders: FolderNode[] = [];
let uploadedAssets: AssetInfo[] = [];
const testRootName = `recursive-test-${Date.now()}`;
let testRootId: number;

test.setTimeout(120000);

test.beforeAll(async ({ playwright }) => {
  authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
  for (const asset of uploadedAssets) {
    try {
      await authenticatedRequest.delete(`/pimcore-studio/api/elements/asset/delete/${asset.id}`);
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  const sortedFolders = createdFolders.sort((a, b) => b.level - a.level);
  
  for (const folder of sortedFolders) {
    try {
      await FolderHelper.deleteFolder(authenticatedRequest, folder.id);
    } catch (error) {
      // Ignore cleanup errors
    }
  }
  
  if (testRootId) {
    try {
      await FolderHelper.deleteFolder(authenticatedRequest, testRootId);
    } catch (error) {
      // Ignore cleanup errors
    }
  }
  
  await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('Create recursive folder structure, move folders, and verify paths', async () => {
  testRootId = await FolderHelper.createFolderAndGetId(
    authenticatedRequest,
    testRootName
  );
  
  await createThreeLevelStructure();
  await uploadAssetToFolder();
  await verifyFolderStructure();
  await testMoveOperation();
  await testDeleteOperation();
});

async function uploadAssetToFolder(): Promise<void> {
  const targetFolder = createdFolders.find(f => f.level === 3 && f.name.includes('level3-folder-1-1-1'));
  expect(targetFolder, 'Target folder for asset upload should exist').toBeDefined();
  
  if (!targetFolder) return;
  
  const assetPath = path.join(__dirname, '../assets/test_1.jpg');
  const assetBuffer = fs.readFileSync(assetPath);
  
  const uploadResponse = await authenticatedRequest.post(`/pimcore-studio/api/assets/add/${targetFolder.id}`, {
    multipart: {
      file: {
        name: 'test_1.jpg',
        mimeType: 'image/jpeg',
        buffer: assetBuffer
      }
    }
  });
  
  expect(uploadResponse.status()).toBe(200);
  
  const responseText = await uploadResponse.text();
  
  let uploadData;
  try {
    uploadData = JSON.parse(responseText);
  } catch (error) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const listResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/tree?parentId=${targetFolder.id}`);
    expect(listResponse.status()).toBe(200);
    const listData = await listResponse.json();
    
    const uploadedAsset = listData.items?.find(item => 
      item.filename === 'test_1.jpg' && item.type === 'asset'
    );
    
    expect(uploadedAsset, 'Uploaded asset should be found in folder').toBeDefined();
    
    if (uploadedAsset) {
      const assetInfo: AssetInfo = {
        id: uploadedAsset.id,
        filename: 'test_1.jpg',
        path: `${targetFolder.path}/test_1.jpg`,
        folderId: targetFolder.id
      };
      
      uploadedAssets.push(assetInfo);
    }
    return;
  }
  
  if (uploadData.id) {
    const assetInfo: AssetInfo = {
      id: uploadData.id,
      filename: 'test_1.jpg',
      path: `${targetFolder.path}/test_1.jpg`,
      folderId: targetFolder.id
    };
    uploadedAssets.push(assetInfo);
  } else if (uploadData.data?.id) {
    const assetInfo: AssetInfo = {
      id: uploadData.data.id,
      filename: 'test_1.jpg',
      path: `${targetFolder.path}/test_1.jpg`,
      folderId: targetFolder.id
    };
    uploadedAssets.push(assetInfo);
  } else {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const listResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/tree?parentId=${targetFolder.id}`);
    const listData = await listResponse.json();
    
    const uploadedAsset = listData.items?.find(item => 
      item.filename === 'test_1.jpg' && item.type === 'asset'
    );
    
    if (uploadedAsset) {
      const assetInfo: AssetInfo = {
        id: uploadedAsset.id,
        filename: 'test_1.jpg',
        path: `${targetFolder.path}/test_1.jpg`,
        folderId: targetFolder.id
      };
      uploadedAssets.push(assetInfo);
    }
  }
}

async function createThreeLevelStructure(): Promise<void> {
  for (let i = 1; i <= 2; i++) {
    const level1Name = `level1-folder-${i}`;
    const level1Id = await FolderHelper.createFolderAndGetId(
      authenticatedRequest,
      level1Name,
      testRootId,
      'asset',
      `/${testRootName}`
    );
    
    const level1Folder: FolderNode = {
      id: level1Id,
      name: level1Name,
      path: `/${testRootName}/${level1Name}`,
      parentId: testRootId,
      level: 1
    };
    createdFolders.push(level1Folder);
    
    for (let j = 1; j <= 2; j++) {
      const level2Name = `level2-folder-${i}-${j}`;
      const level2Id = await FolderHelper.createFolderAndGetId(
        authenticatedRequest,
        level2Name,
        level1Id,
        'asset',
        `/${testRootName}/${level1Name}`
      );
      
      const level2Folder: FolderNode = {
        id: level2Id,
        name: level2Name,
        path: `/${testRootName}/${level1Name}/${level2Name}`,
        parentId: level1Id,
        level: 2
      };
      createdFolders.push(level2Folder);
      
      for (let k = 1; k <= 2; k++) {
        const level3Name = `level3-folder-${i}-${j}-${k}`;
        const level3Id = await FolderHelper.createFolderAndGetId(
          authenticatedRequest,
          level3Name,
          level2Id,
          'asset',
          `/${testRootName}/${level1Name}/${level2Name}`
        );
        
        const level3Folder: FolderNode = {
          id: level3Id,
          name: level3Name,
          path: `/${testRootName}/${level1Name}/${level2Name}/${level3Name}`,
          parentId: level2Id,
          level: 3
        };
        createdFolders.push(level3Folder);
      }
    }
  }
  
  expect(createdFolders.length).toBe(14);
}

async function verifyFolderStructure(): Promise<void> {
  for (const folder of createdFolders) {
    const resolveResponse = await authenticatedRequest.get(
      `/pimcore-studio/api/elements/asset/resolve?searchTerm=${encodeURIComponent(folder.path)}`
    );
    
    expect(resolveResponse.status()).toBe(200);
    const resolveData = await resolveResponse.json();
    expect(resolveData.id).toBe(folder.id);
  }
}

async function testMoveOperation(): Promise<void> {
  const sourceFolder = createdFolders.find(f => f.level === 3 && f.name.includes('level3-folder-1-1-1'));
  expect(sourceFolder, 'Source folder should exist').toBeDefined();
  
  const targetFolder = createdFolders.find(f => f.level === 1 && f.name.includes('level1-folder-2'));
  expect(targetFolder, 'Target folder should exist').toBeDefined();
  
  if (!sourceFolder || !targetFolder) return;
  
  const assetInFolder = uploadedAssets.find(a => a.folderId === sourceFolder.id);
  expect(assetInFolder, 'Asset should exist in the folder being moved').toBeDefined();
  
  const moveResponse = await authenticatedRequest.patch('/pimcore-studio/api/assets', {
    data: {
      data: [{
        id: sourceFolder.id,
        parentId: targetFolder.id
      }]
    }
  });
  
  expect(moveResponse.status()).toBe(200);
  
  const newFolderPath = `/${testRootName}/${targetFolder.name}/${sourceFolder.name}`;
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const validateResponse = await authenticatedRequest.get(
    `/pimcore-studio/api/elements/asset/resolve?searchTerm=${encodeURIComponent(newFolderPath)}`
  );
  
  expect(validateResponse.status()).toBe(200);
  const validateData = await validateResponse.json();
  expect(validateData.id).toBe(sourceFolder.id);
  
  if (assetInFolder) {
    const newAssetPath = `${newFolderPath}/${assetInFolder.filename}`;
    
    const assetValidateResponse = await authenticatedRequest.get(
      `/pimcore-studio/api/elements/asset/resolve?searchTerm=${encodeURIComponent(newAssetPath)}`
    );
    
    expect(assetValidateResponse.status()).toBe(200);
    const assetValidateData = await assetValidateResponse.json();
    expect(assetValidateData.id).toBe(assetInFolder.id);
    
    const assetDetailsResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/${assetInFolder.id}`);
    expect(assetDetailsResponse.status()).toBe(200);
    const assetDetails = await assetDetailsResponse.json();
    expect(assetDetails.fullPath).toBe(newAssetPath);
    
    assetInFolder.path = newAssetPath;
    assetInFolder.folderId = targetFolder.id;
  }
  
  sourceFolder.path = newFolderPath;
  sourceFolder.parentId = targetFolder.id;
  sourceFolder.level = 2;
}

async function testDeleteOperation(): Promise<void> {
  const folderToDelete = createdFolders.find(f => 
    f.level === 2 && 
    f.name.includes('level2-folder-2-1') &&
    f.parentId !== testRootId
  );
  
  expect(folderToDelete, 'Folder to delete should exist').toBeDefined();
  
  if (!folderToDelete) return;
  
  const childrenToDelete = createdFolders.filter(f => f.parentId === folderToDelete.id);
  
  await FolderHelper.deleteFolder(authenticatedRequest, folderToDelete.id);
  
  const checkResponse = await authenticatedRequest.get(
    `/pimcore-studio/api/elements/asset/resolve?searchTerm=${encodeURIComponent(folderToDelete.path)}`
  );
  
  if (checkResponse.status() === 200) {
    const checkData = await checkResponse.json();
    expect(checkData.success).toBeFalsy();
  } else {
    expect(checkResponse.status()).not.toBe(200);
  }
  
  for (const child of childrenToDelete) {
    const childCheckResponse = await authenticatedRequest.get(
      `/pimcore-studio/api/elements/asset/resolve?searchTerm=${encodeURIComponent(child.path)}`
    );
    
    if (childCheckResponse.status() === 200) {
      const childCheckData = await childCheckResponse.json();
      expect(childCheckData.success).toBeFalsy();
    } else {
      expect(childCheckResponse.status()).not.toBe(200);
    }
  }
  
  createdFolders = createdFolders.filter(f => 
    f.id !== folderToDelete.id && !childrenToDelete.some(c => c.id === f.id)
  );
}
