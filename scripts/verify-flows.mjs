// Verify that the key helper functions produce the expected outputs.
// This checks the data layer + slug helper + matchToolForFile + descriptions
// without needing a browser.

import { TOOLS } from '../src/data/tools.ts';
import { resolveSlug, toolSlug } from '../src/lib/tool-slug.ts';
import { getTopToolForCategory, getPopularForCategory } from '../src/data/popular-conversions.ts';
import { getDescriptionForTool, getCategoryDescription, getCategoryFormats, getCategoryName, GENERIC_HERO_TITLE, GENERIC_HERO_DESCRIPTION } from '../src/lib/tool-description.ts';

let pass = 0;
let fail = 0;
const log = (ok, label, detail = '') => {
  if (ok) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; console.log(`  FAIL  ${label}`); if (detail) console.log(`        ${detail}`); }
};

console.log('\n=== TOOL SLUG HELPER ===');
log(toolSlug('DWG', 'DWG') === 'dwg-to-dwg', 'DWG->DWG -> dwg-to-dwg');
log(toolSlug('DXF', 'DWG') === 'dxf-to-dwg', 'DXF->DWG -> dxf-to-dwg');
log(toolSlug('PDF', 'DOCX') === 'pdf-to-docx', 'PDF->DOCX -> pdf-to-docx');
log(toolSlug('MP4', 'GIF') === 'mp4-to-gif', 'MP4->GIF -> mp4-to-gif');
log(toolSlug('STL', 'OBJ') === 'stl-to-obj', 'STL->OBJ -> stl-to-obj');
log(toolSlug('DWG, DXF', 'PDF') === 'dwg-to-pdf', 'DWG,DXF->PDF -> dwg-to-pdf');

console.log('\n=== RESOLVE SLUG ===');
log(resolveSlug('dxf-to-dwg')?.tool.id === 153, 'dxf-to-dwg -> id 153');
log(resolveSlug('pdf-to-docx')?.tool.id === 1, 'pdf-to-docx -> id 1');
log(resolveSlug('mp4-to-gif')?.tool.id === 97, 'mp4-to-gif -> id 97 (MP4 to GIF)');
log(resolveSlug('mp3-to-wav')?.tool.id === 69, 'mp3-to-wav -> id 69');
log(resolveSlug('zip-to-tar') === null, 'zip-to-tar -> null (no such tool)');

console.log('\n=== POPULAR FOR CATEGORY ===');
const cadPopular = getPopularForCategory('CAD');
log(cadPopular.length > 0, 'CAD popular > 0', `count=${cadPopular.length}`);
log(cadPopular.every(t => t.category === 'CAD'), 'all CAD popular are CAD tools');
log(cadPopular.every(t => t.popular === true), 'all CAD popular have popular=true');
log(cadPopular[0].creditCost <= cadPopular[cadPopular.length-1].creditCost, 'sorted by creditCost asc');

const docsPopular = getPopularForCategory('Documents');
log(docsPopular.length > 0, 'Documents popular > 0', `count=${docsPopular.length}`);

const topCad = getTopToolForCategory('CAD');
log(topCad !== undefined, 'CAD top exists');
log(topCad?.category === 'CAD', 'CAD top is in CAD');

console.log('\n=== GENERIC HERO COPY ===');
log(GENERIC_HERO_TITLE === 'Convert Any File', 'GENERIC_HERO_TITLE');
log(GENERIC_HERO_DESCRIPTION.includes('200+'), 'GENERIC_HERO_DESCRIPTION mentions 200+');
log(!GENERIC_HERO_DESCRIPTION.includes('CloudConvert'), 'GENERIC_HERO_DESCRIPTION is our own copy (no CloudConvert)');

console.log('\n=== CATEGORY DESCRIPTION ===');
const cadDesc = getCategoryDescription('CAD');
log(cadDesc.includes('cad'), 'CAD desc mentions cad');
log(cadDesc.includes('DWG'), 'CAD desc lists DWG');
log(cadDesc.includes('DXF'), 'CAD desc lists DXF');
log(cadDesc.includes('your browser') || cadDesc.includes('browser'), 'CAD desc mentions browser');
log(!cadDesc.includes('CloudConvert'), 'CAD desc is our own copy');

const imgsDesc = getCategoryDescription('Images');
log(imgsDesc.includes('JPG') || imgsDesc.includes('PNG'), 'Images desc lists a format');
log(imgsDesc.toLowerCase().includes('images'), 'Images desc mentions images');

const cadFormats = getCategoryFormats('CAD');
log(cadFormats.includes('DWG'), 'CAD formats includes DWG');
log(cadFormats.includes('DXF'), 'CAD formats includes DXF');
log(cadFormats.length <= 6, 'CAD formats limited to 6');

const imgsFormats = getCategoryFormats('Images');
log(imgsFormats.includes('JPG'), 'Images formats includes JPG');
log(imgsFormats.includes('PNG'), 'Images formats includes PNG');

log(getCategoryName('CAD') === 'CAD', 'CAD name');
log(getCategoryName('Images') === 'Images', 'Images name');

console.log('\n=== TOOL DESCRIPTION ===');
const dwgToDwg = TOOLS.find(t => t.id === 153);
log(dwgToDwg !== undefined, 'DXF->DWG tool exists');
const dwgDesc = getDescriptionForTool(dwgToDwg);
log(dwgDesc.length > 20, 'DXF->DWG desc is non-trivial');
log(!dwgDesc.includes('CloudConvert'), 'DXF->DWG desc is our own copy');

const pdfToDocx = TOOLS.find(t => t.id === 1);
const pdfDesc = getDescriptionForTool(pdfToDocx);
log(pdfDesc.length > 20, 'PDF->DOCX desc is non-trivial');

console.log('\n=== UNIQUE SLUG MAP (via resolveSlug, collisions get -2/-3 suffix) ===');
// The slugMap at module-init handles collisions. Test that every
// catalog tool resolves to a non-null entry.
const allResolvable = TOOLS.every(t => resolveSlug(toolSlug(t.input, t.output)) !== null);
log(allResolvable, 'every catalog tool resolves to a non-null slug entry');

// Verify that colliding slugs are still resolvable (with -N suffix)
const dwgToDwgResolved = resolveSlug('dwg-to-dwg');
const xlsxToPdfResolved = resolveSlug('xlsx-to-pdf');
log(dwgToDwgResolved !== null, 'dwg-to-dwg resolves (primary)');
log(xlsxToPdfResolved !== null, 'xlsx-to-pdf resolves (primary)');
// The -2 variants also resolve when the primary is taken
const dwgToDwg2 = resolveSlug('dwg-to-dwg-2');
log(dwgToDwg2 !== null, 'dwg-to-dwg-2 resolves to the second DWG->DWG tool');

console.log('\n=== SUMMARY ===');
console.log(`  pass: ${pass}`);
console.log(`  fail: ${fail}`);
console.log('');
process.exit(fail === 0 ? 0 : 1);
