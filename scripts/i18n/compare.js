const fs = require('fs');

function getKeys(obj, prefix = '') {
  let keys = [];
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

const en = JSON.parse(fs.readFileSync('d:/MONEA/src/i18n/en.json', 'utf8'));
const km = JSON.parse(fs.readFileSync('d:/MONEA/src/i18n/km.json', 'utf8'));

const enKeys = getKeys(en);
const kmKeys = getKeys(km);

const missingInKm = enKeys.filter(k => !kmKeys.includes(k));
const missingInEn = kmKeys.filter(k => !enKeys.includes(k));

console.log('Missing in KM:', missingInKm);
console.log('Missing in EN:', missingInEn);
