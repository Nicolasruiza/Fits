import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const assets=path.join(root,'assets');
const stage=path.join(root,'staging','looks60-67');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,c)=>fs.writeFileSync(path.join(root,p),c);

// 1) Rebuild the generated look archive. The original first chunk was
// accidentally staged at 10k chars; chunk-00b contains the missing 5k bridge.
const first=fs.readFileSync(path.join(stage,'chunk-00.txt'),'utf8').trim().slice(0,10000);
const bridge=fs.readFileSync(path.join(stage,'chunk-00b.txt'),'utf8').trim();
const rest=[];
for(let i=1;i<=8;i++)rest.push(fs.readFileSync(path.join(stage,`chunk-${String(i).padStart(2,'0')}.txt`),'utf8').trim());
const payload=first+bridge+rest.join('');
if(payload.length!==128660)throw new Error(`Unexpected staged base64 length ${payload.length}`);
const zipBytes=Buffer.from(payload,'base64');
const digest=crypto.createHash('sha256').update(zipBytes).digest('hex');
if(zipBytes.length!==96494||digest!=='fc05ae898790c08a9abff7eb159526c1029043de56e21dd150c32f0a6c1fa650'){
  throw new Error(`Generated archive integrity mismatch: ${zipBytes.length} bytes, ${digest}`);
}
const zip=path.join('/tmp','looks60-67.zip');
fs.writeFileSync(zip,zipBytes);
execFileSync('unzip',['-o',zip,'-d',assets],{stdio:'inherit'});

// 2) Convert the last two legacy embedded images to physical WebP assets by
// executing the same tiny payload scripts the browser used, rather than parsing them.
function migrateLegacy(id,files,outName){
  const sandbox={window:{FITS_IMG:{}}};
  sandbox.window.window=sandbox.window;
  for(const file of files)vm.runInNewContext(read(file),sandbox,{filename:file});
  let payload=String(sandbox.window.FITS_IMG?.[id]||'');
  payload=payload.replace(/^data:image\/webp;base64,/,'');
  const buf=Buffer.from(payload,'base64');
  if(buf.length<1000||buf.subarray(0,4).toString()!=='RIFF'||buf.subarray(8,12).toString()!=='WEBP'){
    throw new Error(`Invalid WebP payload for ${id}: ${buf.length} bytes`);
  }
  fs.writeFileSync(path.join(assets,outName),buf);
}
migrateLegacy('look-35',['image-35a.js','image-35b.js','image-35c.js'],'look-35-navy-denim.webp');
migrateLegacy('look-36',['image-36a.js','image-36b.js','image-36c.js'],'look-36-cardigan-henley-denim.webp');

// 3) Point 35/36 at physical assets.
let b5=read('data-batch5.js');
b5=b5.replace("addLook({id:'look-35',family:'family-navy-denim',name:'Navy polo + blue denim + white sneakers',image:'',","addLook({id:'look-35',family:'family-navy-denim',name:'Navy polo + blue denim + white sneakers',image:'assets/look-35-navy-denim.webp?v=1',");
b5=b5.replace("addLook({id:'look-36',family:'family-cardigan-henley-denim',name:'Charcoal cardigan + grey henley + blue denim',image:'',","addLook({id:'look-36',family:'family-cardigan-henley-denim',name:'Charcoal cardigan + grey henley + blue denim',image:'assets/look-36-cardigan-henley-denim.webp?v=1',");
write('data-batch5.js',b5);

