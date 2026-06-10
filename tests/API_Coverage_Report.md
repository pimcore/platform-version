# API Coverage Report

## Overview
API endpoint testing coverage for the Pimcore Studio Backend API v2026.1.

## Statistics  
- **Total Endpoints**: 754 endpoints across 61 API tags
- **Core Endpoints** (non-bundle): 394
- **Bundle Endpoints**: 360
- **Currently Tested**: 455 endpoints
- **Overall Coverage**: 60.3% (455/754)
- **Core Coverage**: 86.0% (339/394)
- **Bundle Coverage**: 32.2% (116/360)

---

## Core API Tags

### Assets (38 endpoints) | Tested: 25 | Coverage: 65.8%

#### Tested Endpoints
- `GET /pimcore-studio/api/assets/{id}` - Get asset by ID
- `PUT /pimcore-studio/api/assets/{id}` - Update an asset by ID
- `PATCH /pimcore-studio/api/assets` - Patch assets by ID
- `POST /pimcore-studio/api/assets/add/{parentId}` - Add a new asset
- `GET /pimcore-studio/api/assets/{id}/download` - Download asset by ID
- `POST /pimcore-studio/api/assets/{id}/clone/{parentId}` - Clone a specific asset
- `GET /pimcore-studio/api/assets/tree` - Get all asset data for the tree
- `GET /pimcore-studio/api/assets/{id}/image/stream/preview` - Stream image asset preview by ID
- `GET /pimcore-studio/api/assets/{id}/custom-metadata` - Get custom metadata of an asset by ID
- `GET /pimcore-studio/api/assets/{id}/custom-settings` - Get custom settings of an asset by ID
- `POST /pimcore-studio/api/assets/export/zip/asset` - Creating ZIP file for assets
- `POST /pimcore-studio/api/assets/export/zip/folder` - Creating ZIP file assets based on folder
- `GET /pimcore-studio/api/assets/download/zip/{jobRunId}` - Download ZIP archive for assets
- `DELETE /pimcore-studio/api/assets/download/zip/{jobRunId}` - Delete asset ZIP file based on jobRunId
- `GET /pimcore-studio/api/assets/types` - Get all asset types ✅ (AssetAdditionalTest.spec.ts)
- `GET /pimcore-studio/api/assets/video/types` - Get all video types ✅ (AssetAdditionalTest.spec.ts)
- `GET /pimcore-studio/api/assets/{id}/text` - Get asset data in text UTF8 representation ✅ (AssetAdditionalTest.spec.ts)
- `GET /pimcore-studio/api/assets/exists/{parentId}` - Check if asset already exists ✅ (AssetAdditionalTest.spec.ts)
- `GET /pimcore-studio/api/assets/{id}/image/stream` - Stream original image asset ✅ (AssetAdditionalTest.spec.ts)
- `GET /pimcore-studio/api/assets/{id}/image/stream/custom` - Stream custom image thumbnail ✅ (AssetAdditionalTest.spec.ts)
- `GET /pimcore-studio/api/assets/{id}/image/download/custom` - Download custom image ✅ (AssetAdditionalTest.spec.ts)
- `GET /pimcore-studio/api/assets/{id}/image/stream/dynamic` - Stream image thumbnail by dynamic config ✅ (AssetAdditionalTest.spec.ts)
- `GET /pimcore-studio/api/assets/{id}/image/download/format/{format}` - Download image asset by format ✅ (AssetAdditionalTest.spec.ts)
- `DELETE /pimcore-studio/api/assets/{id}/thumbnail/clear` - Clear image thumbnail by ID ✅ (AssetAdditionalTest.spec.ts)
- `POST /pimcore-studio/api/assets/{id}/replace` - Replace existing asset binary ✅ (AssetAdditionalTest.spec.ts)

#### Untested Endpoints
- `DELETE /pimcore-studio/api/assets/batch-delete` - Batch delete assets by IDs
- `GET /pimcore-studio/api/assets/{id}/document/download/custom` - Download custom document image
- `GET /pimcore-studio/api/assets/{id}/document/stream/custom` - Stream custom document image
- `GET /pimcore-studio/api/assets/{id}/document/stream/dynamic` - Stream document image by dynamic config
- `GET /pimcore-studio/api/assets/{id}/document/stream/pdf-preview` - Stream asset document PDF preview
- `GET /pimcore-studio/api/assets/{id}/document/download/thumbnail/{thumbnailName}` - Download document image by thumbnail name
- `GET /pimcore-studio/api/assets/{id}/document/stream/thumbnail/{thumbnailName}` - Stream document image by thumbnail name
- `GET /pimcore-studio/api/assets/{id}/image/download/thumbnail/{thumbnailName}` - Download image by thumbnail name
- `GET /pimcore-studio/api/assets/{id}/image/stream/thumbnail/{thumbnailName}` - Stream image by thumbnail name
- `PATCH /pimcore-studio/api/assets/folder/{id}` - Patch all assets based on folder ID and filters
- `POST /pimcore-studio/api/assets/add-zip/{parentId}` - Add new assets via ZIP archive
- `GET /pimcore-studio/api/assets/{id}/video/stream/image-thumbnail` - Stream video image thumbnail
- `GET /pimcore-studio/api/assets/{id}/video/download/{thumbnailName}` - Download video by thumbnail name
- `GET /pimcore-studio/api/assets/{id}/video/stream/{thumbnailName}` - Stream video by thumbnail name

---

### Asset Grid (9 endpoints) | Tested: 9 | Coverage: 100.0%

#### Tested Endpoints
- `DELETE /pimcore-studio/api/assets/grid/configuration/{configurationId}/delete` - Delete grid configuration ✅ (AssetGridTest.spec.ts)
- `GET /pimcore-studio/api/assets/grid/available-columns` - Get available grid column configurations ✅ (AssetGridTest.spec.ts)
- `GET /pimcore-studio/api/assets/grid/configuration/{folderId}` - Get asset grid configuration for folder ✅ (AssetGridTest.spec.ts)
- `GET /pimcore-studio/api/assets/grid/configurations` - Get all saved grid configurations ✅ (AssetGridTest.spec.ts)
- `DELETE /pimcore-studio/api/assets/grid/configuration/remove-favorite/{configurationId}/{folderId}` - Remove favorite config ✅ (AssetGridTest.spec.ts)
- `POST /pimcore-studio/api/assets/grid/configuration/save` - Save asset grid configuration ✅ (AssetGridTest.spec.ts)
- `POST /pimcore-studio/api/assets/grid/configuration/set-as-favorite/{configurationId}/{folderId}` - Set favorite config ✅ (AssetGridTest.spec.ts)
- `PUT /pimcore-studio/api/assets/grid/configuration/update/{configurationId}` - Update grid configuration ✅ (AssetGridTest.spec.ts)
- `POST /pimcore-studio/api/assets/grid` - Get asset data for grid ✅ (AssetGridTest.spec.ts)

---

### Asset Thumbnails (12 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/thumbnails/image` - Get collection of image thumbnails
- `POST /pimcore-studio/api/thumbnails/image/config` - Create image thumbnail configuration
- `GET /pimcore-studio/api/thumbnails/image/config/{name}` - Get image thumbnail configuration
- `PUT /pimcore-studio/api/thumbnails/image/config/{name}` - Update image thumbnail configuration
- `DELETE /pimcore-studio/api/thumbnails/image/config/{name}` - Delete image thumbnail configuration
- `GET /pimcore-studio/api/thumbnails/image/tree` - Get image thumbnails tree
- `GET /pimcore-studio/api/thumbnails/video` - Get collection of video thumbnails
- `POST /pimcore-studio/api/thumbnails/video/config` - Create video thumbnail configuration
- `GET /pimcore-studio/api/thumbnails/video/config/{name}` - Get video thumbnail configuration
- `PUT /pimcore-studio/api/thumbnails/video/config/{name}` - Update video thumbnail configuration
- `DELETE /pimcore-studio/api/thumbnails/video/config/{name}` - Delete video thumbnail configuration
- `GET /pimcore-studio/api/thumbnails/video/tree` - Get video thumbnail tree

---

### Authorization (3 endpoints) | Tested: 2 | Coverage: 66.7%

#### Tested Endpoints
- `POST /pimcore-studio/api/login` - Session-based login with user credentials
- `POST /pimcore-studio/api/logout` - Logout and invalidate current session

#### Untested Endpoints
- `POST /pimcore-studio/api/login/token` - Session-based login with user token

---

### Cache (3 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `DELETE /pimcore-studio/api/cache` - Clear application cache
- `DELETE /pimcore-studio/api/cache/output` - Clear output cache
- `DELETE /pimcore-studio/api/cache/temporary-files` - Clear temporary files

---

### Class Definition (68 endpoints) | Tested: 65 | Coverage: 95.6%

#### Tested Endpoints
- `GET /pimcore-studio/api/class/definition/available-visible-fields` - Get available visible fields
- `GET /pimcore-studio/api/class/bulk-export/available` - Get available items for bulk export
- `POST /pimcore-studio/api/class/bulk-export` - Bulk export class definitions
- `GET /pimcore-studio/api/class/collection` - Get class definitions collection
- `GET /pimcore-studio/api/class/collection/creatable` - Get creatable class definitions
- `GET /pimcore-studio/api/class/custom-layout/collection` - Get custom layout collection
- `GET /pimcore-studio/api/class/all-layouts` - Get all available class layouts
- `GET /pimcore-studio/api/class/custom-layout/{customLayoutId}` - Get custom layout by ID
- `PUT /pimcore-studio/api/class/custom-layout/{customLayoutId}` - Update custom layout
- `POST /pimcore-studio/api/class/custom-layout/{customLayoutId}` - Create custom layout
- `DELETE /pimcore-studio/api/class/custom-layout/{customLayoutId}` - Delete custom layout
- `GET /pimcore-studio/api/class/custom-layout/export/{customLayoutId}` - Export custom layout as JSON
- `GET /pimcore-studio/api/class/custom-layout/identifier-data/{classDefinitionId}` - Get identifier data for new custom layout
- `GET /pimcore-studio/api/class/definition/configuration-view/detail/{id}/bricks` - Get object bricks usage data
- `POST /pimcore-studio/api/class/definition/configuration-view/detail/create` - Create class definition
- `GET /pimcore-studio/api/class/definition/configuration-view/detail/{id}` - Get class definition by ID
- `PUT /pimcore-studio/api/class/definition/configuration-view/detail/{id}` - Update class definition
- `DELETE /pimcore-studio/api/class/definition/configuration-view/detail/{id}` - Delete class definition
- `GET /pimcore-studio/api/class/definition/configuration-view/detail/{id}/export` - Export class definition as JSON
- `GET /pimcore-studio/api/class/definition/configuration-view/identifier-data` - Get identifier data for new class
- `GET /pimcore-studio/api/class/definition/configuration-view/detail/{id}/layout` - Get layout definitions
- `GET /pimcore-studio/api/class/definition/configuration-view/detail/{id}/selected-visible-fields` - Get selected visible fields
- `GET /pimcore-studio/api/class/definition/configuration-view/text-layout/preview` - Get text layout preview
- `GET /pimcore-studio/api/class/definition/configuration-view/tree` - Get class definition tree data
- `GET /pimcore-studio/api/class/field-collection/collection` - Get all field collections
- `POST /pimcore-studio/api/class/field-collection` - Create field collection
- `GET /pimcore-studio/api/class/field-collection/{key}` - Get field collection by key
- `PUT /pimcore-studio/api/class/field-collection/{key}` - Update field collection
- `DELETE /pimcore-studio/api/class/field-collection/{key}` - Delete field collection
- `GET /pimcore-studio/api/class/field-collection/{key}/export` - Export field collection as JSON
- `GET /pimcore-studio/api/class/field-collection/{key}/layout` - Get field collection layout definition
- `GET /pimcore-studio/api/class/field-collection/tree` - Get field collection tree
- `GET /pimcore-studio/api/class/field-collection/{key}/usages` - Get field collection usage data
- `GET /pimcore-studio/api/class/definition/fields-by-type` - Get fields by type
- `GET /pimcore-studio/api/class/definition/{dataObjectClass}` - Get class definition for data object class
- `GET /pimcore-studio/api/class/object-brick/classes` - Get classes with ObjectBricks fields
- `GET /pimcore-studio/api/class/object-brick/collection` - Get all object brick definitions
- `POST /pimcore-studio/api/class/object-brick` - Create object brick definition
- `GET /pimcore-studio/api/class/object-brick/{key}` - Get object brick by key
- `PUT /pimcore-studio/api/class/object-brick/{key}` - Update object brick
- `DELETE /pimcore-studio/api/class/object-brick/{key}` - Delete object brick
- `GET /pimcore-studio/api/class/object-brick/{key}/export` - Export object brick as JSON
- `GET /pimcore-studio/api/class/object-brick/{key}/layout` - Get object brick layout definition
- `GET /pimcore-studio/api/class/object-brick/tree` - Get object brick tree
- `GET /pimcore-studio/api/class/object-brick/{key}/usages` - Get object brick usages
- `POST /pimcore-studio/api/class/select-option` - Create select option configuration
- `GET /pimcore-studio/api/class/select-option/{id}` - Get select option configuration
- `PUT /pimcore-studio/api/class/select-option/{id}` - Update select option configuration
- `DELETE /pimcore-studio/api/class/select-option/{id}` - Delete select option configuration
- `GET /pimcore-studio/api/class/select-option/tree` - Get select options tree data
- `GET /pimcore-studio/api/class/select-option/{id}/usages` - Get select option usages
- `POST /pimcore-studio/api/class/bulk-import/{fileId}` - Bulk import class definitions ✅ (ClassDefinitionImportTest.spec.ts)
- `DELETE /pimcore-studio/api/class/bulk-import/{fileId}` - Delete a prepared bulk import file ✅ (ClassDefinitionImportTest.spec.ts)
- `POST /pimcore-studio/api/class/bulk-import/prepare` - Prepare a bulk import ✅ (ClassDefinitionImportTest.spec.ts)
- `GET /pimcore-studio/api/class/custom-layout/editor/collection/{objectId}` - Get custom layout collection for object ✅ (ClassDefinitionImportTest.spec.ts)
- `POST /pimcore-studio/api/class/custom-layout/import/{customLayoutId}` - Import custom layout ✅ (ClassDefinitionImportTest.spec.ts)
- `POST /pimcore-studio/api/class/field-collection/{key}/import` - Import field collection from JSON ✅ (ClassDefinitionImportTest.spec.ts)
- `GET /pimcore-studio/api/class/field-collection/{objectId}/object/layout` - Get field collection layouts for object ✅ (ClassDefinitionImportTest.spec.ts)
- `GET /pimcore-studio/api/class/folder/{folderId}` - Get classes in folder ✅ (ClassDefinitionImportTest.spec.ts)
- `POST /pimcore-studio/api/class/definition/configuration-view/detail/{id}/import` - Import class definition from JSON ✅ (ClassDefinitionImportTest.spec.ts)
- `GET /pimcore-studio/api/class/object-brick/{objectId}/object/layout` - Get object brick layouts for object ✅ (ClassDefinitionImportTest.spec.ts)

