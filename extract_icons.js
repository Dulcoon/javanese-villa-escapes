const fs = require('fs');
const path = require('path');

const dtsPath = path.join(__dirname, 'node_modules', 'material-symbols', 'index.d.ts');
const content = fs.readFileSync(dtsPath, 'utf8');

const matches = [...content.matchAll(/"([^"]+)"/g)].map(m => m[1]);
// matches contains the array of icon strings.
// Let's filter out ones that don't look like icons if any, though they should all be fine.

const outPath = path.join(__dirname, '../marmevilla-BE/resources/js/utils/material-icons.js');
const dir = path.dirname(outPath);
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(outPath, `export const MATERIAL_ICONS = ${JSON.stringify(matches)};\n`);
console.log(`Extracted ${matches.length} icons to ${outPath}`);
