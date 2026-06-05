import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';
import * as fs from 'fs';
import * as path from 'path';

let authenticatedRequest: APIRequestContext;
const timestamp = Date.now();
const testDomain = 'messages';
const importKey = `test_import_${timestamp}`;
let tempCsvPath: string;

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    // Create a temporary CSV file for import
    tempCsvPath = path.join(__dirname, `test_import_${timestamp}.csv`);
    const csvContent = `"key";"en";"de"\n"${importKey}";"Imported English";"Importiert Deutsch"`;
    fs.writeFileSync(tempCsvPath, csvContent);
});

test.afterAll(async () => {
    // Clean up imported translation
    try {
        await authenticatedRequest.delete(
            `/pimcore-studio/api/translations/${encodeURIComponent(importKey)}?domain=${testDomain}`
        );
    } catch (e) {
        // Ignore
    }

    // Clean up temp file
    try {
        if (tempCsvPath && fs.existsSync(tempCsvPath)) {
            fs.unlinkSync(tempCsvPath);
        }
    } catch (e) {
        // Ignore
    }

    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

test('ImportTranslationsFromCsv', async () => {
    const response = await authenticatedRequest.post(
        `/pimcore-studio/api/translations/${testDomain}/import`,
        {
            multipart: {
                file: {
                    name: 'translations.csv',
                    mimeType: 'text/csv',
                    buffer: fs.readFileSync(tempCsvPath)
                },
                csvSettings: JSON.stringify({
                    delimiter: ';',
                    quoteChar: '"',
                    escapeChar: '\\',
                    lineTerminator: ''
                })
            }
        }
    );
    expect([200, 201]).toContain(response.status());
});
