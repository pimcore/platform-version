import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import { FolderHelper } from '../../utils/folder';
import * as fs from 'fs';
import * as path from 'path';

interface Asset {
  filename: string;
  type: string;
}

interface AssetConfig {
  assets: Asset[];
}

interface AssetUploadResult {
  filename: string;
  id: number;
  expectedType: string;
}

interface AssetTreeItem {
  id: number;
  filename: string;
  mimeType: string;
  imageThumbnailPath?: string;
  fullPath: string;
  type: string;
}

let authenticatedRequest: APIRequestContext;
let testConfig: AssetConfig;
let uploadedAssets: AssetUploadResult[] = [];

test.beforeAll(async ({ playwright }) => {
  authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
  
  // Load asset config
  const configPath = path.join(__dirname, 'asset-config.json');
  const configContent = fs.readFileSync(configPath, 'utf8');
  testConfig = JSON.parse(configContent) as AssetConfig;
});

test.afterAll(async () => {
  await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('Upload all assets and verify in assets tree API', async () => {
  const timestamp = Date.now();
  const folderName = `upload-assets-tree-test-${timestamp}`;

  // Create a folder to upload assets to
  const folderId = await FolderHelper.createFolderAndGetId(
    authenticatedRequest,
    folderName
  );

  const uploadPromises = testConfig.assets.map(async (asset) => {
    try {
      const assetPath = path.join(__dirname, './../assets', asset.filename);
      const assetData = fs.readFileSync(assetPath);
      
      const mimeType = getMimeTypeFromFilename(asset.filename);
      
      const uploadResponse = await authenticatedRequest.post(`/pimcore-studio/api/assets/add/${folderId}`, {
        multipart: {
          file: {
            name: asset.filename,
            mimeType: mimeType,
            buffer: assetData
          }
        }
      });

      expect(uploadResponse.status()).toBe(200);
      
      const uploadData = await uploadResponse.json();
      expect(uploadData.id).toBeDefined();
      expect(typeof uploadData.id).toBe('number');
      
      return {
        filename: asset.filename,
        id: uploadData.id,
        expectedType: asset.type
      };
    } catch (error) {
      console.error(`Failed to upload asset ${asset.filename}: ${error}`);
      return null;
    }
  });

  const results = await Promise.all(uploadPromises);
  uploadedAssets = results.filter(result => result !== null) as AssetUploadResult[];
  
  const waitTime = Math.min(2000, uploadedAssets.length * 200);
  await new Promise(resolve => setTimeout(resolve, waitTime));

  const treeResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/tree?page=1&pageSize=100&parentId=${folderId}&excludeFolders=false`);
  expect(treeResponse.status()).toBe(200);
  
  const treeData = await treeResponse.json();
  expect(treeData.items).toBeDefined();
  expect(Array.isArray(treeData.items)).toBe(true);
  for (const uploadedAsset of uploadedAssets) {
    const { filename, id: assetId, expectedType } = uploadedAsset;
    
    const treeItem = treeData.items.find((item: AssetTreeItem) => item.id === assetId);
    expect(treeItem, `Asset ${filename} should be found in tree API response`).toBeDefined();
    expect(treeItem.filename).toBe(filename);
    
    const assetResponse = await authenticatedRequest.get(`/pimcore-studio/api/assets/${assetId}`);
    expect(assetResponse.status(), `Asset ${filename} details should be accessible`).toBe(200);
    const assetData = await assetResponse.json();
    
    expect(assetData.type).toBeDefined();
    
    const fileExtensionToTypeMap = {
      '.jpg': 'image',
      '.jpeg': 'image',
      '.png': 'image',
      '.gif': 'image',
      '.svg': 'image',
      '.tif': 'image',
      '.tiff': 'image',
      '.psd': 'image',
      '.pdf': 'document',
      '.doc': 'document',
      '.docx': 'document',
      '.xls': 'document',
      '.xlsx': 'document',
      '.ppt': 'document',
      '.pptx': 'document',
      '.mp4': 'video',
      '.csv': 'text',
      '.json': 'text',
    };
    
    const extension = path.extname(filename).toLowerCase();
    const expectedTypeByExtension = fileExtensionToTypeMap[extension] || 'unknown';
    
    expect(assetData.type, `Asset ${filename} should have type matching its extension`).toBe(expectedTypeByExtension);
    
    if (['image', 'document', 'video'].includes(assetData.type)) {
      expect(treeItem.imageThumbnailPath, 
        `Asset ${filename} (${assetData.type}) in tree response should have imageThumbnailPath`).toBeDefined();
      
      if (treeItem.imageThumbnailPath) {
        const thumbnailResponse = await authenticatedRequest.get(treeItem.imageThumbnailPath);
        expect(thumbnailResponse.status(), `Thumbnail for ${filename} should be accessible`).toBe(200);
        
        const contentType = thumbnailResponse.headers()['content-type'];
        expect(contentType, `Thumbnail for ${filename} should have image content-type`).toMatch(/^image\//);
        
        const thumbnailData = await thumbnailResponse.body();
        expect(thumbnailData.length, `Thumbnail for ${filename} should not be empty`).toBeGreaterThan(0);
      }
    }
  }

  await FolderHelper.deleteFolder(authenticatedRequest, folderId);
});

function getMimeTypeFromFilename(filename: string): string {
  const extension = path.extname(filename).toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.tif': 'image/tiff',
    '.tiff': 'image/tiff',
    '.psd': 'image/vnd.adobe.photoshop',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.mp4': 'video/mp4',
    '.csv': 'text/csv',
    '.json': 'application/json',
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
}