#### Untested Endpoints
- `GET /pimcore-studio/api/class/definition/configuration-view/detail/{id}/brick-fields` - Get object brick fields for the class definition
- `GET /pimcore-studio/api/class/object-brick/{key}/custom-layout/{customLayoutId}` - Get object brick custom layout
- `PUT /pimcore-studio/api/class/object-brick/{key}/custom-layout/{customLayoutId}` - Update object brick custom layout
- `DELETE /pimcore-studio/api/class/object-brick/{key}/custom-layout/{customLayoutId}` - Delete object brick custom layout
- `GET /pimcore-studio/api/class/object-brick/{key}/custom-layout/{customLayoutId}/export` - Export object brick custom layout
- `POST /pimcore-studio/api/class/object-brick/{key}/custom-layout/{customLayoutId}/import` - Import object brick custom layout
- `POST /pimcore-studio/api/class/object-brick/{key}/import` - Import object brick from JSON

---

### Classification Store (29 endpoints) | Tested: 29 | Coverage: 100.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/classification-store/configuration/stores` - Create a new store ✅ (ClassificationStoreCrudTest.spec.ts)
- `GET /pimcore-studio/api/classification-store/configuration/stores/tree` - Get store tree ✅ (ClassificationStoreCrudTest.spec.ts)
- `PUT /pimcore-studio/api/classification-store/configuration/stores/{id}` - Update a store ✅ (ClassificationStoreCrudTest.spec.ts)
- `POST /pimcore-studio/api/classification-store/configuration/groups/add` - Create a new group ✅ (ClassificationStoreCrudTest.spec.ts)
- `POST /pimcore-studio/api/classification-store/configuration/stores/{storeId}/groups` - List group configurations ✅ (ClassificationStoreCrudTest.spec.ts)
- `PUT /pimcore-studio/api/classification-store/configuration/groups/{id}` - Update a group ✅ (ClassificationStoreCrudTest.spec.ts)
- `DELETE /pimcore-studio/api/classification-store/configuration/groups/{id}` - Delete a group ✅ (ClassificationStoreCrudTest.spec.ts)
- `POST /pimcore-studio/api/classification-store/configuration/keys/add` - Create a new key ✅ (ClassificationStoreCrudTest.spec.ts)
- `POST /pimcore-studio/api/classification-store/configuration/stores/{storeId}/keys` - List key configurations ✅ (ClassificationStoreCrudTest.spec.ts)
- `PUT /pimcore-studio/api/classification-store/configuration/keys/{id}` - Update a key ✅ (ClassificationStoreCrudTest.spec.ts)
- `DELETE /pimcore-studio/api/classification-store/configuration/keys/{id}` - Disable a key (soft-delete) ✅ (ClassificationStoreCrudTest.spec.ts)
- `POST /pimcore-studio/api/classification-store/configuration/collections/add` - Create a collection ✅ (ClassificationStoreCrudTest.spec.ts)
- `POST /pimcore-studio/api/classification-store/configuration/stores/{storeId}/collections` - List collection configurations ✅ (ClassificationStoreCrudTest.spec.ts)
- `PUT /pimcore-studio/api/classification-store/configuration/collections/{id}` - Update a collection ✅ (ClassificationStoreCrudTest.spec.ts)
- `DELETE /pimcore-studio/api/classification-store/configuration/collections/{id}` - Delete a collection ✅ (ClassificationStoreCrudTest.spec.ts)
- `POST /pimcore-studio/api/classification-store/configuration/collection-relations/add` - Create/update collection-group relation ✅ (ClassificationStoreCrudTest.spec.ts)
- `POST /pimcore-studio/api/classification-store/configuration/collections/{colId}/relations` - List collection-group relations ✅ (ClassificationStoreCrudTest.spec.ts)
- `DELETE /pimcore-studio/api/classification-store/configuration/collection-relations` - Delete collection-group relation ✅ (ClassificationStoreCrudTest.spec.ts)
- `POST /pimcore-studio/api/classification-store/configuration/key-group-relations/add` - Create/update key-group relation ✅ (ClassificationStoreCrudTest.spec.ts)
- `POST /pimcore-studio/api/classification-store/configuration/groups/{groupId}/key-relations` - List key-group relations ✅ (ClassificationStoreCrudTest.spec.ts)
- `DELETE /pimcore-studio/api/classification-store/configuration/key-group-relations` - Delete key-group relation ✅ (ClassificationStoreCrudTest.spec.ts)
- `GET /pimcore-studio/api/classification-store/config/collection` - Get all classification store configurations ✅ (ClassificationStoreCrudTest.spec.ts)
- `GET /pimcore-studio/api/classification-store/configuration/get-page` - Get page number for item ✅ (ClassificationStoreCrudTest.spec.ts)
- `GET /pimcore-studio/api/classification-store/collections` - Get collections for fieldName ✅ (ClassificationStoreRuntimeTest.spec.ts)
- `GET /pimcore-studio/api/classification-store/groups` - Get groups for fieldName ✅ (ClassificationStoreRuntimeTest.spec.ts)
- `GET /pimcore-studio/api/classification-store/key-group-relations` - Get key group relations for fieldName ✅ (ClassificationStoreRuntimeTest.spec.ts)
- `GET /pimcore-studio/api/classification-store/layout-by-collection/{collectionId}` - Get layout for collection ✅ (ClassificationStoreRuntimeTest.spec.ts)
- `GET /pimcore-studio/api/classification-store/layout-by-group/{groupId}` - Get layout for group ✅ (ClassificationStoreRuntimeTest.spec.ts)
- `GET /pimcore-studio/api/classification-store/layout-by-key/{keyId}/{groupId}` - Get layout for key ✅ (ClassificationStoreRuntimeTest.spec.ts)

---

### Data Objects (13 endpoints) | Tested: 13 | Coverage: 100.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/data-objects/add/{parentId}` - Add a new data object
- `GET /pimcore-studio/api/data-objects/{id}` - Get data object by ID
- `PUT /pimcore-studio/api/data-objects/{id}` - Update data object by ID
- `PATCH /pimcore-studio/api/data-objects` - Patch data objects by ID
- `POST /pimcore-studio/api/data-objects/{id}/clone/{parentId}` - Clone data object
- `POST /pimcore-studio/api/data-objects/{sourceId}/replace/{targetId}` - Replace content of data object
- `GET /pimcore-studio/api/data-objects/{id}/layout` - Get layout of data object
- `GET /pimcore-studio/api/data-objects/tree` - Get all data object data for tree
- `DELETE /pimcore-studio/api/data-objects/batch-delete` - Batch delete data objects by IDs ✅ (DataObjectAdditionalTest.spec.ts)
- `PATCH /pimcore-studio/api/data-objects/folder/{id}` - Patch all data objects based on folder ID and filters ✅ (DataObjectAdditionalTest.spec.ts)
- `POST /pimcore-studio/api/data-objects/format-path` - Format the path of the data ✅ (DataObjectAdditionalTest.spec.ts)
- `GET /pimcore-studio/api/data-objects/preview/{id}` - Preview data object by ID and site ✅ (DataObjectAdditionalTest.spec.ts)
- `POST /pimcore-studio/api/data-objects/select-options` - Get dynamic select options ✅ (DataObjectAdditionalTest.spec.ts)

---

### Data Object Grid (12 endpoints) | Tested: 9 | Coverage: 75.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/data-objects/grid/{classId}` - Get data object data for grid
- `GET /pimcore-studio/api/data-object/grid/available-columns` - Get available grid columns
- `POST /pimcore-studio/api/data-object/grid/configuration/save/{classId}` - Save grid configuration
- `GET /pimcore-studio/api/data-object/grid/configuration/{folderId}/{classId}` - Get grid configuration
- `PUT /pimcore-studio/api/data-object/grid/configuration/update/{configurationId}` - Update grid configuration
- `DELETE /pimcore-studio/api/data-object/grid/configuration/{configurationId}` - Delete grid configuration
- `GET /pimcore-studio/api/data-object/grid/configurations/{classId}` - List all saved grid configurations
- `POST /pimcore-studio/api/data-object/grid/configuration/set-as-favorite/{configurationId}/{folderId}` - Set favorite config
- `DELETE /pimcore-studio/api/data-object/grid/configuration/remove-favorite/{configurationId}/{folderId}` - Remove favorite config

#### Untested Endpoints
- `POST /pimcore-studio/api/data-objects/grid/preview` - Preview Advanced Column Grid
- `GET /pimcore-studio/api/data-object/grid/available-columns-for-relation` - Get columns for relation field
- `GET /pimcore-studio/api/data-objects/grid/transformers/services/phpcode` - List PHPCode transformers

---

### Dependencies (1 endpoint) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/dependencies/{elementType}/{id}` - Get all dependencies for element

---

