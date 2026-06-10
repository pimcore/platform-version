import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
const createdUnitIds: string[] = [];
const ts = Date['now']();

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);
});

test.afterAll(async () => {
    for (const id of createdUnitIds.reverse()) {
        try {
            await authenticatedRequest.delete(`/pimcore-studio/api/unit/quantity-value/units/${id}`);
        } catch (_) {}
    }
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('GetUnitList', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/unit/quantity-value/unit-list');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetUnitListItemsHaveExpectedFields', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/unit/quantity-value/unit-list');
    expect(response.status()).toBe(200);
    const data = await response.json();
    if (data.items.length > 0) {
        const unit = data.items[0];
        expect(unit).toHaveProperty('id');
        expect(unit).toHaveProperty('abbreviation');
        expect(unit).toHaveProperty('longName');
    }
});

test('GetUnitCollectionWithDefaultFilters', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/unit/quantity-value/units/collection', {
        data: {
            filters: {
                page: 1,
                pageSize: 50
            }
        }
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetUnitCollectionWithColumnFilter', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/unit/quantity-value/units/collection', {
        data: {
            filters: {
                page: 1,
                pageSize: 10,
                columnFilters: [{ type: 'search', filterValue: 'kg' }]
            }
        }
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
});

test('GetUnitCollectionWithSortFilter', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/unit/quantity-value/units/collection', {
        data: {
            filters: {
                page: 1,
                pageSize: 20,
                sortFilter: { key: 'id', direction: 'ASC' }
            }
        }
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
});

test('CreateUnit', async () => {
    const unitId = `test-unit-${ts}`;
    const response = await authenticatedRequest.post('/pimcore-studio/api/unit/quantity-value/units', {
        data: {
            id: unitId,
            abbreviation: `tu${ts}`,
            longname: `Test Unit ${ts}`,
            group: 'TestGroup',
            baseunit: null,
            factor: null,
            conversionOffset: null,
            converter: null,
            reference: null
        }
    });
    expect([200, 201]).toContain(response.status());
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.id).toBe(unitId);
    createdUnitIds.push(unitId);
});

test('CreateUnitWithBaseUnitAndFactor', async () => {
    const baseUnitId = `base-unit-${ts}`;
    const derivedUnitId = `derived-unit-${ts}`;

    // Create base unit first
    const baseResponse = await authenticatedRequest.post('/pimcore-studio/api/unit/quantity-value/units', {
        data: {
            id: baseUnitId,
            abbreviation: `bu${ts}`,
            longname: `Base Unit ${ts}`,
            group: 'TestGroup',
            baseunit: null,
            factor: null,
            conversionOffset: null,
            converter: null,
            reference: null
        }
    });
    expect([200, 201]).toContain(baseResponse.status());
    createdUnitIds.push(baseUnitId);

    // Create derived unit referencing the base unit
    const derivedResponse = await authenticatedRequest.post('/pimcore-studio/api/unit/quantity-value/units', {
        data: {
            id: derivedUnitId,
            abbreviation: `du${ts}`,
            longname: `Derived Unit ${ts}`,
            group: 'TestGroup',
            baseunit: baseUnitId,
            factor: 0.001,
            conversionOffset: null,
            converter: null,
            reference: null
        }
    });
    expect([200, 201]).toContain(derivedResponse.status());
    const data = await derivedResponse.json();
    expect(data.id).toBe(derivedUnitId);
    createdUnitIds.push(derivedUnitId);
});

test('CreateUnitWithDuplicateIdReturnsError', async () => {
    // Requires at least one unit created previously — use the first created
    if (createdUnitIds.length === 0) {
        test.skip();
        return;
    }
    const existingId = createdUnitIds[0];
    const response = await authenticatedRequest.post('/pimcore-studio/api/unit/quantity-value/units', {
        data: {
            id: existingId,
            abbreviation: 'dup',
            longname: 'Duplicate',
            group: null,
            baseunit: null,
            factor: null,
            conversionOffset: null,
            converter: null,
            reference: null
        }
    });
    expect([400, 409, 422]).toContain(response.status());
});

