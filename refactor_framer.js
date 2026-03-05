const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

const targetDirs = [
    path.join(__dirname, 'src', 'components', 'templates'),
    path.join(__dirname, 'src', 'components', 'landing'),
    path.join(__dirname, 'src', 'components', 'layout'),
    path.join(__dirname, 'src', 'components', 'wedding'),
    path.join(__dirname, 'src', 'components', 'ui'),
    path.join(__dirname, 'src', 'app')
];

targetDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        walkDir(dir, function (filePath) {
            if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.jsx')) {
                let content = fs.readFileSync(filePath, 'utf8');
                let newContent = content;

                // 1. Replace imports `import { motion }` with `import { m }`
                // Account for cases where it might be `import { motion, AnimatePresence }`
                if (newContent.includes('framer-motion')) {
                    newContent = newContent.replace(/import\s*\{\s*([^}]*?)\bmotion\b([^}]*?)\s*\}\s*from\s*(['"])framer-motion\3/g, (match, p1, p2, quote) => {
                        let imports = [p1.trim(), p2.trim()].filter(Boolean).map(s => s.replace(/^,|,$/g, '').trim()).filter(Boolean);
                        if (!imports.includes('m')) {
                            imports.push('m');
                        }
                        return `import { ${imports.join(', ')} } from ${quote}framer-motion${quote}`;
                    });
                }


                // 2. Replace all <motion.div ...> to <m.div ...></m.div> etc
                newContent = newContent.replace(/<motion\./g, '<m.');
                newContent = newContent.replace(/<\/motion\./g, '</m.');

                if (content !== newContent) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                    console.log(`Updated: ${filePath}`);
                }
            }
        });
    }
});