### Documents (28 endpoints) | Tested: 28 | Coverage: 100.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/documents/add/{parentId}` - Add a new document ✅ (DocumentCrudTest.spec.ts)
- `GET /pimcore-studio/api/documents/{id}` - Get document by ID ✅ (DocumentCrudTest.spec.ts)
- `GET /pimcore-studio/api/documents/tree` - Get all document data for tree ✅ (DocumentCrudTest.spec.ts)
- `POST /pimcore-studio/api/documents/{id}/clone/{parentId}` - Clone a specific document ✅ (DocumentCrudTest.spec.ts)
- `POST /pimcore-studio/api/documents/{id}/page/check-pretty-url` - Check pretty URL availability ✅ (DocumentCrudTest.spec.ts)
- `GET /pimcore-studio/api/documents/get-available-controllers` - List document controllers ✅ (DocumentCrudTest.spec.ts)
- `GET /pimcore-studio/api/documents/get-available-templates` - List document templates ✅ (DocumentCrudTest.spec.ts)
- `GET /pimcore-studio/api/documents/sites/list-available` - List all available sites ✅ (DocumentCrudTest.spec.ts)
- `GET /pimcore-studio/api/documents/translations/{id}` - Get all translations of document ✅ (DocumentCrudTest.spec.ts)
- `GET /pimcore-studio/api/documents/types` - Get all available document types ✅ (DocumentCrudTest.spec.ts)
- `GET /pimcore-studio/api/documents/doc-types/types` - List DocType types ✅ (DocumentCrudTest.spec.ts)
- `POST /pimcore-studio/api/documents/doc-types/add` - Add a new document DocType ✅ (DocumentCrudTest.spec.ts)
- `GET /pimcore-studio/api/documents/doc-types` - List all document DocTypes ✅ (DocumentCrudTest.spec.ts)
- `PUT /pimcore-studio/api/documents/doc-types/{id}` - Update a document DocType ✅ (DocumentCrudTest.spec.ts)
- `DELETE /pimcore-studio/api/documents/doc-types/{id}` - Delete document DocType ✅ (DocumentCrudTest.spec.ts)
- `PUT /pimcore-studio/api/documents/{id}` - Update document by ID ✅ (DocumentUpdateTest.spec.ts)
- `POST /pimcore-studio/api/documents/{id}/convert/{type}` - Change document type ✅ (DocumentUpdateTest.spec.ts)
- `GET /pimcore-studio/api/documents/{id}/page/stream/preview` - Stream page document preview ✅ (DocumentUpdateTest.spec.ts)
- `PUT /pimcore-studio/api/documents/{id}/page-snippet/change-main-document` - Change main document ✅ (DocumentUpdateTest.spec.ts)
- `POST /pimcore-studio/api/documents/page-snippet/{id}/area-block/render` - Render area brick for editmode ✅ (DocumentUpdateTest.spec.ts)
- `GET /pimcore-studio/api/documents/renderlet/render` - Render a specific renderlet ✅ (DocumentUpdateTest.spec.ts)
- `POST /pimcore-studio/api/documents/{sourceId}/replace/{targetId}` - Replace document content ✅ (DocumentUpdateTest.spec.ts)
- `POST /pimcore-studio/api/documents/site/{id}` - Use document as site or update site ✅ (DocumentUpdateTest.spec.ts)
- `DELETE /pimcore-studio/api/documents/site/{id}` - Delete site by document ID ✅ (DocumentUpdateTest.spec.ts)
- `GET /pimcore-studio/api/documents/site/{documentId}` - Get site detail by document ID ✅ (DocumentUpdateTest.spec.ts)
- `POST /pimcore-studio/api/documents/translations/{id}/add/{translationId}` - Link translation document ✅ (DocumentUpdateTest.spec.ts)
- `DELETE /pimcore-studio/api/documents/translations/{id}/delete/{translationId}` - Delete translation document ✅ (DocumentUpdateTest.spec.ts)
- `GET /pimcore-studio/api/documents/translations/{id}/get-parent/{language}` - Get parent translation by language ✅ (DocumentUpdateTest.spec.ts)

---

### E-Mails (12 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/emails/blocklist` - Get paginated blocklist entries
- `POST /pimcore-studio/api/emails/blocklist` - Add email to blocklist
- `DELETE /pimcore-studio/api/emails/blocklist` - Delete email from blocklist
- `GET /pimcore-studio/api/emails` - Get paginated E-Mail log entries
- `GET /pimcore-studio/api/emails/{id}` - Get E-Mail log entry by ID
- `DELETE /pimcore-studio/api/emails/{id}` - Delete E-Mail log entry
- `GET /pimcore-studio/api/emails/{id}/html` - Get HTML content of E-Mail log entry
- `GET /pimcore-studio/api/emails/{id}/params` - Get parameters of E-Mail log entry
- `GET /pimcore-studio/api/emails/{id}/text` - Get text content of E-Mail log entry
- `POST /pimcore-studio/api/emails/{id}/forward` - Forward E-Mail log entry
- `POST /pimcore-studio/api/emails/{id}/resend` - Resend E-Mail log entry
- `POST /pimcore-studio/api/emails/test` - Send a test E-Mail

---

### Elements (10 endpoints) | Tested: 10 | Coverage: 100.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/elements/{elementType}/folder/{parentId}` - Create element folder
- `DELETE /pimcore-studio/api/elements/{elementType}/delete/{id}` - Delete element and children
- `GET /pimcore-studio/api/elements/{elementType}/resolve` - Get ID of element with search term
- `GET /pimcore-studio/api/elements/{elementType}/delete-info/{id}` - Get delete info of element ✅ (ElementAdditionalTest.spec.ts)
- `GET /pimcore-studio/api/elements/{elementType}/context-permissions/` - Get context permissions ✅ (ElementAdditionalTest.spec.ts)
- `GET /pimcore-studio/api/elements/{elementType}/location/{id}/{perspectiveId}` - Get location data ✅ (ElementAdditionalTest.spec.ts)
- `GET /pimcore-studio/api/elements/{elementType}/path` - Get element ID by path ✅ (ElementAdditionalTest.spec.ts)
- `GET /pimcore-studio/api/elements/{elementType}/subtype/{id}` - Get subtype of element ✅ (ElementAdditionalTest.spec.ts)
- `GET /pimcore-studio/api/elements/usage/{elementType}/{id}` - Get usage of element ✅ (ElementAdditionalTest.spec.ts)
- `POST /pimcore-studio/api/elements/usage/replace/{elementType}/{id}` - Replace all references to element ✅ (ElementAdditionalTest.spec.ts)

---

### Execution Engine (3 endpoints) | Tested: 3 | Coverage: 100.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/execution-engine/running-jobs` - List studio jobs
- `POST /pimcore-studio/api/execution-engine/abort/{jobRunId}` - Abort Job Run by ID ✅ (ExecutionEngineTest.spec.ts)
- `POST /pimcore-studio/api/execution-engine/hide` - Hide Job Runs by IDs ✅ (ExecutionEngineTest.spec.ts)

---

### Export (8 endpoints) | Tested: 8 | Coverage: 100.0%

#### Tested Endpoints
- `GET /pimcore-studio/api/export/download/csv/{jobRunId}` - Download CSV file ✅ (ExportTest.spec.ts)
- `DELETE /pimcore-studio/api/export/download/csv/{jobRunId}` - Delete CSV export file ✅ (ExportTest.spec.ts)
- `POST /pimcore-studio/api/export/csv` - Create CSV file for elements ✅ (ExportTest.spec.ts)
- `POST /pimcore-studio/api/export/csv/folder/{id}` - Create CSV file from folder ✅ (ExportTest.spec.ts)
- `GET /pimcore-studio/api/export/download/xlsx/{jobRunId}` - Download XLSX file ✅ (ExportTest.spec.ts)
- `DELETE /pimcore-studio/api/export/download/xlsx/{jobRunId}` - Delete XLSX export file ✅ (ExportTest.spec.ts)
- `POST /pimcore-studio/api/export/xlsx` - Create XLSX file for elements ✅ (ExportTest.spec.ts)
- `POST /pimcore-studio/api/export/xlsx/folder/{id}` - Create XLSX file from folder ✅ (ExportTest.spec.ts)

---

### GDPR Data Extractor (3 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/gdpr/export-data/{id}` - Export a single GDPR data provider item
- `GET /pimcore-studio/api/gdpr/providers` - List of available GDPR providers
- `POST /pimcore-studio/api/gdpr/search` - Search for GDPR data

---

### Mercure (1 endpoint) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `POST /pimcore-studio/api/mercure/auth` - Retrieve JWT token for Mercure hub as cookie

---

### Metadata (6 endpoints) | Tested: 6 | Coverage: 100.0%

#### Tested Endpoints
- `GET /pimcore-studio/api/metadata/asset` - Get predefined metadata for assets by type ✅ (MetadataTest.spec.ts)
- `GET /pimcore-studio/api/assets/{id}/custom-metadata` - Get custom metadata of asset by ID ✅ (MetadataTest.spec.ts)
- `POST /pimcore-studio/api/metadata` - Get predefined metadata collection with filtering ✅ (MetadataTest.spec.ts)
- `POST /pimcore-studio/api/metadata/predefined` - Create a new predefined metadata entry ✅ (MetadataTest.spec.ts)
- `PUT /pimcore-studio/api/metadata/predefined/{id}` - Update predefined metadata entry ✅ (MetadataTest.spec.ts)
- `DELETE /pimcore-studio/api/metadata/predefined/{id}` - Delete predefined metadata entry ✅ (MetadataTest.spec.ts)

---

### Notes (5 endpoints) | Tested: 5 | Coverage: 100.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/notes` - Get paginated notes
- `DELETE /pimcore-studio/api/notes/{id}` - Delete note with given id
- `GET /pimcore-studio/api/notes/{elementType}/{id}` - Get paginated notes for element
- `POST /pimcore-studio/api/notes/{elementType}/{id}` - Create note for element
- `GET /pimcore-studio/api/notes/type/{elementType}` - Get note types

---

### Notifications (8 endpoints) | Tested: 8 | Coverage: 100.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/notifications` - Get paginated notifications ✅ (NotificationTest.spec.ts)
- `DELETE /pimcore-studio/api/notifications` - Delete all user notifications ✅ (NotificationTest.spec.ts)
- `GET /pimcore-studio/api/notifications/{id}` - Get notification by ID ✅ (NotificationTest.spec.ts)
- `POST /pimcore-studio/api/notifications/{id}` - Mark notification as read ✅ (NotificationTest.spec.ts)
- `DELETE /pimcore-studio/api/notifications/{id}` - Delete notification ✅ (NotificationTest.spec.ts)
- `GET /pimcore-studio/api/notifications/unread-count` - Count of unread notifications ✅ (NotificationTest.spec.ts)
- `GET /pimcore-studio/api/notifications/recipients` - Get notification recipients ✅ (NotificationTest.spec.ts)
- `POST /pimcore-studio/api/notifications/send` - Send a notification ✅ (NotificationTest.spec.ts)

---

### Perspectives (11 endpoints) | Tested: 11 | Coverage: 100.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/perspectives/configuration` - Create a new perspective ✅ (PerspectiveTest.spec.ts)
- `GET /pimcore-studio/api/perspectives/configurations` - Get all perspective configurations ✅ (PerspectiveTest.spec.ts)
- `GET /pimcore-studio/api/perspectives/configuration/{perspectiveId}` - Get perspective by ID ✅ (PerspectiveTest.spec.ts)
- `PUT /pimcore-studio/api/perspectives/configuration/{perspectiveId}` - Update perspective ✅ (PerspectiveTest.spec.ts)
- `DELETE /pimcore-studio/api/perspectives/configuration/{perspectiveId}` - Delete perspective ✅ (PerspectiveTest.spec.ts)
- `POST /pimcore-studio/api/perspectives/widgets/{widgetType}/configuration` - Create widget ✅ (PerspectiveTest.spec.ts)
- `GET /pimcore-studio/api/perspectives/widgets/configurations` - Get all widget configurations ✅ (PerspectiveTest.spec.ts)
- `GET /pimcore-studio/api/perspectives/widgets/{widgetType}/configuration/{widgetId}` - Get widget config ✅ (PerspectiveTest.spec.ts)
- `PUT /pimcore-studio/api/perspectives/widgets/{widgetType}/configuration/{widgetId}` - Update widget ✅ (PerspectiveTest.spec.ts)
- `DELETE /pimcore-studio/api/perspectives/widgets/{widgetType}/configuration/{widgetId}` - Delete widget ✅ (PerspectiveTest.spec.ts)
- `GET /pimcore-studio/api/perspectives/widgets/types` - Get widget types ✅ (PerspectiveTest.spec.ts)

