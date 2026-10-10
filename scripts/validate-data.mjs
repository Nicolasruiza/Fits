import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

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
const pendingPath=path.join(root,'pending-look-assets.json');
const pendingConfig=fs.existsSync(pendingPath)?JSON.parse(fs.readFileSync(pendingPath,'utf8')):{assets:[]};
const pendingAssets=new Set(pendingConfig.assets||[]);
const duplicates=(arr)=>{const seen=new Set(),dups=[];for(const x of arr||[]){if(!x?.id)continue;if(seen.has(x.id))dups.push(x.id);seen.add(x.id)}return [...new Set(dups)]};
for(const [label,arr] of [['piece',D.pieces],['look',D.looks],['family',D.families]]){
  const d=duplicates(arr);if(d.length)errors.push(`Duplicate ${label} IDs: ${d.join(', ')}`);
}

const pieceIds=new Set((D.pieces||[]).map(x=>x.id));
const lookIds=new Set((D.looks||[]).map(x=>x.id));
const familyIds=new Set((D.families||[]).map(x=>x.id));
const referencedAssets=new Set();

for(const l of D.looks||[]){
  if(blocked.has(l.id))continue;
  if(!familyIds.has(l.family))errors.push(`${l.id}: missing family ${l.family}`);
  if(!Array.isArray(l.pieces)||!l.pieces.length)errors.push(`${l.id}: no pieces`);
  for(const p of l.pieces||[])if(!pieceIds.has(p))errors.push(`${l.id}: missing piece ${p}`);

  const rawImage=String(l.image||'').trim();
  if(!rawImage)errors.push(`${l.id}: no image`);
  else {
    const image=rawImage.split('?')[0];
    if(image.startsWith('assets/')){
      referencedAssets.add(image);
      if(!fs.existsSync(path.join(root,image)))errors.push(`${l.id}: missing asset ${image}`);
    }
  }
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
  if(prev)errors.push(`Exact outfit duplicate: ${prev} and ${l.id}`);else signatures.set(key,l.id);
}

// Generic numbered look assets should never silently land in /assets without a
// dataset record. Current intentionally-unassigned files must be listed in
// pending-look-assets.json so the debt is explicit rather than invisible.
const assetsDir=path.join(root,'assets');
const numberedAssets=fs.readdirSync(assetsDir)
  .filter(name=>/^look-\d+\.webp$/i.test(name))
  .map(name=>`assets/${name}`);
for(const asset of numberedAssets){
  if(referencedAssets.has(asset))continue;
  if(pendingAssets.has(asset))warnings.push(`Pending unassigned look asset: ${asset}`);
  else errors.push(`Orphan look asset is not referenced or tracked as pending: ${asset}`);
}
for(const asset of pendingAssets){
  if(!fs.existsSync(path.join(root,asset)))errors.push(`Pending look asset is missing: ${asset}`);
  if(referencedAssets.has(asset))warnings.push(`Pending manifest is stale; asset is now referenced: ${asset}`);
}

