import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
global.window=global;

const sources=[
  'data.js',
  'data-batch4.js','data-batch5.js','data-batch6.js','data-batch7.js','data-batch8.js','data-batch9.js','data-batch10.js','data-batch11.js','data-batch12.js','data-batch13.js','data-batch14.js','data-batch15.js',
  'data-canonical.js',
  'wardrobe-normalize.js'
];

for(const file of sources){
  const code=fs.readFileSync(path.join(root,file),'utf8');
  vm.runInThisContext(code,{filename:file});
}

const D=global.FITS_DATA;
if(!D)throw new Error('FITS_DATA was not created');
const errors=[];
const warnings=[];
const blocked=new Set(['look-07']);

const duplicates=(arr)=>{const seen=new Set(),dups=[];for(const x of arr||[]){if(!x?.id)continue;if(seen.has(x.id))dups.push(x.id);seen.add(x.id)}return [...new Set(dups)]};
for(const [label,arr] of [['piece',D.pieces],['look',D.looks],['family',D.families]]){
  const d=duplicates(arr);if(d.length)errors.push(`Duplicate ${label} IDs: ${d.join(', ')}`);
}

const pieceIds=new Set((D.pieces||[]).map(x=>x.id));
const lookIds=new Set((D.looks||[]).map(x=>x.id));
const familyIds=new Set((D.families||[]).map(x=>x.id));

for(const l of D.looks||[]){
  if(blocked.has(l.id))continue;
  if(!familyIds.has(l.family))errors.push(`${l.id}: missing family ${l.family}`);
  if(!Array.isArray(l.pieces)||!l.pieces.length)errors.push(`${l.id}: no pieces`);
  for(const p of l.pieces||[])if(!pieceIds.has(p))errors.push(`${l.id}: missing piece ${p}`);
  if(!l.image||!String(l.image).trim())errors.push(`${l.id}: no image`);
  const image=String(l.image||'').split('?')[0];
  if(image.startsWith('assets/')&&!fs.existsSync(path.join(root,image)))errors.push(`${l.id}: missing asset ${image}`);
}

for(const f of D.families||[]){
  const refs=(f.looks||[]).filter(id=>!blocked.has(id));
  if(!refs.length){warnings.push(`${f.id}: no live looks`);continue}
  for(const id of refs)if(!lookIds.has(id))errors.push(`${f.id}: missing look ${id}`);
  if(!blocked.has(f.hero)&&!lookIds.has(f.hero))errors.push(`${f.id}: missing hero ${f.hero}`);
}

const signatures=new Map();
for(const l of D.looks||[]){
  if(blocked.has(l.id))continue;
  const key=[...(l.pieces||[])].sort().join('|');
  if(!key)continue;
  const prev=signatures.get(key);
  if(prev)warnings.push(`Exact outfit duplicate: ${prev} and ${l.id}`);else signatures.set(key,l.id);
}

console.log(`Fits validator: ${D.pieces.length} pieces · ${D.looks.length} looks · ${D.families.length} families`);
for(const w of warnings)console.warn(`WARN: ${w}`);
if(errors.length){for(const e of errors)console.error(`ERROR: ${e}`);process.exit(1)}
console.log('Fits data integrity: OK');