---

### Properties (5 endpoints) | Tested: 5 | Coverage: 100.0%

#### Tested Endpoints
- `GET /pimcore-studio/api/properties/{elementType}/{id}` - Get properties for an element ✅ (PropertiesTest.spec.ts)
- `GET /pimcore-studio/api/properties` - Get all predefined properties ✅ (PropertiesTest.spec.ts)
- `POST /pimcore-studio/api/property` - Create new property ✅ (PropertiesTest.spec.ts)
- `PUT /pimcore-studio/api/properties/{id}` - Update property ✅ (PropertiesTest.spec.ts)
- `DELETE /pimcore-studio/api/properties/{id}` - Delete property ✅ (PropertiesTest.spec.ts)

---

### Recycle Bin (4 endpoints) | Tested: 4 | Coverage: 100.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/recycle-bin/items` - Get paginated recycle bin items ✅ (RecycleBinTest.spec.ts)
- `DELETE /pimcore-studio/api/recycle-bin/delete` - Delete items from recycle bin ✅ (RecycleBinTest.spec.ts)
- `DELETE /pimcore-studio/api/recycle-bin/flush` - Flush the recycle bin ✅ (RecycleBinTest.spec.ts)
- `POST /pimcore-studio/api/recycle-bin/restore` - Restore items from recycle bin ✅ (RecycleBinTest.spec.ts)

---

### Role Management (12 endpoints) | Tested: 12 | Coverage: 100.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/role/clone/{id}` - Clone a specific role ✅ (RoleCrudTest.spec.ts)
- `POST /pimcore-studio/api/role/folder` - Create a new role folder ✅ (RoleCrudTest.spec.ts)
- `POST /pimcore-studio/api/role` - Create a new role ✅ (RoleCrudTest.spec.ts)
- `DELETE /pimcore-studio/api/role/folder/{id}` - Delete folder with all sub roles ✅ (RoleCrudTest.spec.ts)
- `GET /pimcore-studio/api/role/{id}` - Get role by ID ✅ (RoleCrudTest.spec.ts)
- `PUT /pimcore-studio/api/role/{id}` - Update role ✅ (RoleCrudTest.spec.ts)
- `DELETE /pimcore-studio/api/role/{id}` - Delete a specific role ✅ (RoleCrudTest.spec.ts)
- `GET /pimcore-studio/api/roles` - Get all available roles ✅ (RoleCrudTest.spec.ts)
- `GET /pimcore-studio/api/roles/with-permission` - Get roles with specific permission ✅ (RoleCrudTest.spec.ts)
- `GET /pimcore-studio/api/roles/tree` - Get roles for tree view ✅ (RoleCrudTest.spec.ts)
- `GET /pimcore-studio/api/roles-share-list` - Get all roles for sharing configurations ✅ (RoleCrudTest.spec.ts)
- `GET /pimcore-studio/api/role/search` - Search for roles ✅ (RoleCrudTest.spec.ts)

---

### Schedule (5 endpoints) | Tested: 5 | Coverage: 100.0%

#### Tested Endpoints
- `DELETE /pimcore-studio/api/schedules/{id}` - Delete schedule ✅ (ScheduleTest.spec.ts)
- `GET /pimcore-studio/api/schedules/{elementType}/{id}` - Get schedules for element ✅ (ScheduleTest.spec.ts)
- `PUT /pimcore-studio/api/schedules/{elementType}/{id}` - Update schedules for element ✅ (ScheduleTest.spec.ts)
- `POST /pimcore-studio/api/schedules/{elementType}/{id}` - Create schedule for element ✅ (ScheduleTest.spec.ts)
- `GET /pimcore-studio/api/schedules/actions/{elementType}` - List available schedule actions ✅ (ScheduleTest.spec.ts)

---

### Search (7 endpoints) | Tested: 7 | Coverage: 100.0%

#### Tested Endpoints
- `GET /pimcore-studio/api/search/configuration/assets` - Get asset search configuration
- `POST /pimcore-studio/api/search/assets` - Get asset data for search
- `GET /pimcore-studio/api/search/configuration/data-objects` - Get data object search configuration
- `POST /pimcore-studio/api/search/data-objects` - Get data object search results
- `POST /pimcore-studio/api/search/documents` - Get document data for search
- `GET /pimcore-studio/api/search/preview/{elementType}/{id}` - Preview for search result
- `GET /pimcore-studio/api/search` - Search for elements

---

### Settings (7 endpoints) | Tested: 7 | Coverage: 100.0%

#### Tested Endpoints
- `GET /pimcore-studio/api/settings/available-countries` - Get all available countries ✅ (SettingsTest.spec.ts)
- `GET /pimcore-studio/api/settings` - Get system settings ✅ (SettingsTest.spec.ts)
- `PUT /pimcore-studio/api/settings` - Update system settings ✅ (SettingsTest.spec.ts)
- `GET /pimcore-studio/api/settings/adapter/image` - Check image adapter ✅ (SettingsTest.spec.ts)
- `GET /pimcore-studio/api/settings/active-bundles` - List all active bundles ✅ (SettingsTest.spec.ts)
- `GET /pimcore-studio/api/settings/ping` - Ping action ✅ (SettingsTest.spec.ts)
- `GET /settings/adapter/video` - Check video adapter validity ✅ (SettingsTest.spec.ts)

---

### Settings Admin (3 endpoints) | Tested: 3 | Coverage: 100.0%

#### Tested Endpoints
- `GET /pimcore-studio/api/settings/admin` - Get admin appearance settings ✅ (SettingsTest.spec.ts)
- `POST /pimcore-studio/api/settings/admin/save` - Update admin appearance settings ✅ (SettingsTest.spec.ts)
- `GET /pimcore-studio/api/setting/admin/thumbnail` - Get thumbnail for admin settings ✅ (SettingsTest.spec.ts)

---

### Tags (5 endpoints) | Tested: 5 | Coverage: 100.0%

#### Tested Endpoints
- `GET /pimcore-studio/api/tags` - Get all tags for a parent
- `POST /pimcore-studio/api/tag` - Create a new tag
- `GET /pimcore-studio/api/tags/{id}` - Get a tag by ID
- `PUT /pimcore-studio/api/tags/{id}` - Update a tag by ID
- `DELETE /pimcore-studio/api/tags/{id}` - Delete a specific tag

---

### Tags for Element (4 endpoints) | Tested: 3 | Coverage: 75.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/tags/assign/{elementType}/{id}/{tagId}` - Assign tag to element
- `GET /pimcore-studio/api/tags/{elementType}/{id}` - Get tags for element
- `DELETE /pimcore-studio/api/tags/{elementType}/{id}/{tagId}` - Unassign tag from element

#### Untested Endpoints
- `POST /pimcore-studio/api/tags/batch/{operation}/{elementType}/{id}` - Batch assign/replace tags for children

---

### Translation (11 endpoints) | Tested: 11 | Coverage: 100.0%

#### Tested Endpoints
- `GET /pimcore-studio/api/translations/available-locales` - Get all available locales ✅ (TranslationReadTest.spec.ts)
- `DELETE /pimcore-studio/api/translations/{domain}/cleanup` - Cleanup translations for domain ✅ (TranslationListExportTest.spec.ts)
- `POST /pimcore-studio/api/translations/create` - Create translations ✅ (TranslationCrudTest.spec.ts)
- `POST /pimcore-studio/api/translations/csv-settings` - Determine CSV dialect settings for import ✅ (TranslationListExportTest.spec.ts)
- `DELETE /pimcore-studio/api/translations/{key}` - Delete translations ✅ (TranslationCrudTest.spec.ts)
- `GET /pimcore-studio/api/translations/domains` - Get all available translation domains ✅ (TranslationReadTest.spec.ts)
- `POST /pimcore-studio/api/translations/export` - Export translations for domain ✅ (TranslationListExportTest.spec.ts)
- `POST /pimcore-studio/api/translations/{domain}/import` - Import translations from CSV ✅ (TranslationImportTest.spec.ts)
- `POST /pimcore-studio/api/translations/list` - Get all translations for domain ✅ (TranslationListExportTest.spec.ts)
- `POST /pimcore-studio/api/translations` - Get translations ✅ (TranslationReadTest.spec.ts)
- `PUT /pimcore-studio/api/translations/{domain}` - Update translations ✅ (TranslationCrudTest.spec.ts)

---

### Units (9 endpoints) | Tested: 9 | Coverage: 100.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/unit/quantity-value/units/collection` - Get quantity value unit collection ✅ (UnitTest.spec.ts)
- `GET /pimcore-studio/api/unit/quantity-value/convert-all` - Convert to all related units ✅ (UnitTest.spec.ts)
- `GET /pimcore-studio/api/unit/quantity-value/convert` - Convert from one unit to another ✅ (UnitTest.spec.ts)
- `POST /pimcore-studio/api/unit/quantity-value/units` - Create quantity value unit ✅ (UnitTest.spec.ts)
- `PUT /pimcore-studio/api/unit/quantity-value/units/{id}` - Update quantity value unit ✅ (UnitTest.spec.ts)
- `DELETE /pimcore-studio/api/unit/quantity-value/units/{id}` - Delete quantity value unit ✅ (UnitTest.spec.ts)
- `GET /pimcore-studio/api/unit/quantity-value/units/export` - Export quantity value units as JSON ✅ (UnitTest.spec.ts)
- `POST /pimcore-studio/api/unit/quantity-value/units/import` - Import quantity value units from JSON ✅ (UnitTest.spec.ts)
- `GET /pimcore-studio/api/unit/quantity-value/unit-list` - List of available quantity value units ✅ (UnitTest.spec.ts)

---

### User Management (23 endpoints) | Tested: 21 | Coverage: 91.3%

#### Tested Endpoints
- `GET /pimcore-studio/api/user/current-user-information` - Get current user information ✅ (LoginTest.spec.ts)
- `POST /pimcore-studio/api/user/clone/{id}` - Clone a specific user ✅ (UserCrudTest.spec.ts)
- `POST /pimcore-studio/api/user/` - Create a new user ✅ (UserCrudTest.spec.ts)
- `POST /pimcore-studio/api/user/folder` - Create a new user folder ✅ (UserCrudTest.spec.ts)
- `GET /pimcore-studio/api/user/{id}` - Get user by ID ✅ (UserCrudTest.spec.ts)
- `PUT /pimcore-studio/api/user/{id}` - Update user ✅ (UserCrudTest.spec.ts)
- `DELETE /pimcore-studio/api/user/{id}` - Delete a specific user ✅ (UserCrudTest.spec.ts)
- `DELETE /pimcore-studio/api/user/folder/{id}` - Delete user folder with all users ✅ (UserCrudTest.spec.ts)
- `GET /pimcore-studio/api/user/image/{id}` - Get user profile image ✅ (UserCrudTest.spec.ts)
- `DELETE /pimcore-studio/api/user/image/{id}` - Delete user image ✅ (UserCrudTest.spec.ts)
- `GET /pimcore-studio/api/users/default-key-bindings` - Get default key bindings ✅ (UserCrudTest.spec.ts)
- `GET /pimcore-studio/api/user/available-permissions` - Get all available user permissions ✅ (UserCrudTest.spec.ts)
- `GET /pimcore-studio/api/users` - Get all users ✅ (UserCrudTest.spec.ts)
- `GET /pimcore-studio/api/users/with-permission` - Get users with specific permission ✅ (UserCrudTest.spec.ts)
- `POST /pimcore-studio/api/user/reset-password` - Send password reset ✅ (UserCrudTest.spec.ts)
- `GET /pimcore-studio/api/user/search` - Search for users ✅ (UserCrudTest.spec.ts)
- `POST /pimcore-studio/api/user/token-link/{id}` - Generate login link and token ✅ (UserCrudTest.spec.ts)
- `PUT /pimcore-studio/api/user/{id}/password` - Update password ✅ (UserCrudTest.spec.ts)
- `PUT /pimcore-studio/api/user/update-profile` - Update current user profile ✅ (UserProfileTest.spec.ts)
- `GET /pimcore-studio/api/users/tree` - Get users for tree view ✅ (UserCrudTest.spec.ts)
- `GET /pimcore-studio/api/users-share-list` - Get all users for sharing ✅ (UserCrudTest.spec.ts)

