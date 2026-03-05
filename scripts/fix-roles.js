const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'src', 'app', 'api');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(targetDir);
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Pattern 1: user.role !== "OWNER" && user.role !== "ADMIN" && user.role !== "SUPERADMIN"
    content = content.replace(/user\.role !== "OWNER" && user\.role !== "ADMIN" && user\.role !== "SUPERADMIN"/g, 'user.role !== "ADMIN" && user.role !== "SUPERADMIN"');

    // Pattern 2: user.role !== "OWNER" && user.role !== "SUPERADMIN" && user.role !== "ADMIN"
    content = content.replace(/user\.role !== "OWNER" && user\.role !== "SUPERADMIN" && user\.role !== "ADMIN"/g, 'user.role !== "SUPERADMIN" && user.role !== "ADMIN"');

    // Pattern 3: user.role !== "SUPERADMIN" && user.role !== "OWNER"
    content = content.replace(/user\.role !== "SUPERADMIN" && user\.role !== "OWNER"/g, 'user.role !== "SUPERADMIN"');

    // Pattern 4: user.role !== "ADMIN" && user.role !== "SUPERADMIN" && user.role !== "OWNER"
    content = content.replace(/user\.role !== "ADMIN" && user\.role !== "SUPERADMIN" && user\.role !== "OWNER"/g, 'user.role !== "ADMIN" && user.role !== "SUPERADMIN"');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
        changedCount++;
    }
});

console.log(`Finished fixing ${changedCount} files.`);
