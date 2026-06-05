# API Coverage Report

## Overview
API endpoint testing coverage for the Pimcore Studio Backend API v2026.1.

## Statistics  
- **Total Endpoints**: 748 endpoints across 60 API tags
- **Core Endpoints** (non-bundle): 389
- **Bundle Endpoints**: 359
- **Currently Tested**: 216 endpoints
- **Overall Coverage**: 28.9% (216/748)
- **Core Coverage**: 55.5% (216/389)

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

### Asset Grid (9 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `DELETE /pimcore-studio/api/assets/grid/configuration/{configurationId}/delete` - Delete grid configuration
- `GET /pimcore-studio/api/assets/grid/available-columns` - Get available grid column configurations
- `GET /pimcore-studio/api/assets/grid/configuration/{folderId}` - Get asset grid configuration for folder
- `GET /pimcore-studio/api/assets/grid/configurations` - Get all saved grid configurations
- `DELETE /pimcore-studio/api/assets/grid/configuration/remove-favorite/{configurationId}/{folderId}` - Remove favorite config
- `POST /pimcore-studio/api/assets/grid/configuration/save` - Save asset grid configuration
- `POST /pimcore-studio/api/assets/grid/configuration/set-as-favorite/{configurationId}/{folderId}` - Set favorite config
- `PUT /pimcore-studio/api/assets/grid/configuration/update/{configurationId}` - Update grid configuration
- `POST /pimcore-studio/api/assets/grid` - Get asset data for grid

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

### Class Definition (67 endpoints) | Tested: 51 | Coverage: 76.1%

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

#### Untested Endpoints
- `POST /pimcore-studio/api/class/bulk-import/{fileId}` - Bulk import class definitions
- `DELETE /pimcore-studio/api/class/bulk-import/{fileId}` - Delete a prepared bulk import file
- `POST /pimcore-studio/api/class/bulk-import/prepare` - Prepare a bulk import
- `GET /pimcore-studio/api/class/custom-layout/editor/collection/{objectId}` - Get custom layout collection for object
- `POST /pimcore-studio/api/class/custom-layout/import/{customLayoutId}` - Import custom layout
- `POST /pimcore-studio/api/class/field-collection/{key}/import` - Import field collection from JSON
- `GET /pimcore-studio/api/class/field-collection/{objectId}/object/layout` - Get field collection layouts for object
- `GET /pimcore-studio/api/class/folder/{folderId}` - Get classes in folder
- `POST /pimcore-studio/api/class/definition/configuration-view/detail/{id}/import` - Import class definition from JSON
- `GET /pimcore-studio/api/class/object-brick/{key}/custom-layout/{customLayoutId}` - Get object brick custom layout
- `PUT /pimcore-studio/api/class/object-brick/{key}/custom-layout/{customLayoutId}` - Update object brick custom layout
- `DELETE /pimcore-studio/api/class/object-brick/{key}/custom-layout/{customLayoutId}` - Delete object brick custom layout
- `GET /pimcore-studio/api/class/object-brick/{key}/custom-layout/{customLayoutId}/export` - Export object brick custom layout
- `POST /pimcore-studio/api/class/object-brick/{key}/custom-layout/{customLayoutId}/import` - Import object brick custom layout
- `POST /pimcore-studio/api/class/object-brick/{key}/import` - Import object brick from JSON
- `GET /pimcore-studio/api/class/object-brick/{objectId}/object/layout` - Get object brick layouts for object

---

### Classification Store (29 endpoints) | Tested: 23 | Coverage: 79.3%

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

#### Untested Endpoints
- `GET /pimcore-studio/api/classification-store/collections` - Get collections for fieldName
- `GET /pimcore-studio/api/classification-store/groups` - Get groups for fieldName
- `GET /pimcore-studio/api/classification-store/key-group-relations` - Get key group relations for fieldName
- `GET /pimcore-studio/api/classification-store/layout-by-collection/{collectionId}` - Get layout for collection
- `GET /pimcore-studio/api/classification-store/layout-by-group/{groupId}` - Get layout for group
- `GET /pimcore-studio/api/classification-store/layout-by-key/{keyId}/{groupId}` - Get layout for key

---

### Data Objects (13 endpoints) | Tested: 8 | Coverage: 61.5%