#### Untested Endpoints
- `PUT /pimcore-studio/api/user/active-perspective/{perspectiveId}` - Update active perspective
- `POST /pimcore-studio/api/user/upload-image/{id}` - Upload user image

---

### Versions (9 endpoints) | Tested: 9 | Coverage: 100.0%

#### Tested Endpoints
- `GET /pimcore-studio/api/versions/{id}/asset/download` - Download asset version ✅ (VersionTest.spec.ts)
- `GET /pimcore-studio/api/versions/{id}/image/stream` - Stream image version thumbnail ✅ (VersionTest.spec.ts)
- `GET /pimcore-studio/api/versions/{id}/pdf/stream` - Stream PDF version ✅ (VersionTest.spec.ts)
- `GET /pimcore-studio/api/versions/{id}` - Get version by ID ✅ (VersionTest.spec.ts)
- `PUT /pimcore-studio/api/versions/{id}` - Update version ✅ (VersionTest.spec.ts)
- `POST /pimcore-studio/api/versions/{id}` - Publish version ✅ (VersionTest.spec.ts)
- `DELETE /pimcore-studio/api/versions/{id}` - Delete version ✅ (VersionTest.spec.ts)
- `GET /pimcore-studio/api/versions/{elementType}/{id}` - Get versions for element ✅ (VersionTest.spec.ts)
- `DELETE /pimcore-studio/api/versions/{elementType}/{id}` - Cleanup all versions for element ✅ (VersionTest.spec.ts)

---

### Website Settings (5 endpoints) | Tested: 5 | Coverage: 100.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/website-settings/add` - Add a new website setting ✅ (WebsiteSettingsTest.spec.ts)
- `POST /pimcore-studio/api/website-settings` - Get paginated website settings ✅ (WebsiteSettingsTest.spec.ts)
- `PUT /pimcore-studio/api/website-settings/{id}` - Update a website setting ✅ (WebsiteSettingsTest.spec.ts)
- `DELETE /pimcore-studio/api/website-settings/{id}` - Delete a website setting ✅ (WebsiteSettingsTest.spec.ts)
- `GET /pimcore-studio/api/website-settings/types` - List all website setting types ✅ (WebsiteSettingsTest.spec.ts)

---

### Workflows (2 endpoints) | Tested: 2 | Coverage: 100.0%

#### Tested Endpoints
- `GET /pimcore-studio/api/workflows/details` - Get all workflow details of an element ✅ (WorkflowTest.spec.ts)
- `POST /pimcore-studio/api/workflows/action` - Submit workflow action ✅ (WorkflowTest.spec.ts)

---

## Bundle API Tags (360 endpoints total - 13 tested)

### Bundle Application Logger (4 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/bundle/application-logger/components` - List application logger components
- `GET /pimcore-studio/api/bundle/application-logger/file-object` - Get application logger file object content
- `POST /pimcore-studio/api/bundle/application-logger/list` - Get all log entries
- `GET /pimcore-studio/api/bundle/application-logger/priorities` - List application logger priorities

---

### Bundle Asset Metadata Class Definitions (9 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `POST /pimcore-studio/api/bundle/amdcd/configs` - Create configuration
- `POST /pimcore-studio/api/bundle/amdcd/configs/list` - Get all available configs for editor
- `GET /pimcore-studio/api/bundle/amdcd/configs/metadata-column-config` - Get metadata column configuration
- `GET /pimcore-studio/api/bundle/amdcd/configs/tree` - Get all available configs for tree
- `DELETE /pimcore-studio/api/bundle/amdcd/configs/{name}` - Delete configuration by name
- `GET /pimcore-studio/api/bundle/amdcd/configs/{name}` - Get configuration by name
- `PUT /pimcore-studio/api/bundle/amdcd/configs/{name}` - Update configuration by name
- `GET /pimcore-studio/api/bundle/amdcd/configs/{name}/export` - Export configuration as JSON
- `POST /pimcore-studio/api/bundle/amdcd/configs/{name}/import` - Import configuration from JSON

---

### Bundle Backend Power Tools (36 endpoints) | Tested: 36 | Coverage: 100.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/bundle/backend-power-tools/bl/` - Get bookmark list collection ✅ (BookmarkListTest.spec.ts)
- `POST /pimcore-studio/api/bundle/backend-power-tools/bl/add` - Add a new bookmark list ✅ (BookmarkListTest.spec.ts)
- `PUT /pimcore-studio/api/bundle/backend-power-tools/bl/update/{id}` - Update bookmark list by ID ✅ (BookmarkListTest.spec.ts)
- `DELETE /pimcore-studio/api/bundle/backend-power-tools/bl/{id}` - Delete bookmark list by ID ✅ (BookmarkListTest.spec.ts)
- `GET /pimcore-studio/api/bundle/backend-power-tools/bl/{id}` - Get bookmark list by ID ✅ (BookmarkListTest.spec.ts)
- `GET /pimcore-studio/api/bundle/backend-power-tools/bl/{id}/share/recipients` - Get bookmark list share recipients collection ✅ (BookmarkListTest.spec.ts)
- `PATCH /pimcore-studio/api/bundle/backend-power-tools/bl/{id}/share/recipients` - Patch bookmark list share recipients by ID ✅ (BookmarkListTest.spec.ts)
- `GET /pimcore-studio/api/bundle/backend-power-tools/bl/{id}/share/users` - Get bookmark list shareable users collection ✅ (BookmarkListTest.spec.ts)
- `GET /pimcore-studio/api/bundle/backend-power-tools/bl/{id}/tree` - Get all nodes for the bookmark list tree ✅ (BookmarkListTest.spec.ts)
- `POST /pimcore-studio/api/bundle/backend-power-tools/bl/{id}/tree/folder` - Add folder to bookmark list tree by ID ✅ (BookmarkListTest.spec.ts)
- `PUT /pimcore-studio/api/bundle/backend-power-tools/bl/{id}/tree/folder` - Rename folder in bookmark list tree ✅ (BookmarkListTest.spec.ts)
- `DELETE /pimcore-studio/api/bundle/backend-power-tools/bl/{id}/tree/items` - Remove items from bookmark list tree ✅ (BookmarkListTest.spec.ts)
- `POST /pimcore-studio/api/bundle/backend-power-tools/bl/{id}/tree/items` - Add or update items in bookmark list tree ✅ (BookmarkListTest.spec.ts)
- `GET /pimcore-studio/api/bundle/backend-power-tools/aet/class-definition/common-relation-fields` - List common relation fields ✅ (AlternativeElementTreeTest.spec.ts)
- `GET /pimcore-studio/api/bundle/backend-power-tools/aet/class-definition/fields` - List class definition fields ✅ (AlternativeElementTreeTest.spec.ts)
- `POST /pimcore-studio/api/bundle/backend-power-tools/aet/configuration` - Create AET configuration ✅ (AlternativeElementTreeTest.spec.ts)
- `GET /pimcore-studio/api/bundle/backend-power-tools/aet/configuration/default-perspective` - List configurations for default perspective ✅ (AlternativeElementTreeTest.spec.ts)
- `POST /pimcore-studio/api/bundle/backend-power-tools/aet/configuration/import` - Import AET configuration ✅ (AlternativeElementTreeTest.spec.ts)
- `GET /pimcore-studio/api/bundle/backend-power-tools/aet/configuration/list` - List configurations for admin settings ✅ (AlternativeElementTreeTest.spec.ts)
- `DELETE /pimcore-studio/api/bundle/backend-power-tools/aet/configuration/{configurationId}` - Delete AET configuration ✅ (AlternativeElementTreeTest.spec.ts)
- `GET /pimcore-studio/api/bundle/backend-power-tools/aet/configuration/{configurationId}` - Get AET configuration by ID ✅ (AlternativeElementTreeTest.spec.ts)
- `PUT /pimcore-studio/api/bundle/backend-power-tools/aet/configuration/{configurationId}` - Update AET configuration ✅ (AlternativeElementTreeTest.spec.ts)
- `POST /pimcore-studio/api/bundle/backend-power-tools/aet/configuration/{configurationId}/clone` - Clone AET configuration ✅ (AlternativeElementTreeTest.spec.ts)
- `GET /pimcore-studio/api/bundle/backend-power-tools/aet/configuration/{configurationId}/details` - Get configuration details ✅ (AlternativeElementTreeTest.spec.ts)
- `GET /pimcore-studio/api/bundle/backend-power-tools/aet/configuration/{configurationId}/export` - Export AET configuration ✅ (AlternativeElementTreeTest.spec.ts)
- `GET /pimcore-studio/api/bundle/backend-power-tools/aet/configurations` - List all AET configurations ✅ (AlternativeElementTreeTest.spec.ts)
- `GET /pimcore-studio/api/bundle/backend-power-tools/aet/data-object-classes` - List all data object classes ✅ (AlternativeElementTreeTest.spec.ts)
- `POST /pimcore-studio/api/bundle/backend-power-tools/aet/grid/batch-edit-ids` - Get batch edit IDs ✅ (AlternativeElementTreeTest.spec.ts)
- `POST /pimcore-studio/api/bundle/backend-power-tools/aet/grid/export-jobs` - Get export jobs for AET grid ✅ (AlternativeElementTreeTest.spec.ts)
- `POST /pimcore-studio/api/bundle/backend-power-tools/aet/grid/listing` - Get AET grid listing ✅ (AlternativeElementTreeTest.spec.ts)
- `GET /pimcore-studio/api/bundle/backend-power-tools/aet/object-brick/fields` - List object brick fields ✅ (AlternativeElementTreeTest.spec.ts)
- `GET /pimcore-studio/api/bundle/backend-power-tools/aet/precondition-filters` - List all precondition filters ✅ (AlternativeElementTreeTest.spec.ts)
- `GET /pimcore-studio/api/bundle/backend-power-tools/aet/tree` - Get alternative element tree ✅ (AlternativeElementTreeTest.spec.ts)
- `GET /pimcore-studio/api/bundle/backend-power-tools/aet/tree/{configurationId}/calculation-status` - Get calculation status ✅ (AlternativeElementTreeTest.spec.ts)
- `PATCH /pimcore-studio/api/bundle/backend-power-tools/aet/tree/{configurationId}/update/{objectId}` - Patch data object via AET ✅ (AlternativeElementTreeTest.spec.ts)
- `GET /pimcore-studio/api/bundle/backend-power-tools/aet/valid-languages` - List all valid languages ✅ (AlternativeElementTreeTest.spec.ts)

---

