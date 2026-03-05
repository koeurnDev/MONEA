const fs = require('fs');
const path = require('path');

function getAllRouteFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllRouteFiles(filePath));
        } else if (file === 'route.ts') {
            results.push(filePath);
        }
    });
    return results;
}

const apiDir = path.join(__dirname, 'src', 'app', 'api');
const routes = getAllRouteFiles(apiDir);
let fixed = 0;

routes.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('force-dynamic')) {
        const newContent = "export const dynamic = 'force-dynamic';\n" + content;
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Fixed:', filePath.replace(__dirname, ''));
        fixed++;
    }
});

console.log(`\nDone! Fixed ${fixed} route(s).`);
