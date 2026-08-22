const fs = require('fs');

const en = JSON.parse(fs.readFileSync('src/i18n/en.json', 'utf8'));
const km = JSON.parse(fs.readFileSync('src/i18n/km.json', 'utf8'));

function findEnglish(objEn, objKm, path = '') {
    const englishKeys = [];
    for (const key in objEn) {
        const fullPath = path ? `${path}.${key}` : key;
        if (typeof objEn[key] === 'object' && objEn[key] !== null) {
            englishKeys.push(...findEnglish(objEn[key], objKm[key] || {}, fullPath));
        } else {
            if (objEn[key] === objKm[key] && objEn[key] !== '' && !/^\d+$/.test(objEn[key]) && !/^#/.test(objEn[key])) {
                // Check if it's purely English (excluding brands/numbers/hex)
                if (/[a-zA-Z]/.test(objEn[key])) {
                    englishKeys.push({ path: fullPath, value: objEn[key] });
                }
            }
        }
    }
    return englishKeys;
}

const englishValues = findEnglish(en, km);
console.log(JSON.stringify(englishValues, null, 2));
console.log(`\nTotal English values in km.json: ${englishValues.length}`);