#### Tested Endpoints
- `POST /pimcore-studio/api/data-objects/add/{parentId}` - Add a new data object
- `GET /pimcore-studio/api/data-objects/{id}` - Get data object by ID
- `PUT /pimcore-studio/api/data-objects/{id}` - Update data object by ID
- `PATCH /pimcore-studio/api/data-objects` - Patch data objects by ID
- `POST /pimcore-studio/api/data-objects/{id}/clone/{parentId}` - Clone data object
- `POST /pimcore-studio/api/data-objects/{sourceId}/replace/{targetId}` - Replace content of data object
- `GET /pimcore-studio/api/data-objects/{id}/layout` - Get layout of data object
- `GET /pimcore-studio/api/data-objects/tree` - Get all data object data for tree

#### Untested Endpoints
- `DELETE /pimcore-studio/api/data-objects/batch-delete` - Batch delete data objects by IDs
- `PATCH /pimcore-studio/api/data-objects/folder/{id}` - Patch all data objects based on folder ID and filters
- `POST /pimcore-studio/api/data-objects/format-path` - Format the path of the data
- `GET /pimcore-studio/api/data-objects/preview/{id}` - Preview data object by ID and site
- `POST /pimcore-studio/api/data-objects/select-options` - Get dynamic select options

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

### Documents (28 endpoints) | Tested: 15 | Coverage: 53.6%

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

#### Untested Endpoints
- `PUT /pimcore-studio/api/documents/{id}` - Update document by ID
- `POST /pimcore-studio/api/documents/{id}/convert/{type}` - Change document type
- `GET /pimcore-studio/api/documents/{id}/page/stream/preview` - Stream page document preview
- `PUT /pimcore-studio/api/documents/{id}/page-snippet/change-main-document` - Change main document
- `POST /pimcore-studio/api/documents/page-snippet/{id}/area-block/render` - Render area brick for editmode
- `GET /pimcore-studio/api/documents/renderlet/render` - Render a specific renderlet
- `POST /pimcore-studio/api/documents/{sourceId}/replace/{targetId}` - Replace document content
- `POST /pimcore-studio/api/documents/site/{id}` - Use document as site or update site
- `DELETE /pimcore-studio/api/documents/site/{id}` - Delete site by document ID
- `GET /pimcore-studio/api/documents/site/{documentId}` - Get site detail by document ID
- `POST /pimcore-studio/api/documents/translations/{id}/add/{translationId}` - Link translation document
- `DELETE /pimcore-studio/api/documents/translations/{id}/delete/{translationId}` - Delete translation document
- `GET /pimcore-studio/api/documents/translations/{id}/get-parent/{language}` - Get parent translation by language

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

### Elements (10 endpoints) | Tested: 3 | Coverage: 30.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/elements/{elementType}/folder/{parentId}` - Create element folder
- `DELETE /pimcore-studio/api/elements/{elementType}/delete/{id}` - Delete element and children
- `GET /pimcore-studio/api/elements/{elementType}/resolve` - Get ID of element with search term

#### Untested Endpoints
- `GET /pimcore-studio/api/elements/{elementType}/delete-info/{id}` - Get delete info of element
- `GET /pimcore-studio/api/elements/{elementType}/context-permissions/` - Get context permissions
- `GET /pimcore-studio/api/elements/{elementType}/location/{id}/{perspectiveId}` - Get location data
- `GET /pimcore-studio/api/elements/{elementType}/path` - Get element ID by path
- `GET /pimcore-studio/api/elements/{elementType}/subtype/{id}` - Get subtype of element
- `GET /pimcore-studio/api/elements/usage/{elementType}/{id}` - Get usage of element
- `POST /pimcore-studio/api/elements/usage/replace/{elementType}/{id}` - Replace all references to element

---

### Execution Engine (3 endpoints) | Tested: 1 | Coverage: 33.3%

#### Tested Endpoints
- `POST /pimcore-studio/api/execution-engine/running-jobs` - List studio jobs

#### Untested Endpoints
- `POST /pimcore-studio/api/execution-engine/abort/{jobRunId}` - Abort Job Run by ID
- `POST /pimcore-studio/api/execution-engine/hide` - Hide Job Runs by IDs

---

### Export (8 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/export/download/csv/{jobRunId}` - Download CSV file
- `DELETE /pimcore-studio/api/export/download/csv/{jobRunId}` - Delete CSV export file
- `POST /pimcore-studio/api/export/csv` - Create CSV file for elements
- `POST /pimcore-studio/api/export/csv/folder/{id}` - Create CSV file from folder
- `GET /pimcore-studio/api/export/download/xlsx/{jobRunId}` - Download XLSX file
- `DELETE /pimcore-studio/api/export/download/xlsx/{jobRunId}` - Delete XLSX export file
- `POST /pimcore-studio/api/export/xlsx` - Create XLSX file for elements
- `POST /pimcore-studio/api/export/xlsx/folder/{id}` - Create XLSX file from folder

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