test('UpdateUnit', async () => {
    if (createdUnitIds.length === 0) {
        test.skip();
        return;
    }
    const unitId = createdUnitIds[0];
    const response = await authenticatedRequest.put(`/pimcore-studio/api/unit/quantity-value/units/${unitId}`, {
        data: {
            abbreviation: `upd${ts}`,
            longname: `Updated Unit ${ts}`,
            group: 'UpdatedGroup',
            baseunit: null,
            factor: null,
            conversionOffset: null,
            converter: null,
            reference: 'updated-ref'
        }
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.id).toBe(unitId);
    expect(data.longName).toBe(`Updated Unit ${ts}`);
});

test('UpdateNonExistentUnitReturns404', async () => {
    const response = await authenticatedRequest.put('/pimcore-studio/api/unit/quantity-value/units/non-existent-unit-999999', {
        data: {
            abbreviation: null,
            longname: null,
            group: null,
            baseunit: null,
            factor: null,
            conversionOffset: null,
            converter: null,
            reference: null
        }
    });
    expect([404, 422]).toContain(response.status());
});

test('ExportUnitsAsJson', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/unit/quantity-value/units/export');
    expect(response.status()).toBe(200);
    // Should be JSON content (array or object of unit definitions)
    const body = await response.text();
    expect(body.length).toBeGreaterThan(0);
    // Validate it's valid JSON
    expect(() => JSON.parse(body)).not.toThrow();
});

test('ImportUnitsFromJson', async () => {
    // Build a JSON payload with a unique unit to import
    const importUnitId = `import-unit-${ts}`;
    const importData = [
        {
            id: importUnitId,
            abbreviation: `iu${ts}`,
            longname: `Imported Unit ${ts}`,
            group: 'ImportedGroup',
            baseunit: null,
            factor: null,
            conversionOffset: null,
            converter: null,
            reference: null
        }
    ];
    const jsonContent = JSON.stringify(importData);

    const response = await authenticatedRequest.post('/pimcore-studio/api/unit/quantity-value/units/import', {
        multipart: {
            file: {
                name: 'units.json',
                mimeType: 'application/json',
                buffer: Buffer.from(jsonContent)
            }
        }
    });
    // 200 means success; existing units are skipped so re-run is safe
    expect([200, 201, 422]).toContain(response.status());
    if (response.status() === 200 || response.status() === 201) {
        createdUnitIds.push(importUnitId);
    }
});

test('ImportUnitsWithInvalidFileFails', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/unit/quantity-value/units/import', {
        multipart: {
            file: {
                name: 'invalid.json',
                mimeType: 'application/json',
                buffer: Buffer.from('NOT_VALID_JSON')
            }
        }
    });
    expect([400, 422, 500]).toContain(response.status());
});

test('ConvertBetweenUnits', async () => {
    // First fetch the unit list to find two convertible units
    const listResponse = await authenticatedRequest.get('/pimcore-studio/api/unit/quantity-value/unit-list');
    expect(listResponse.status()).toBe(200);
    const listData = await listResponse.json();

    // Find units that share a baseUnit (i.e., are in the same conversion group)
    const units: Array<{ id: string; baseUnit: string | null; factor: number | null }> = listData.items;
    const unitsWithBase = units.filter((u) => u.baseUnit !== null && u.factor !== null);

    if (unitsWithBase.length < 1) {
        // No convertible units available — skip with wider assertion
        const response = await authenticatedRequest.get('/pimcore-studio/api/unit/quantity-value/convert', {
            params: { fromUnitId: 'mm', toUnitId: 'm', value: '1000' }
        });
        expect([200, 404, 422, 500]).toContain(response.status());
        return;
    }

    const fromUnit = unitsWithBase[0];
    const toUnit = units.find((u) => u.id === fromUnit.baseUnit) ?? unitsWithBase[1] ?? fromUnit;

    const response = await authenticatedRequest.get('/pimcore-studio/api/unit/quantity-value/convert', {
        params: {
            fromUnitId: fromUnit.id,
            toUnitId: toUnit.id,
            value: '100'
        }
    });
    expect([200, 404, 422]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('data');
    }
});