// 4) Add generated 60-67 only as new formulas/variants; all new wardrobe items
// start missing and do not inherit ownership from image presence.
let canonical=read('data-canonical.js');
if(!canonical.includes("id:'look-60'")){
  const block=`
  // Inspiration intake 2026-09-16: app-ready generated looks.
  [
    {id:'black-tee',name:'Black crew-neck T-shirt',category:'Top'},
    {id:'green-buttonup',name:'Green button-up shirt',category:'Top'},
    {id:'burgundy-knit-polo',name:'Burgundy knit polo',category:'Top'},
    {id:'striped-blue-linen-shirt',name:'Blue striped linen shirt',category:'Top'},
    {id:'white-linen-shorts',name:'White linen shorts',category:'Pants'},
    {id:'tan-espadrilles',name:'Tan summer espadrilles',category:'Shoes'}
  ].forEach(upsertPiece);

  upsertFamily({id:'family-white-shirt-denim',name:'White shirt + denim',hero:'look-60',looks:['look-60']});
  upsertLook({id:'look-60',family:'family-white-shirt-denim',name:'White shirt + dark denim + white sneakers',image:'assets/look-60-white-shirt-denim.webp?v=1',formal:2,badges:['Weekend','Office','Dinner'],pieces:['white-shirt','dark-denim','white-leather-sneakers']});

  upsertFamily({id:'family-black-tee-denim',name:'Black tee + denim',hero:'look-61',looks:['look-61']});
  upsertLook({id:'look-61',family:'family-black-tee-denim',name:'Black tee + dark denim + white sneakers',image:'assets/look-61-black-tee-denim.webp?v=1',formal:1,badges:['Weekend','Travel','Dinner'],pieces:['black-tee','dark-denim','white-leather-sneakers']});

  upsertLook({id:'look-62',family:'family-lightblue-beige',name:'Light blue shirt + beige chinos + brown loafers',image:'assets/look-62-blue-shirt-beige.webp?v=1',formal:3,badges:['Office','Dinner','Weekend'],pieces:['light-blue-oxford','beige-chinos','brown-loafers','brown-belt']});
  addVariant('family-lightblue-beige','look-62');

  upsertFamily({id:'family-green-shirt-tan',name:'Green shirt + tan chinos',hero:'look-63',looks:['look-63']});
  upsertLook({id:'look-63',family:'family-green-shirt-tan',name:'Green button-up + tan chinos + brown loafers',image:'assets/look-63-green-shirt-tan.webp?v=1',formal:2,badges:['Weekend','Office','Dinner'],pieces:['green-buttonup','khaki-chinos','brown-loafers','brown-belt']});

  upsertFamily({id:'family-burgundy-knit-grey',name:'Burgundy knit + grey trousers',hero:'look-64',looks:['look-64']});
  upsertLook({id:'look-64',family:'family-burgundy-knit-grey',name:'Burgundy knit polo + grey trousers + dark loafers',image:'assets/look-64-burgundy-knit-grey.webp?v=1',formal:3,badges:['Office','Dinner','Travel'],pieces:['burgundy-knit-polo','grey-trousers','dark-loafers']});

  upsertFamily({id:'family-striped-linen-summer',name:'Striped linen summer',hero:'look-65',looks:['look-65']});
  upsertLook({id:'look-65',family:'family-striped-linen-summer',name:'Blue striped linen shirt + white linen shorts',image:'assets/look-65-striped-linen-shorts.webp?v=1',formal:1,badges:['Weekend','Travel'],pieces:['striped-blue-linen-shirt','white-linen-shorts','tan-espadrilles']});

  upsertLook({id:'look-66',family:'family-earth-suede',name:'Brown suede jacket + black polo + cream trousers + brown loafers',image:'assets/look-66-brown-suede-black-cream.webp?v=1',formal:3,badges:['Office','Dinner','Weekend'],pieces:['brown-suede-jacket','black-polo','cream-chinos','brown-loafers']});
  addVariant('family-earth-suede','look-66');

  upsertLook({id:'look-67',family:'family-green-khaki',name:'Green polo + cream trousers + white sneakers',image:'assets/look-67-green-polo-cream.webp?v=1',formal:2,badges:['Weekend','Office','Travel'],pieces:['green-polo','cream-chinos','white-leather-sneakers']});
  addVariant('family-green-khaki','look-67');
`;
  canonical=canonical.replace(/\n\}\)\(\);\s*$/,`${block}\n})();\n`);
  write('data-canonical.js',canonical);
}

// 5) Remove the legacy loaders and bump data cache keys everywhere.
for(const file of ['index.html','detail.html','wardrobe.html','unlock.html','stats.html']){
  let html=read(file);
  html=html.replace(/^\s*<script src="image-(?:35|36)[abc]\.js\?v=\d+"><\/script>\s*\n/gm,'');
  html=html.replace(/data-batch5\.js\?v=\d+/g,'data-batch5.js?v=16');
  html=html.replace(/data-canonical\.js\?v=\d+/g,'data-canonical.js?v=2');
  write(file,html);
}

// 6) The validator no longer needs an embedded-image exception.
let validator=read('scripts/validate-data.mjs');
validator=validator.replace(/const legacyEmbedded=new Map\([\s\S]*?\);\n\n/,'');
validator=validator.replace(/  if\(!rawImage\)\{[\s\S]*?\n  \} else \{\n    const image=rawImage\.split\('\?'\)\[0\];\n    if\(image\.startsWith\('assets\/'\)&&!fs\.existsSync\(path\.join\(root,image\)\)\)errors\.push\(`\$\{l\.id\}: missing asset \$\{image\}`\);\n  \}/,"  if(!rawImage)errors.push(`${l.id}: no image`);\n  else {\n    const image=rawImage.split('?')[0];\n    if(image.startsWith('assets/')&&!fs.existsSync(path.join(root,image)))errors.push(`${l.id}: missing asset ${image}`);\n  }");
write('scripts/validate-data.mjs',validator);

// 7) Remove obsolete payload scripts and staging debris.
for(const file of ['image-35a.js','image-35b.js','image-35c.js','image-36a.js','image-36b.js','image-36c.js','assets/look-60-white-shirt-denim.webp.b64','assets/look-61-black-tee-denim.webp.b64','assets/test.txt']){
  const p=path.join(root,file);if(fs.existsSync(p))fs.rmSync(p,{force:true});
}
fs.rmSync(stage,{recursive:true,force:true});

// 8) Every final image must be a real physical WebP.
for(const name of ['look-35-navy-denim.webp','look-36-cardigan-henley-denim.webp','look-60-white-shirt-denim.webp','look-61-black-tee-denim.webp','look-62-blue-shirt-beige.webp','look-63-green-shirt-tan.webp','look-64-burgundy-knit-grey.webp','look-65-striped-linen-shorts.webp','look-66-brown-suede-black-cream.webp','look-67-green-polo-cream.webp']){
  const p=path.join(assets,name);const b=fs.readFileSync(p);
  if(b.length<1000||b.subarray(0,4).toString()!=='RIFF'||b.subarray(8,12).toString()!=='WEBP')throw new Error(`Bad final asset ${name}`);
}
console.log('Finalized physical assets, canonical data, legacy cleanup, and cache bumps.');
