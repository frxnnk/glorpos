import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const file = path => new URL(path, import.meta.url);
const source = file('../docs/sources/howrare-glorp.json');
const manifestPath = file('../docs/sources/capture.json');
const endpoint = 'https://api.howrare.is/v0.1/collections/glorp/';
const refresh = process.argv.includes('--refresh');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
let raw = (await readFile(source, 'utf8')).replace(/^\uFEFF/, '');
if (refresh) {
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Catalog fetch: ${response.status}. Snapshot preserved.`);
  raw = await response.text();
}
const data = JSON.parse(raw).result.data;
const items = data.items.map(item => ({
  id: item.id, mint: item.mint, name: item.name, image: item.image,
  rank: item.rank, traits: Object.fromEntries(item.attributes.filter(a => a.name !== 'Attribute count').map(a => [a.name, a.value]))
})).sort((a, b) => a.id - b.id);
if (items.length !== 1337 || new Set(items.map(i => i.mint)).size !== 1337 || items.some((i,index) => i.id !== index+1)) throw new Error('Catalog integrity failed. Snapshot preserved.');
if (items.some(i => !/^https:\/\/ap-assets\.pinit\.io\//.test(i.image) || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(i.mint))) throw new Error('Unexpected catalog URL/mint. Snapshot preserved.');
const hash = createHash('sha256').update(raw).digest('hex');
if (!refresh && hash !== manifest.sha256) throw new Error('Source hash mismatch. Capture provenance must be checked.');
const catalog = { title: data.collection, capturedAt: refresh ? new Date().toISOString() : manifest.capturedAt, source: endpoint, sourceSha256: hash, count: items.length, items };
const traits = Object.keys(items[0].traits);
const cell = value => '"' + String(value ?? '').replaceAll('"','""') + '"';
const rows = [['ID','Name','Mint','Image URL','HowRare rank',...traits],...items.map(i => [i.id,i.name,i.mint,i.image,i.rank,...traits.map(t => i.traits[t])])];
if (refresh) {
  await writeFile(source, raw);
  await writeFile(manifestPath, JSON.stringify({...manifest,capturedAt:catalog.capturedAt,sha256:hash},null,2));
}
await writeFile(file('../public/data/glorp-catalog.json'), JSON.stringify(catalog));
await writeFile(file('../public/data/glorp-catalog.csv'), rows.map(row => row.map(cell).join(',')).join('\r\n'));
console.log(JSON.stringify({count:items.length,uniqueMints:new Set(items.map(i=>i.mint)).size,traits,bytes:JSON.stringify(catalog).length,capturedAt:catalog.capturedAt}));