### Metadata (6 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/metadata/asset` - Get predefined metadata for assets by type
- `GET /pimcore-studio/api/assets/{id}/custom-metadata` - Get custom metadata of asset by ID
- `POST /pimcore-studio/api/metadata` - Get predefined metadata collection with filtering
- `POST /pimcore-studio/api/metadata/predefined` - Create a new predefined metadata entry
- `PUT /pimcore-studio/api/metadata/predefined/{id}` - Update predefined metadata entry
- `DELETE /pimcore-studio/api/metadata/predefined/{id}` - Delete predefined metadata entry

---

### Notes (5 endpoints) | Tested: 5 | Coverage: 100.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/notes` - Get paginated notes
- `DELETE /pimcore-studio/api/notes/{id}` - Delete note with given id
- `GET /pimcore-studio/api/notes/{elementType}/{id}` - Get paginated notes for element
- `POST /pimcore-studio/api/notes/{elementType}/{id}` - Create note for element
- `GET /pimcore-studio/api/notes/type/{elementType}` - Get note types

---

### Notifications (8 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `POST /pimcore-studio/api/notifications` - Get paginated notifications
- `DELETE /pimcore-studio/api/notifications` - Delete all user notifications
- `GET /pimcore-studio/api/notifications/{id}` - Get notification by ID
- `POST /pimcore-studio/api/notifications/{id}` - Mark notification as read
- `DELETE /pimcore-studio/api/notifications/{id}` - Delete notification
- `GET /pimcore-studio/api/notifications/unread-count` - Count of unread notifications
- `GET /pimcore-studio/api/notifications/recipients` - Get notification recipients
- `POST /pimcore-studio/api/notifications/send` - Send a notification

---

### Perspectives (11 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `POST /pimcore-studio/api/perspectives/configuration` - Create a new perspective
- `GET /pimcore-studio/api/perspectives/configurations` - Get all perspective configurations
- `GET /pimcore-studio/api/perspectives/configuration/{perspectiveId}` - Get perspective by ID
- `PUT /pimcore-studio/api/perspectives/configuration/{perspectiveId}` - Update perspective
- `DELETE /pimcore-studio/api/perspectives/configuration/{perspectiveId}` - Delete perspective
- `POST /pimcore-studio/api/perspectives/widgets/{widgetType}/configuration` - Create widget
- `GET /pimcore-studio/api/perspectives/widgets/configurations` - Get all widget configurations
- `GET /pimcore-studio/api/perspectives/widgets/{widgetType}/configuration/{widgetId}` - Get widget config
- `PUT /pimcore-studio/api/perspectives/widgets/{widgetType}/configuration/{widgetId}` - Update widget
- `DELETE /pimcore-studio/api/perspectives/widgets/{widgetType}/configuration/{widgetId}` - Delete widget
- `GET /pimcore-studio/api/perspectives/widgets/types` - Get widget types

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

### Schedule (5 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `DELETE /pimcore-studio/api/schedules/{id}` - Delete schedule
- `GET /pimcore-studio/api/schedules/{elementType}/{id}` - Get schedules for element
- `PUT /pimcore-studio/api/schedules/{elementType}/{id}` - Update schedules for element
- `POST /pimcore-studio/api/schedules/{elementType}/{id}` - Create schedule for element
- `GET /pimcore-studio/api/schedules/actions/{elementType}` - List available schedule actions

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

### Settings (7 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/settings/available-countries` - Get all available countries
- `GET /pimcore-studio/api/settings` - Get system settings
- `PUT /pimcore-studio/api/settings` - Update system settings
- `GET /pimcore-studio/api/settings/adapter/image` - Check image adapter
- `GET /pimcore-studio/api/settings/active-bundles` - List all active bundles
- `GET /pimcore-studio/api/settings/ping` - Ping action
- `GET /settings/adapter/video` - Check video adapter validity

---

### Settings Admin (3 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/settings/admin` - Get admin appearance settings
- `POST /pimcore-studio/api/settings/admin/save` - Update admin appearance settings
- `GET /pimcore-studio/api/setting/admin/thumbnail` - Get thumbnail for admin settings

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

