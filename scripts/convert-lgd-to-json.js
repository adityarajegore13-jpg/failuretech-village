/**
 * Converts Maharashtra LGD Government ODT/XML files in DATABASE/
 * directly into data/villages.json in the required schema.
 * 
 * Run with: node scripts/convert-lgd-to-json.js
 */
const fs = require('fs');
const path = require('path');

const xmlPath = path.join(__dirname, '..', 'DATABASE', 'extracted_village', 'content.xml');
const outPath = path.join(__dirname, '..', 'data', 'villages.json');

if (!fs.existsSync(xmlPath)) {
  console.error(`❌ Source XML not found at ${xmlPath}`);
  console.log('Extract DATABASE/villageofSpecificState*.odt first.');
  process.exit(1);
}

console.log('🔄 Parsing Maharashtra LGD dataset...');

const stream = fs.createReadStream(xmlPath, { encoding: 'utf8', highWaterMark: 512 * 1024 });
let buffer = '';
let count = 0;
let inRows = false;
const villages = [];

stream.on('data', chunk => {
  buffer += chunk;
  if (!inRows) {
    const idx = buffer.indexOf('</table:table-header-rows>');
    if (idx !== -1) {
      inRows = true;
      buffer = buffer.slice(idx + 26);
    }
  }
  if (inRows) {
    let rStart = buffer.indexOf('<table:table-row');
    while (rStart !== -1) {
      let rEnd = buffer.indexOf('</table:table-row>', rStart);
      if (rEnd === -1) break;
      const rowXml = buffer.slice(rStart, rEnd + 18);
      buffer = buffer.slice(rEnd + 18);
      rStart = buffer.indexOf('<table:table-row');

      const cells = [];
      const cRegex = /<table:table-cell[^>]*>([\s\S]*?)<\/table:table-cell>/g;
      let cm;
      while ((cm = cRegex.exec(rowXml)) !== null) {
        let val = '';
        const cdataMatch = cm[1].match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
        if (cdataMatch) {
          val = cdataMatch[1].trim();
        } else {
          val = cm[1].replace(/<[^>]+>/g, '').trim();
        }
        cells.push(val);
      }

      if (cells.length >= 8 && cells[5] && cells[7]) {
        const district = cells[2];
        const taluka = cells[4];
        const lgdCode = cells[5];
        const villageName = cells[7];
        const census2011 = cells[11] || '';

        villages.push({
          name: villageName,
          taluka: taluka,
          district: district,
          state: 'Maharashtra',
          lgd_code: lgdCode,
          population: 0,
          literacy_rate: 0,
          sex_ratio: 0,
          households: 0,
          working_pop: 0,
          pincode: '',
          assembly: '',
          panchayat: `${villageName} Gram Panchayat`,
        });

        count++;
        if (count % 5000 === 0) {
          console.log(`⏳ Processed ${count} villages...`);
        }
      }
    }
  }
});

stream.on('end', () => {
  console.log(`✅ Extracted ${villages.length} total villages.`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(villages, null, 2), 'utf8');
  console.log(`📁 Saved to: ${outPath}`);
});