### Bundle CMF (53 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/bundle/cmf/activities` - List activities
- `POST /pimcore-studio/api/bundle/cmf/activities` - Create activity
- `GET /pimcore-studio/api/bundle/cmf/activities/view/list` - Render activity list view
- `DELETE /pimcore-studio/api/bundle/cmf/activities/{id}` - Delete activity
- `GET /pimcore-studio/api/bundle/cmf/activities/{id}` - Get activity by ID
- `PUT /pimcore-studio/api/bundle/cmf/activities/{id}` - Update activity
- `GET /pimcore-studio/api/bundle/cmf/activities/{id}/view/detail` - Render activity detail view
- `GET /pimcore-studio/api/bundle/cmf/automation-rules` - List automation rules
- `POST /pimcore-studio/api/bundle/cmf/automation-rules` - Create automation rule
- `DELETE /pimcore-studio/api/bundle/cmf/automation-rules/{id}` - Delete automation rule
- `GET /pimcore-studio/api/bundle/cmf/automation-rules/{id}` - Get automation rule by ID
- `PUT /pimcore-studio/api/bundle/cmf/automation-rules/{id}` - Update automation rule
- `GET /pimcore-studio/api/bundle/cmf/customers` - List customers
- `POST /pimcore-studio/api/bundle/cmf/customers` - Create customer
- `GET /pimcore-studio/api/bundle/cmf/customers/download-finished-export` - bundle_cmf_customers_export_download_summary
- `GET /pimcore-studio/api/bundle/cmf/customers/export` - bundle_cmf_customers_export_init_summary
- `GET /pimcore-studio/api/bundle/cmf/customers/export-step` - bundle_cmf_customers_export_step_summary
- `GET /pimcore-studio/api/bundle/cmf/customers/view/list` - Render customer list view
- `DELETE /pimcore-studio/api/bundle/cmf/customers/{id}` - Delete customer
- `GET /pimcore-studio/api/bundle/cmf/customers/{id}` - Get customer by ID
- `PUT /pimcore-studio/api/bundle/cmf/customers/{id}` - Update customer
- `PUT /pimcore-studio/api/bundle/cmf/customers/{id}/segments` - Update segments of a customer
- `GET /pimcore-studio/api/bundle/cmf/customers/{id}/view/detail` - Render customer detail view
- `GET /pimcore-studio/api/bundle/cmf/deletions` - List activity deletions
- `GET /pimcore-studio/api/bundle/cmf/duplicates/view/list` - Render duplicates list view
- `POST /pimcore-studio/api/bundle/cmf/duplicates/{id}/decline` - Decline a potential duplicate
- `POST /pimcore-studio/api/bundle/cmf/filter-definitions` - Create a filter definition
- `DELETE /pimcore-studio/api/bundle/cmf/filter-definitions/{id}` - Delete a filter definition
- `PUT /pimcore-studio/api/bundle/cmf/filter-definitions/{id}` - Update a filter definition
- `PUT /pimcore-studio/api/bundle/cmf/filter-definitions/{id}/share` - Share a filter definition with users
- `GET /pimcore-studio/api/bundle/cmf/helper/activity-types` - List available activity types
- `GET /pimcore-studio/api/bundle/cmf/helper/customer-fields` - List customer fields
- `GET /pimcore-studio/api/bundle/cmf/helper/grouped-segments` - List segments grouped by segment group
- `GET /pimcore-studio/api/bundle/cmf/helper/newsletter-filter-flags` - List possible newsletter filter flags
- `POST /pimcore-studio/api/bundle/cmf/newsletter/enqueue-all` - Enqueue all customers for newsletter sync
- `GET /pimcore-studio/api/bundle/cmf/newsletter/queue-size` - Get newsletter queue size
- `POST /pimcore-studio/api/bundle/cmf/segment-assignments/assign` - Assign segments to an element
- `GET /pimcore-studio/api/bundle/cmf/segment-assignments/assigned` - Get directly assigned segments for an element
- `GET /pimcore-studio/api/bundle/cmf/segment-assignments/breaks-inheritance` - Check if an element breaks segment inheritance
- `GET /pimcore-studio/api/bundle/cmf/segment-assignments/inheritable` - Get inheritable segments for an element
- `GET /pimcore-studio/api/bundle/cmf/segment-groups` - List segment groups
- `POST /pimcore-studio/api/bundle/cmf/segment-groups` - Create segment group
- `DELETE /pimcore-studio/api/bundle/cmf/segment-groups/{id}` - Delete segment group
- `GET /pimcore-studio/api/bundle/cmf/segment-groups/{id}` - Get segment group by ID
- `PUT /pimcore-studio/api/bundle/cmf/segment-groups/{id}` - Update segment group
- `GET /pimcore-studio/api/bundle/cmf/segments` - List segments
- `POST /pimcore-studio/api/bundle/cmf/segments` - Create segment
- `DELETE /pimcore-studio/api/bundle/cmf/segments/{id}` - Delete segment
- `GET /pimcore-studio/api/bundle/cmf/segments/{id}` - Get segment by ID
- `PUT /pimcore-studio/api/bundle/cmf/segments/{id}` - Update segment
- `GET /pimcore-studio/api/bundle/cmf/settings/api-keys` - Get all users with API keys
- `PUT /pimcore-studio/api/bundle/cmf/settings/api-keys` - Update API key for a user
- `GET /pimcore-studio/api/bundle/cmf/term-segment-builder-definitions` - List term segment builder definitions

---

### Bundle Copilot (37 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/bundle/copilot/actions` - Get all automation and interaction actions
- `POST /pimcore-studio/api/bundle/copilot/actions/automation/{name}/run` - Run automation action
- `POST /pimcore-studio/api/bundle/copilot/actions/interaction/{name}/execute` - One step interaction
- `POST /pimcore-studio/api/bundle/copilot/actions/interaction/{name}/{interactionId}/apply` - Apply chat response to element
- `POST /pimcore-studio/api/bundle/copilot/actions/interaction/{name}/{interactionId}/initial` - Send initial chat message
- `POST /pimcore-studio/api/bundle/copilot/actions/interaction/{name}/{interactionId}/prompt` - Send chat prompt
- `POST /pimcore-studio/api/bundle/copilot/configuration/automation-action` - Create an automation action configuration
- `GET /pimcore-studio/api/bundle/copilot/configuration/automation-action/environments` - List environment types
- `GET /pimcore-studio/api/bundle/copilot/configuration/automation-action/environments/help` - Get environment variables inline help
- `GET /pimcore-studio/api/bundle/copilot/configuration/automation-action/post-interactions` - List post interaction types
- `GET /pimcore-studio/api/bundle/copilot/configuration/automation-action/precondition-filters` - List precondition filters
- `GET /pimcore-studio/api/bundle/copilot/configuration/automation-action/step-implementations` - List step implementations
- `GET /pimcore-studio/api/bundle/copilot/configuration/automation-action/step-implementations/help` - Get step implementations inline help
- `DELETE /pimcore-studio/api/bundle/copilot/configuration/automation-action/{name}` - Delete an automation action configuration
- `GET /pimcore-studio/api/bundle/copilot/configuration/automation-action/{name}` - Get an automation action configuration
- `PUT /pimcore-studio/api/bundle/copilot/configuration/automation-action/{name}` - Update an automation action configuration
- `POST /pimcore-studio/api/bundle/copilot/configuration/clone` - Clone a Copilot configuration
- `GET /pimcore-studio/api/bundle/copilot/configuration/context-limitations` - List all available context limitations
- `GET /pimcore-studio/api/bundle/copilot/configuration/events` - List all available events
- `POST /pimcore-studio/api/bundle/copilot/configuration/export/{name}` - Export a Copilot configuration
- `POST /pimcore-studio/api/bundle/copilot/configuration/import` - Import Copilot configurations
- `POST /pimcore-studio/api/bundle/copilot/configuration/interaction-action` - Create an interaction action configuration
- `GET /pimcore-studio/api/bundle/copilot/configuration/interaction-action/types` - List interaction action types
- `GET /pimcore-studio/api/bundle/copilot/configuration/interaction-action/types/help` - Get interaction action types inline help
- `DELETE /pimcore-studio/api/bundle/copilot/configuration/interaction-action/{name}` - Delete an interaction action configuration
- `GET /pimcore-studio/api/bundle/copilot/configuration/interaction-action/{name}` - Get an interaction action configuration
- `PUT /pimcore-studio/api/bundle/copilot/configuration/interaction-action/{name}` - Update an interaction action configuration
- `GET /pimcore-studio/api/bundle/copilot/configuration/workflows` - List all available workflows
- `GET /pimcore-studio/api/bundle/copilot/configurations` - List all Copilot configurations
- `GET /pimcore-studio/api/bundle/copilot/data-objects` - List DataObject class definitions
- `POST /pimcore-studio/api/bundle/copilot/job-run/{id}/cancel` - Cancel running Copilot Job Run
- `GET /pimcore-studio/api/bundle/copilot/job-run/{id}/progress` - Get job run progress
- `POST /pimcore-studio/api/bundle/copilot/job-run/{id}/rerun` - Rerun existing Copilot Job Run
- `GET /pimcore-studio/api/bundle/copilot/job-runs` - List all job runs
- `GET /pimcore-studio/api/bundle/copilot/job-runs/running` - List of currently running Copilot Job Runs
- `GET /pimcore-studio/api/bundle/copilot/roles` - List roles for permissions grid
- `GET /pimcore-studio/api/bundle/copilot/users` - List users for permissions grid

---

### Bundle Custom Reports (11 endpoints) | Tested: 11 | Coverage: 100.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/bundle/custom-reports/chart` - Get chart data for a specific report ✅ (CustomReportTest.spec.ts)
- `POST /pimcore-studio/api/bundle/custom-reports/column-config/{name}` - Get all available column configurations ✅ (CustomReportTest.spec.ts)
- `POST /pimcore-studio/api/bundle/custom-reports/config/add` - Add a new custom reports configuration ✅ (CustomReportTest.spec.ts)
- `POST /pimcore-studio/api/bundle/custom-reports/config/clone/{name}` - Clone an existing custom reports configuration ✅ (CustomReportTest.spec.ts)
- `DELETE /pimcore-studio/api/bundle/custom-reports/config/{name}` - Delete a custom reports configuration ✅ (CustomReportTest.spec.ts)
- `PUT /pimcore-studio/api/bundle/custom-reports/config/{name}` - Update an existing custom reports configuration ✅ (CustomReportTest.spec.ts)
- `POST /pimcore-studio/api/bundle/custom-reports/drill-down-options` - Get all drill down options ✅ (CustomReportTest.spec.ts)
- `POST /pimcore-studio/api/bundle/custom-reports/export/csv` - Export report data as CSV ✅ (CustomReportTest.spec.ts)
- `GET /pimcore-studio/api/bundle/custom-reports/report/{name}` - Get detailed configuration for a specific report ✅ (CustomReportTest.spec.ts)
- `GET /pimcore-studio/api/bundle/custom-reports/tree` - All reports for the current user in tree ✅ (CustomReportTest.spec.ts)
- `GET /pimcore-studio/api/bundle/custom-reports/tree/config` - All reports for the current user in configuration tree ✅ (CustomReportTest.spec.ts)

---

### Bundle Data Hub (12 endpoints) | Tested: 12 | Coverage: 100.0%