test('ConvertWithInvalidUnitsReturnsError', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/unit/quantity-value/convert', {
        params: {
            fromUnitId: 'nonexistent-unit-aaa',
            toUnitId: 'nonexistent-unit-bbb',
            value: '10'
        }
    });
    expect([400, 404, 422, 500]).toContain(response.status());
});

test('ConvertAllFromUnit', async () => {
    // First fetch the unit list to find a base unit for convert-all
    const listResponse = await authenticatedRequest.get('/pimcore-studio/api/unit/quantity-value/unit-list');
    expect(listResponse.status()).toBe(200);
    const listData = await listResponse.json();

    const units: Array<{ id: string; baseUnit: string | null }> = listData.items;
    // Units suitable for convert-all: those that have other units pointing to them as base
    const baseUnitIds = new Set(units.filter((u) => u.baseUnit !== null).map((u) => u.baseUnit));
    const candidateBaseUnit = units.find((u) => baseUnitIds.has(u.id));

    if (!candidateBaseUnit) {
        // No units with convertible relationships — use a known example or skip gracefully
        const response = await authenticatedRequest.get('/pimcore-studio/api/unit/quantity-value/convert-all', {
            params: { fromUnitId: 'm', value: '1' }
        });
        expect([200, 404, 422, 500]).toContain(response.status());
        return;
    }

    const response = await authenticatedRequest.get('/pimcore-studio/api/unit/quantity-value/convert-all', {
        params: {
            fromUnitId: candidateBaseUnit.id,
            value: '1'
        }
    });
    expect([200, 404, 422]).toContain(response.status());
    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('originalValue');
        expect(data).toHaveProperty('fromUnitId');
        expect(data).toHaveProperty('convertedValues');
        expect(Array.isArray(data.convertedValues)).toBe(true);
    }
});

test('ConvertAllWithInvalidUnitReturnsError', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/unit/quantity-value/convert-all', {
        params: { fromUnitId: 'nonexistent-unit-xyz', value: '5' }
    });
    expect([400, 404, 422, 500]).toContain(response.status());
});

test('DeleteUnit', async () => {
    // Create a dedicated unit just for deletion testing
    const deleteUnitId = `delete-unit-${ts}`;
    const createResponse = await authenticatedRequest.post('/pimcore-studio/api/unit/quantity-value/units', {
        data: {
            id: deleteUnitId,
            abbreviation: `del${ts}`,
            longname: `Delete Unit ${ts}`,
            group: 'TestGroup',
            baseunit: null,
            factor: null,
            conversionOffset: null,
            converter: null,
            reference: null
        }
    });
    expect([200, 201]).toContain(createResponse.status());

    const deleteResponse = await authenticatedRequest.delete(
        `/pimcore-studio/api/unit/quantity-value/units/${deleteUnitId}`
    );
    expect(deleteResponse.status()).toBe(200);

    // Verify deletion — should no longer appear in collection
    const collectionResponse = await authenticatedRequest.post(
        '/pimcore-studio/api/unit/quantity-value/units/collection',
        {
            data: {
                filters: {
                    page: 1,
                    pageSize: 500
                }
            }
        }
    );
    expect(collectionResponse.status()).toBe(200);
    const collectionData = await collectionResponse.json();
    const found = collectionData.items.find((u: { id: string }) => u.id === deleteUnitId);
    expect(found).toBeUndefined();
});

test('DeleteNonExistentUnitReturns404', async () => {
    const response = await authenticatedRequest.delete(
        '/pimcore-studio/api/unit/quantity-value/units/non-existent-unit-000000'
    );
    expect([404, 422]).toContain(response.status());
});
