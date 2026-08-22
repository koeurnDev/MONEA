const fs = require('fs');

function deepMerge(target, source) {
  for (let key in source) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      if (target[key] === undefined) {
        target[key] = source[key];
      }
    }
  }
}

const en = JSON.parse(fs.readFileSync('d:/MONEA/src/i18n/en.json', 'utf8'));
const km = JSON.parse(fs.readFileSync('d:/MONEA/src/i18n/km.json', 'utf8'));

// Clone km to avoid modifying it in place during traversal if needed
const merged = JSON.parse(JSON.stringify(km));
deepMerge(merged, en);

fs.writeFileSync('d:/MONEA/src/i18n/km.json', JSON.stringify(merged, null, 2), 'utf8');
console.log('Successfully merged keys from en to km.');
