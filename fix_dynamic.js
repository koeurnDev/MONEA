const fs = require('fs');
const path = require('path');

function getAllFiles(dir, pattern) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFiles(filePath, pattern));
        } else if (pattern.test(file)) {
            results.push(filePath);
        }
    });
    return results;
}

const appDir = path.join(__dirname, 'src', 'app');
const files = getAllFiles(appDir, /^(page|route|layout)\.tsx?$/);
let fixed = 0;

files.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    // Skip files that already have force-dynamic or are clearly static (no dynamic imports)
    if (content.includes('force-dynamic')) return;
    // Only add to files that use dynamic data (cookies, headers, db, auth, params)
    const needsDynamic =
        content.includes('getServerUser') ||
        content.includes('cookies()') ||
        content.includes('headers()') ||
        content.includes('prisma.') ||
        content.includes('searchParams') ||
        content.includes('params.') ||
        content.includes('useSearchParams');

    if (needsDynamic) {
        // For .tsx files (pages), add after 'use client' if present
        let newContent;
        if (content.startsWith('"use client"') || content.startsWith("'use client'")) {
            // Client components don't need force-dynamic
            return;
        } else {
            newContent = "export const dynamic = 'force-dynamic';\n" + content;
        }
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Fixed:', filePath.replace(__dirname, ''));
        fixed++;
    }
});

console.log(`\nDone! Fixed ${fixed} file(s).`);
