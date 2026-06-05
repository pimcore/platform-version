
import * as fs from 'fs';
import * as path from 'path';

const apiSpecPath = process.argv[2];
const testsPath = process.argv[3];

const apiSpec = JSON.parse(fs.readFileSync(apiSpecPath, 'utf-8'));

const testedEndpoints = new Set<string>();

function findSpecFiles(dir: string): string[] {
    let files: string[] = [];
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            files = files.concat(findSpecFiles(fullPath));
        } else if (fullPath.endsWith('.spec.ts')) {
            files.push(fullPath);
        }
    }
    return files;
}

const testFiles = findSpecFiles(testsPath);

const methodRegex = /authenticatedRequest\.(get|post|put|delete|patch)\((`|')(.+?)(`|')/g;

for (const file of testFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    let match;
    while ((match = methodRegex.exec(content)) !== null) {
        const method = match[1].toUpperCase();
        let endpoint = match[3];
        
        // Normalize path parameters
        endpoint = endpoint.replace(/\/\${.+?}/g, '/{id}');

        testedEndpoints.add(`${method} ${endpoint}`);
    }
}

const allEndpoints: { [key: string]: { method: string; path: string; summary: string }[] } = {};
for (const path in apiSpec.paths) {
    for (const method in apiSpec.paths[path]) {
        const endpoint = apiSpec.paths[path][method];
        const tags = endpoint.tags || ['Uncategorized'];
        for (const tag of tags) {
            if (!allEndpoints[tag]) {
                allEndpoints[tag] = [];
            }
            allEndpoints[tag].push({
                method: method.toUpperCase(),
                path: path,
                summary: endpoint.summary || ''
            });
        }
    }
}

let report = '# API Coverage Report\\n\\n';

const sortedTags = Object.keys(allEndpoints).sort();

for (const tag of sortedTags) {
    report += `## ${tag}\\n\\n`;

    const tested = allEndpoints[tag].filter(endpoint => {
        const normalizedPath = endpoint.path.replace(/{\w+}/g, '{id}');
        return testedEndpoints.has(`${endpoint.method} ${normalizedPath}`);
    });

    const untested = allEndpoints[tag].filter(endpoint => {
        const normalizedPath = endpoint.path.replace(/{\w+}/g, '{id}');
        return !testedEndpoints.has(`${endpoint.method} ${normalizedPath}`);
    });

    if (tested.length > 0) {
        report += '### Tested\\n\\n';
        for (const endpoint of tested) {
            report += `- **${endpoint.method}** \`${endpoint.path}\` - ${endpoint.summary}\\n`;
        }
        report += '\\n';
    }

    if (untested.length > 0) {
        report += '### Untested\\n\\n';
        for (const endpoint of untested) {
            report += `- **${endpoint.method}** \`${endpoint.path}\` - ${endpoint.summary}\\n`;
        }
        report += '\\n';
    }
}

fs.writeFileSync('/Users/herbertroth/Studio-Test/studio-tests/API_Coverage_Report.md', report);

console.log('API Coverage Report generated successfully.');