#### Tested Endpoints
- `GET /pimcore-studio/api/bundle/data-hub/config` - Data Hub Config Collection ✅ (DataHubTest.spec.ts)
- `POST /pimcore-studio/api/bundle/data-hub/config/add` - Add Data Hub Configuration ✅ (DataHubTest.spec.ts)
- `POST /pimcore-studio/api/bundle/data-hub/config/clone` - Clone Data Hub Configuration ✅ (DataHubTest.spec.ts)
- `DELETE /pimcore-studio/api/bundle/data-hub/config/delete/{name}` - Delete Data Hub Configuration ✅ (DataHubTest.spec.ts)
- `POST /pimcore-studio/api/bundle/data-hub/config/import` - Import Data Hub Configuration ✅ (DataHubTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-hub/config/{name}` - Get Data Hub Configuration ✅ (DataHubTest.spec.ts)
- `PUT /pimcore-studio/api/bundle/data-hub/config/{name}` - Update Data Hub Configuration ✅ (DataHubTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-hub/config/{name}/export` - Export Data Hub Configuration ✅ (DataHubTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-hub/graphql/explorer-url/{name}` - Get GraphQL Explorer URL ✅ (DataHubTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-hub/graphql/explorer/{clientname}` - Get GraphQL Explorer ✅ (DataHubTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-hub/thumbnails` - Get Data Hub Thumbnails Collection ✅ (DataHubTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-hub/users` - Get Data Hub Users Collection ✅ (DataHubTest.spec.ts)

---

### Bundle Data Hub File Export (10 endpoints) | Tested: 10 | Coverage: 100.0%

#### Tested Endpoints
- `DELETE /pimcore-studio/api/bundle/data-hub-file-export/config/{name}` - Delete configuration ✅ (DataHubTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-hub-file-export/config/{name}` - Get configuration ✅ (DataHubTest.spec.ts)
- `PUT /pimcore-studio/api/bundle/data-hub-file-export/config/{name}` - Update configuration ✅ (DataHubTest.spec.ts)
- `PUT /pimcore-studio/api/bundle/data-hub-file-export/export/cancel` - Cancel export ✅ (DataHubTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-hub-file-export/export/progress` - Get export progress ✅ (DataHubTest.spec.ts)
- `PUT /pimcore-studio/api/bundle/data-hub-file-export/export/start` - Start export ✅ (DataHubTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-hub-file-export/exporter-services` - List exporter services ✅ (DataHubTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-hub-file-export/exporter-types` - List exporter types ✅ (DataHubTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-hub-file-export/thumbnails` - List thumbnail configurations ✅ (DataHubTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-hub-file-export/validate-cron` - Validate cron expression ✅ (DataHubTest.spec.ts)

---

### Bundle Data Hub Simple Rest (5 endpoints) | Tested: 5 | Coverage: 100.0%

#### Tested Endpoints
- `GET /pimcore-studio/api/bundle/data-hub-simple-rest/config/{name}` - Get configuration detail ✅ (DataHubTest.spec.ts)
- `PUT /pimcore-studio/api/bundle/data-hub-simple-rest/config/{name}` - Update configuration ✅ (DataHubTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-hub-simple-rest/config/{name}/label-list` - Get label list ✅ (DataHubTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-hub-simple-rest/queue/item-count` - Get queue item count ✅ (DataHubTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-hub-simple-rest/thumbnails` - Get thumbnail collection ✅ (DataHubTest.spec.ts)

---

### Bundle Data Hub Webhooks (3 endpoints) | Tested: 3 | Coverage: 100.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/bundle/data-hub-webhooks/config/test-subscribers` - Test subscriber URLs ✅ (DataHubTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-hub-webhooks/config/{name}` - Get Webhooks configuration detail ✅ (DataHubTest.spec.ts)
- `PUT /pimcore-studio/api/bundle/data-hub-webhooks/config/{name}` - Update Webhooks configuration ✅ (DataHubTest.spec.ts)

---

### Bundle Data Importer (20 endpoints) | Tested: 20 | Coverage: 100.0%

#### Tested Endpoints
- `GET /pimcore-studio/api/bundle/data-importer/classificationstore/attributes` - Load Classification Store Attributes ✅ (DataImporterTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-importer/classificationstore/key-name` - Load Classification Store Key Name ✅ (DataImporterTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-importer/classificationstore/keys` - Load Classification Store Keys ✅ (DataImporterTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-importer/config/{name}` - Get Data Importer Configuration ✅ (DataImporterTest.spec.ts)
- `PUT /pimcore-studio/api/bundle/data-importer/config/{name}` - Save Data Importer Configuration ✅ (DataImporterTest.spec.ts)
- `PUT /pimcore-studio/api/bundle/data-importer/config/{name}/cancel-execution` - Cancel Import Execution ✅ (DataImporterTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-importer/config/{name}/check-import-progress` - Check Import Progress ✅ (DataImporterTest.spec.ts)
- `POST /pimcore-studio/api/bundle/data-importer/config/{name}/column-headers` - Load Column Headers ✅ (DataImporterTest.spec.ts)
- `POST /pimcore-studio/api/bundle/data-importer/config/{name}/copy-preview` - Copy Preview Data ✅ (DataImporterTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-importer/config/{name}/has-import-file-uploaded` - Check Import File Status ✅ (DataImporterTest.spec.ts)
- `POST /pimcore-studio/api/bundle/data-importer/config/{name}/load-preview` - Load Preview Data ✅ (DataImporterTest.spec.ts)
- `PUT /pimcore-studio/api/bundle/data-importer/config/{name}/start-import` - Start Batch Import ✅ (DataImporterTest.spec.ts)
- `POST /pimcore-studio/api/bundle/data-importer/config/{name}/transformation-result` - Load Transformation Result Previews ✅ (DataImporterTest.spec.ts)
- `POST /pimcore-studio/api/bundle/data-importer/config/{name}/transformation-result-type` - Calculate Transformation Result Type ✅ (DataImporterTest.spec.ts)
- `POST /pimcore-studio/api/bundle/data-importer/config/{name}/upload-import-file` - Upload Import File ✅ (DataImporterTest.spec.ts)
- `POST /pimcore-studio/api/bundle/data-importer/config/{name}/upload-preview` - Upload Preview Data ✅ (DataImporterTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-importer/connection/list` - List Database Connections ✅ (DataImporterTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-importer/data-type/class-attributes` - Load Class Attributes ✅ (DataImporterTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-importer/data-type/unit-data` - Load Unit Data ✅ (DataImporterTest.spec.ts)
- `GET /pimcore-studio/api/bundle/data-importer/utility/check-crontab` - Validate Cron Expression ✅ (DataImporterTest.spec.ts)

---

### Bundle Data Quality Management (4 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/bundle/data-quality-management/color-settings` - List data quality color settings
- `GET /pimcore-studio/api/bundle/data-quality-management/detail-widget/{id}/{locale}` - Get data quality detail widget data
- `GET /pimcore-studio/api/bundle/data-quality-management/recommended-fields/{classId}` - List recommended fields for class
- `POST /pimcore-studio/api/bundle/data-quality-management/symfony-expression-validation/{classId}` - Validate Symfony expression

---

### Bundle Direct Edit (5 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `DELETE /pimcore-studio/api/bundle/direct-edit/assets/{id}/cancel` - Cancel direct edit session
- `POST /pimcore-studio/api/bundle/direct-edit/assets/{id}/confirm-upload` - Confirm uploaded asset version
- `POST /pimcore-studio/api/bundle/direct-edit/assets/{id}/generate-link` - Generate direct edit link
- `POST /pimcore-studio/api/bundle/direct-edit/assets/{id}/resolve-conflict` - Resolve version conflict
- `GET /pimcore-studio/api/bundle/direct-edit/assets/{id}/status` - Get direct edit status

---

### Bundle Ecommerce (26 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/bundle/ecommerce/fields` - Get Index Fields
- `GET /pimcore-studio/api/bundle/ecommerce/filter-groups` - Get Filter Groups
- `GET /pimcore-studio/api/bundle/ecommerce/index/filter-field-values` - Get filter field values
- `POST /pimcore-studio/api/bundle/ecommerce/orders/items/{id}/cancel` - Cancel order item
- `POST /pimcore-studio/api/bundle/ecommerce/orders/items/{id}/complaint` - Complain order item
- `PUT /pimcore-studio/api/bundle/ecommerce/orders/items/{id}/edit` - Edit order item
- `GET /pimcore-studio/api/bundle/ecommerce/orders/items/{id}/view/cancel` - Render order item cancel view
- `GET /pimcore-studio/api/bundle/ecommerce/orders/items/{id}/view/complaint` - Render order item complaint view
- `GET /pimcore-studio/api/bundle/ecommerce/orders/items/{id}/view/edit` - Render order item edit view
- `GET /pimcore-studio/api/bundle/ecommerce/orders/view/list` - Render order list view
- `GET /pimcore-studio/api/bundle/ecommerce/orders/{id}/view/detail` - Render order detail view
- `GET /pimcore-studio/api/bundle/ecommerce/pricing/config` - Get pricing config
- `GET /pimcore-studio/api/bundle/ecommerce/pricing/rules` - Get pricing rules
- `POST /pimcore-studio/api/bundle/ecommerce/pricing/rules` - Create pricing rule
- `PUT /pimcore-studio/api/bundle/ecommerce/pricing/rules/order` - Save pricing rules order
- `DELETE /pimcore-studio/api/bundle/ecommerce/pricing/rules/{id}` - Delete pricing rule
- `GET /pimcore-studio/api/bundle/ecommerce/pricing/rules/{id}` - Get pricing rule
- `PUT /pimcore-studio/api/bundle/ecommerce/pricing/rules/{id}` - Save pricing rule
- `POST /pimcore-studio/api/bundle/ecommerce/pricing/rules/{id}/copy` - Copy pricing rule
- `PUT /pimcore-studio/api/bundle/ecommerce/pricing/rules/{id}/rename` - Rename pricing rule
- `GET /pimcore-studio/api/bundle/ecommerce/tenants` - Get Tenants
- `POST /pimcore-studio/api/bundle/ecommerce/vouchers/{id}/reservations/cleanup` - Clean up voucher reservations
- `POST /pimcore-studio/api/bundle/ecommerce/vouchers/{id}/tokens/cleanup` - Clean up voucher tokens
- `GET /pimcore-studio/api/bundle/ecommerce/vouchers/{id}/tokens/export` - Export voucher tokens
- `POST /pimcore-studio/api/bundle/ecommerce/vouchers/{id}/tokens/generate` - Generate voucher tokens
- `GET /pimcore-studio/api/bundle/ecommerce/vouchers/{id}/view/tab` - Render voucher code tab view

---

### Bundle Enterprise Subscription Tools (1 endpoint) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/bundle/enterprise-subscription-tools/license/` - Check license and get environment information

---

### Bundle Headless Documents (17 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `POST /pimcore-studio/api/bundle/headless-documents/bricks` - Create a new brick
- `DELETE /pimcore-studio/api/bundle/headless-documents/bricks/detail/{name}` - Delete brick
- `GET /pimcore-studio/api/bundle/headless-documents/bricks/detail/{name}` - Get brick
- `PUT /pimcore-studio/api/bundle/headless-documents/bricks/detail/{name}` - Update brick
- `GET /pimcore-studio/api/bundle/headless-documents/bricks/help-info` - Get brick help info
- `GET /pimcore-studio/api/bundle/headless-documents/bricks/list` - Get bricks list
- `GET /pimcore-studio/api/bundle/headless-documents/bricks/tree` - Get bricks tree
- `GET /pimcore-studio/api/bundle/headless-documents/datahub/config/{name}` - Get DataHub configuration
- `PUT /pimcore-studio/api/bundle/headless-documents/datahub/config/{name}` - Update DataHub configuration
- `POST /pimcore-studio/api/bundle/headless-documents/templates` - Create a new template
- `DELETE /pimcore-studio/api/bundle/headless-documents/templates/detail/{name}` - Delete template
- `GET /pimcore-studio/api/bundle/headless-documents/templates/detail/{name}` - Get template
- `PUT /pimcore-studio/api/bundle/headless-documents/templates/detail/{name}` - Update template
- `GET /pimcore-studio/api/bundle/headless-documents/templates/help-info` - Get template help info
- `GET /pimcore-studio/api/bundle/headless-documents/templates/list` - Get templates list
- `GET /pimcore-studio/api/bundle/headless-documents/templates/tree` - Get templates tree
- `POST /pimcore-studio/api/bundle/headless-documents/{id}/brick/render` - Render area brick for headless document

---

### Bundle OpenID Connect (6 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/bundle/openid-connect/auth/debug` - OpenID Connect debug page
- `GET /pimcore-studio/api/bundle/openid-connect/auth/endpoint` - OpenID Connect OAuth2 callback endpoint
- `GET /pimcore-studio/api/bundle/openid-connect/auth/login` - OpenID Connect login redirect
- `GET /pimcore-studio/api/bundle/openid-connect/auth/script` - OpenID Connect login button script
- `GET /pimcore-studio/api/bundle/openid-connect/config` - Get OpenID Connect configuration
- `PUT /pimcore-studio/api/bundle/openid-connect/config` - Update OpenID Connect configuration

---

### Bundle Personalization (11 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/bundle/personalization/target-groups` - Get target group list
- `POST /pimcore-studio/api/bundle/personalization/target-groups` - Create a new target group
- `DELETE /pimcore-studio/api/bundle/personalization/target-groups/{id}` - Delete target group
- `GET /pimcore-studio/api/bundle/personalization/target-groups/{id}` - Get target group by ID
- `PUT /pimcore-studio/api/bundle/personalization/target-groups/{id}` - Update target group
- `GET /pimcore-studio/api/bundle/personalization/targeting-rules` - Get targeting rule list
- `POST /pimcore-studio/api/bundle/personalization/targeting-rules` - Create a new targeting rule
- `PUT /pimcore-studio/api/bundle/personalization/targeting-rules/priority` - Update targeting rule priorities
- `DELETE /pimcore-studio/api/bundle/personalization/targeting-rules/{id}` - Delete targeting rule
- `GET /pimcore-studio/api/bundle/personalization/targeting-rules/{id}` - Get targeting rule by ID
- `PUT /pimcore-studio/api/bundle/personalization/targeting-rules/{id}` - Update targeting rule

---

### Bundle Portal Engine (25 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `POST /pimcore-studio/api/bundle/portal-engine/collection` - Add Collection
- `POST /pimcore-studio/api/bundle/portal-engine/collection/list` - List Collections
- `GET /pimcore-studio/api/bundle/portal-engine/collection/list-portals` - List Portals
- `DELETE /pimcore-studio/api/bundle/portal-engine/collection/{collectionId}` - Delete Collection
- `PATCH /pimcore-studio/api/bundle/portal-engine/collection/{collectionId}` - Update Collection
- `GET /pimcore-studio/api/bundle/portal-engine/collection/{collectionId}/share-list` - List Collection Sharing
- `POST /pimcore-studio/api/bundle/portal-engine/collection/{collectionId}/share-list` - Update Collection Sharing
- `GET /pimcore-studio/api/bundle/portal-engine/collection/{collectionId}/tree-information` - Get Tree Information
- `GET /pimcore-studio/api/bundle/portal-engine/collection/{collectionId}/tree-items` - Get Tree Items
- `GET /pimcore-studio/api/bundle/portal-engine/collection/{collectionId}/tree-root-nodes` - Get Tree Root Nodes
- `POST /pimcore-studio/api/bundle/portal-engine/collection/{collectionId}/tree/add/{rootNodeId}` - Add Tree Item
- `POST /pimcore-studio/api/bundle/portal-engine/collection/{collectionId}/tree/delete/{rootNodeId}` - Delete Tree Items
- `GET /pimcore-studio/api/bundle/portal-engine/collection/{collectionId}/user-search` - Search User Groups
- `GET /pimcore-studio/api/bundle/portal-engine/collections/check-user-assignment` - Check Admin User Assignment
- `POST /pimcore-studio/api/bundle/portal-engine/frontend-build/update/{portalId}` - bundle_portal_engine_frontend_build_update_summary
- `GET /pimcore-studio/api/bundle/portal-engine/index-management` - List Indices
- `GET /pimcore-studio/api/bundle/portal-engine/index-management/queue-item-count` - Get Indexing Queue Count
- `POST /pimcore-studio/api/bundle/portal-engine/index-management/re-index` - Re-index Indices
- `POST /pimcore-studio/api/bundle/portal-engine/index-management/update-index` - Update Index Mapping
- `GET /pimcore-studio/api/bundle/portal-engine/wizard/available-formats` - List Formats
- `GET /pimcore-studio/api/bundle/portal-engine/wizard/available-thumbnails` - List Thumbnails
- `POST /pimcore-studio/api/bundle/portal-engine/wizard/create-portal` - Create Portal
- `GET /pimcore-studio/api/bundle/portal-engine/wizard/custom-layouts/{classId}` - List Custom Layouts for Class
- `GET /pimcore-studio/api/bundle/portal-engine/wizard/icons` - List Icons
- `GET /pimcore-studio/api/bundle/portal-engine/wizard/{tmpStoreKey}/status` - Check Portal Creation Status

---

### Bundle Statistics Explorer (3 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/bundle/statistics-explorer/custom-reports/data-sources` - Get custom reports data sources
- `GET /pimcore-studio/api/bundle/statistics-explorer/custom-reports/data-sources/{dataSource}/fields` - Get custom reports data sources fields
- `POST /pimcore-studio/api/bundle/statistics-explorer/custom-reports/data-sources/{dataSource}/fields/settings` - Get custom reports data sources fields settings

---

### Bundle Studio Dashboards (18 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `POST /pimcore-studio/api/bundle/studio-dashboards/dashboard` - Create dashboard configuration
- `POST /pimcore-studio/api/bundle/studio-dashboards/dashboard/import/{dashboardId}` - Import dashboard
- `DELETE /pimcore-studio/api/bundle/studio-dashboards/dashboard/{dashboardId}` - Delete dashboard by ID
- `GET /pimcore-studio/api/bundle/studio-dashboards/dashboard/{dashboardId}` - Get dashboard by ID
- `PUT /pimcore-studio/api/bundle/studio-dashboards/dashboard/{dashboardId}` - Update dashboard configuration by ID
- `GET /pimcore-studio/api/bundle/studio-dashboards/dashboard/{dashboardId}/export` - Export dashboard by ID
- `PUT /pimcore-studio/api/bundle/studio-dashboards/dashboard/{dashboardId}/update-menu-shortcut` - Update dashboard menu shortcut
- `GET /pimcore-studio/api/bundle/studio-dashboards/dashboards` - List dashboards
- `GET /pimcore-studio/api/bundle/studio-dashboards/layout-options` - Get layout options
- `GET /pimcore-studio/api/bundle/studio-dashboards/widgets/configurations` - Get widget configurations
- `GET /pimcore-studio/api/bundle/studio-dashboards/widgets/types` - Get widget types
- `POST /pimcore-studio/api/bundle/studio-dashboards/widgets/{widgetType}/configuration` - Create widget configuration
- `DELETE /pimcore-studio/api/bundle/studio-dashboards/widgets/{widgetType}/configuration/{widgetId}` - Delete widget configuration by id and type
- `GET /pimcore-studio/api/bundle/studio-dashboards/widgets/{widgetType}/configuration/{widgetId}` - Get widget configuration by id
- `PUT /pimcore-studio/api/bundle/studio-dashboards/widgets/{widgetType}/configuration/{widgetId}` - Update widget configuration by id and type
- `GET /pimcore-studio/api/bundle/studio-dashboards/widgets/{widgetType}/configurations` - Get widget configuration options by type
- `GET /pimcore-studio/api/bundle/studio-dashboards/widgets/{widgetType}/data/{widgetId}` - Get widget data by id and type
- `GET /pimcore-studio/api/bundle/studio-dashboards/widgets/{widgetType}/visualizations` - Get widget visualizations by type

---

### Bundle Translations Provider Interfaces (19 endpoints) | Tested: 19 | Coverage: 100.0%

#### Tested Endpoints
- `GET /pimcore-studio/api/bundle/translations-provider-interfaces/config` - Get configuration detail ✅ (TranslationsProviderTest.spec.ts)
- `PUT /pimcore-studio/api/bundle/translations-provider-interfaces/config` - Update configuration ✅ (TranslationsProviderTest.spec.ts)
- `GET /pimcore-studio/api/bundle/translations-provider-interfaces/config/ui-settings` - Get UI settings ✅ (TranslationsProviderTest.spec.ts)
- `POST /pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/action/{jobId}/cancel` - Cancel a translation job ✅ (TranslationsProviderTest.spec.ts)
- `POST /pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/action/{jobId}/check-redelivery` - Check redelivery for a translation job ✅ (TranslationsProviderTest.spec.ts)
- `POST /pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/action/{jobId}/delete` - Delete a translation job ✅ (TranslationsProviderTest.spec.ts)
- `POST /pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/action/{jobId}/process` - Process translation results ✅ (TranslationsProviderTest.spec.ts)
- `POST /pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/action/{jobId}/receive` - Receive translation results ✅ (TranslationsProviderTest.spec.ts)
- `POST /pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/action/{jobId}/reset-error` - Reset error state ✅ (TranslationsProviderTest.spec.ts)
- `POST /pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/action/{jobId}/submit` - Submit a translation job ✅ (TranslationsProviderTest.spec.ts)
- `GET /pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/data/{jobId}/export` - Get export data ✅ (TranslationsProviderTest.spec.ts)
- `GET /pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/data/{jobId}/export-xml` - Get XML export data ✅ (TranslationsProviderTest.spec.ts)
- `GET /pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/data/{jobId}/result` - Get result data ✅ (TranslationsProviderTest.spec.ts)
- `GET /pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/data/{jobId}/result-xml` - Get XML result data ✅ (TranslationsProviderTest.spec.ts)
- `GET /pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/view/compare-result-data/{jobId}` - Get compare result data view ✅ (TranslationsProviderTest.spec.ts)
- `GET /pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/view/list` - Get translation jobs queue list view ✅ (TranslationsProviderTest.spec.ts)
- `GET /pimcore-studio/api/bundle/translations-provider-interfaces/translation-jobs/view/resolve-elements` - Get resolve elements view ✅ (TranslationsProviderTest.spec.ts)
- `POST /pimcore-studio/api/bundle/translations-provider-interfaces/translation/get-item-count` - Get number of selected items ✅ (TranslationsProviderTest.spec.ts)
- `POST /pimcore-studio/api/bundle/translations-provider-interfaces/translation/request` - Request translation of items ✅ (TranslationsProviderTest.spec.ts)

---

### Bundle Web To Print (10 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/bundle/web-to-print/settings` - Get Web to Print settings
- `PUT /pimcore-studio/api/bundle/web-to-print/settings` - Update Web to Print settings
- `GET /pimcore-studio/api/bundle/web-to-print/settings/test` - Test Web to Print PDF generation
- `POST /pimcore-studio/api/bundle/web-to-print/{documentId}/cancel-generation` - Cancel Web to Print PDF generation process
- `GET /pimcore-studio/api/bundle/web-to-print/{documentId}/check-pdf-dirty` - Check if Web to Print document is dirty
- `GET /pimcore-studio/api/bundle/web-to-print/{documentId}/generation-process-data` - Get Web to Print PDF generation process data
- `GET /pimcore-studio/api/bundle/web-to-print/{documentId}/pdf-download` - Download Web to Print generated PDF file
- `GET /pimcore-studio/api/bundle/web-to-print/{documentId}/pdf-stream` - Stream Web to Print generated PDF file
- `GET /pimcore-studio/api/bundle/web-to-print/{documentId}/processing-options` - Get Web to Print PDF generation processing options
- `POST /pimcore-studio/api/bundle/web-to-print/{documentId}/start-generation` - Start Web to Print PDF generation process

---

### Bundle Workflow Automation Integration (5 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/bundle/workflow-automation-integration/config/subscriber-pattern` - Get webhook subscriber URL validation pattern
- `GET /pimcore-studio/api/bundle/workflow-automation-integration/config/types` - List DataHub configurations by type
- `GET /pimcore-studio/api/bundle/workflow-automation-integration/config/{configId}/list-options` - Get N8N action options for a configuration
- `POST /pimcore-studio/api/bundle/workflow-automation-integration/export/graphql` - Export N8N GraphQL workflow as JSON file
- `POST /pimcore-studio/api/bundle/workflow-automation-integration/export/webhooks` - Export N8N Webhooks workflow as JSON file

---

### Bundle Workflow Designer (10 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/bundle/workflow-designer/roles` - Search Roles
- `GET /pimcore-studio/api/bundle/workflow-designer/support-elements` - List Support Elements
- `GET /pimcore-studio/api/bundle/workflow-designer/users` - Search Users
- `GET /pimcore-studio/api/bundle/workflow-designer/workflows` - List Workflows
- `POST /pimcore-studio/api/bundle/workflow-designer/workflows` - Create Workflow
- `POST /pimcore-studio/api/bundle/workflow-designer/workflows/import` - Import Workflow
- `DELETE /pimcore-studio/api/bundle/workflow-designer/workflows/{name}` - Delete Workflow
- `GET /pimcore-studio/api/bundle/workflow-designer/workflows/{name}` - Get Workflow
- `PUT /pimcore-studio/api/bundle/workflow-designer/workflows/{name}` - Save Workflow
- `GET /pimcore-studio/api/bundle/workflow-designer/workflows/{name}/export` - Export Workflow

---