// Verify the actual page data pipelines, including pruning and photo overrides.
// Checking only the source batches previously missed looks dropped at runtime.
const pages=['index.html','detail.html','wardrobe.html','unlock.html','stats.html'];
const expected=new Set(D.looks.filter(l=>!blocked.has(l.id)&&!l.inspiration).map(l=>l.id));
const checkedWebps=new Set();
function validateRuntimeImage(page,look){
  const raw=String(look.image||'').trim();
  if(!raw){errors.push(`${page}: ${look.id} has no runtime image`);return}
  if(raw.startsWith('data:')||look.imageStatus){errors.push(`${page}: ${look.id} uses a placeholder instead of a photo`);return}
  const image=raw.split('?')[0];
  if(!image.startsWith('assets/'))return;
  const file=path.join(root,image);
  if(!fs.existsSync(file)){errors.push(`${page}: missing runtime image ${image}`);return}
  if(!/\.webp$/i.test(image)||checkedWebps.has(image))return;
  checkedWebps.add(image);
  const bytes=fs.readFileSync(file);
  const valid=bytes.length>=12&&bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP'&&bytes.readUInt32LE(4)+8===bytes.length;
  if(!valid)errors.push(`${page}: corrupt runtime WebP ${image}`);
}
const audit=JSON.parse(fs.readFileSync(path.join(root,'generated-photo-audit.json'),'utf8'));
for(const entry of audit.entries){
  if(!entry.asset){
    if(entry.status!=='source-unavailable')errors.push(`Unknown photo status: ${entry.lookId}`);
    continue;
  }
  const file=path.join(root,entry.asset);
  if(!fs.existsSync(file)){errors.push(`Photo audit: missing ${entry.asset}`);continue}
  const bytes=fs.readFileSync(file);
  if(bytes.subarray(0,4).toString()!=='RIFF'||bytes.subarray(8,12).toString()!=='WEBP'||bytes.readUInt32LE(4)+8!==bytes.length)errors.push(`Photo audit: invalid WebP ${entry.asset}`);
  if(crypto.createHash('sha256').update(bytes).digest('hex')!==entry.sha256)errors.push(`Photo audit: checksum mismatch ${entry.asset}`);
}
for(const page of pages){
  const html=fs.readFileSync(path.join(root,page),'utf8');
  const scripts=[...html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"/g)].map(m=>m[1]);
  const end=scripts.indexOf('dataset-integrity.js');
  if(end<0){errors.push(`${page}: missing data integrity pipeline`);continue}
  const context={document:{body:{dataset:{}}},localStorage:{getItem:()=>null,setItem:()=>{}}};
  context.window=context;
  vm.createContext(context);
  for(const file of scripts.slice(0,end+1))vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  const live=context.FITS_DATA,ids=new Set(live.looks.map(l=>l.id));
  for(const id of expected)if(!ids.has(id))errors.push(`${page}: runtime silently removed ${id}`);
  for(const look of live.looks){
    const family=live.families.find(f=>f.id===look.family);
    if(!family?.looks.includes(look.id))errors.push(`${page}: ${look.id} is unreachable from its family`);
    validateRuntimeImage(page,look);
  }
  for(const family of live.families){
    if(!family.looks.includes(family.hero))errors.push(`${page}: hero outside family ${family.id}`);
    for(const id of family.looks)if(live.looks.find(l=>l.id===id)?.family!==family.id)errors.push(`${page}: ${id} belongs to a different family`);
  }
  for(const entry of audit.entries){
    const look=live.looks.find(l=>l.id===entry.canonicalLookId);
    if(entry.asset&&look?.image.split('?')[0]!==entry.asset)errors.push(`${page}: photo mapping drift for ${entry.lookId}`);
    if(entry.status==='source-unavailable'&&ids.has(entry.lookId))errors.push(`${page}: unresolved photo published as ${entry.lookId}`);
  }
  if(context.FITS_HEALTH.removedForMissingPieces.length)errors.push(`${page}: missing wardrobe pieces dropped looks`);
  console.log(`${page}: ${live.looks.length} live looks · ${live.families.length} families`);
}
if(fs.existsSync(path.join(root,'staging/two-batches/assets.zip')))errors.push('Broken two-batch staging must not be published');
console.log(`Photo audit: ${audit.entries.filter(e=>e.asset).length} mapped entries; ${audit.entries.filter(e=>e.status==='source-unavailable').length} awaiting originals (not published)`);

console.log(`Fits validator: ${D.pieces.length} pieces · ${D.looks.length} looks · ${D.families.length} families`);
for(const w of warnings)console.warn(`WARN: ${w}`);
if(errors.length){for(const e of errors)console.error(`ERROR: ${e}`);process.exit(1)}
console.log('Fits data integrity: OK');