### Units (9 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `POST /pimcore-studio/api/unit/quantity-value/units/collection` - Get quantity value unit collection
- `GET /pimcore-studio/api/unit/quantity-value/convert-all` - Convert to all related units
- `GET /pimcore-studio/api/unit/quantity-value/convert` - Convert from one unit to another
- `POST /pimcore-studio/api/unit/quantity-value/units` - Create quantity value unit
- `PUT /pimcore-studio/api/unit/quantity-value/units/{id}` - Update quantity value unit
- `DELETE /pimcore-studio/api/unit/quantity-value/units/{id}` - Delete quantity value unit
- `GET /pimcore-studio/api/unit/quantity-value/units/export` - Export quantity value units as JSON
- `POST /pimcore-studio/api/unit/quantity-value/units/import` - Import quantity value units from JSON
- `GET /pimcore-studio/api/unit/quantity-value/unit-list` - List of available quantity value units

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

### Versions (9 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/versions/{id}/asset/download` - Download asset version
- `GET /pimcore-studio/api/versions/{id}/image/stream` - Stream image version thumbnail
- `GET /pimcore-studio/api/versions/{id}/pdf/stream` - Stream PDF version
- `GET /pimcore-studio/api/versions/{id}` - Get version by ID
- `PUT /pimcore-studio/api/versions/{id}` - Update version
- `POST /pimcore-studio/api/versions/{id}` - Publish version
- `DELETE /pimcore-studio/api/versions/{id}` - Delete version
- `GET /pimcore-studio/api/versions/{elementType}/{id}` - Get versions for element
- `DELETE /pimcore-studio/api/versions/{elementType}/{id}` - Cleanup all versions for element

---

### Website Settings (5 endpoints) | Tested: 5 | Coverage: 100.0%

#### Tested Endpoints
- `POST /pimcore-studio/api/website-settings/add` - Add a new website setting ✅ (WebsiteSettingsTest.spec.ts)
- `POST /pimcore-studio/api/website-settings` - Get paginated website settings ✅ (WebsiteSettingsTest.spec.ts)
- `PUT /pimcore-studio/api/website-settings/{id}` - Update a website setting ✅ (WebsiteSettingsTest.spec.ts)
- `DELETE /pimcore-studio/api/website-settings/{id}` - Delete a website setting ✅ (WebsiteSettingsTest.spec.ts)
- `GET /pimcore-studio/api/website-settings/types` - List all website setting types ✅ (WebsiteSettingsTest.spec.ts)

---

### Workflows (2 endpoints) | Tested: 0 | Coverage: 0.0%

#### Untested Endpoints
- `GET /pimcore-studio/api/workflows/details` - Get all workflow details of an element
- `POST /pimcore-studio/api/workflows/action` - Submit workflow action

---

## Bundle API Tags (359 endpoints total - all untested)

| Bundle Tag | Endpoints |
|---|---|
| Bundle Application Logger | 3 |
| Bundle Asset Metadata Class Definitions | 9 |
| Bundle Backend Power Tools | 36 |
| Bundle CMF | 53 |
| Bundle Copilot | 37 |
| Bundle Custom Reports | 11 |
| Bundle Data Hub | 12 |
| Bundle Data Hub File Export | 10 |
| Bundle Data Hub Simple Rest | 5 |
| Bundle Data Hub Webhooks | 3 |
| Bundle Data Importer | 20 |
| Bundle Data Quality Management | 4 |
| Bundle Direct Edit | 5 |
| Bundle Ecommerce | 26 |
| Bundle Enterprise Subscription Tools | 1 |
| Bundle Headless Documents | 17 |
| Bundle OpenID Connect | 6 |
| Bundle Personalization | 11 |
| Bundle Portal Engine | 24 |
| Bundle Statistics Explorer | 3 |
| Bundle Studio Dashboards | 18 |
| Bundle Translations Provider Interfaces | 19 |
| Bundle Web To Print | 10 |
| Bundle Workflow Automation Integration | 5 |
| Bundle Workflow Designer | 10 |

---

## Priority Recommendations

### High Priority (Core Features with 0% coverage)
1. **Documents** (0/28) - Core web content management
2. **Search** (0/7) - Core discovery functionality
3. **Versions** (0/9) - Content versioning

### Medium Priority (Partially covered or important)
1. **User Management** (1/23 - 4.3%) - Extend user operations
2. **Role Management** (0/12) - Access control
3. **Asset Grid** (0/9) - Asset listing/filtering
4. **E-Mails** (0/12) - Email log management
5. **Recycle Bin** (0/4) - Data recovery
6. **Export** (0/8) - Data export capabilities

### Low Priority (Advanced/Bundle Features)
1. **Notifications** (0/8)
2. **Translation** (0/11)
3. **Classification Store** (0/29)
4. **Perspectives** (0/11)
5. **All Bundle endpoints** (0/359)

---

*Report generated: 2025-05-15*
*API Version: 2026.1*
*Source: http://localhost:8088/pimcore-studio/api/docs/json*
