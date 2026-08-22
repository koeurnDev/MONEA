const fs = require('fs');
const en = JSON.parse(fs.readFileSync('d:/MONEA/src/i18n/en.json', 'utf8'));
const km = JSON.parse(fs.readFileSync('d:/MONEA/src/i18n/km.json', 'utf8'));

function countKeys(obj) {
  let count = 0;
  for (let key in obj) {
    count++;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key]);
    }
  }
  return count;
}

console.log('EN Keys:', countKeys(en));
console.log('KM Keys:', countKeys(km));
