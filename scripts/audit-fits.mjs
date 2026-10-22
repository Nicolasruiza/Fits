// FITS audit: relations, images, ownership and climate checks on the real runtime data pipeline.
//   node scripts/audit-fits.mjs           check only (exit 1 on new errors)
//   node scripts/audit-fits.mjs --write   also regenerate audit/ manifest and ChatGPT request list
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';

const root=process.cwd();
const write=process.argv.includes('--write');
const manifestPath=path.join(root,'audit','fits-audit-manifest.json');
const previous=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8')):null;
const baseline=previous?.knownDebt||{externalImages:[],noAlpha:[],opaqueBackground:[],pendingImages:[],orphanPieces:[],unusedAssets:[]};
for(const key of ['externalImages','noAlpha','opaqueBackground','pendingImages','orphanPieces','unusedAssets'])baseline[key]??=[];
// First run (no manifest yet): known-debt findings are reported as warnings, then frozen by --write.
const bootstrapping=write&&!previous;
const debt=(list,id,message)=>{if(list.includes(id))return;(bootstrapping?warn:err)(message)};

// Same script order the app uses for the detail page, stopping before its own UI code.
const html=fs.readFileSync(path.join(root,'detail.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
const stop=scripts.indexOf('detail-v3.js');
const context={document:{body:{dataset:{}}},localStorage:{getItem:()=>null,setItem:()=>{}}};
context.window=context;
vm.createContext(context);
for(const file of scripts.slice(0,stop)){
  if(file==='piece-image-overrides.js')context.PIECE_IMAGES=context.FITS_CATALOG_IMAGES||{};
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
}
const D=context.FITS_DATA,C=context.FITS_CLIMATE,IMAGES=context.PIECE_IMAGES||{};
if(!D||!C)throw new Error('FITS_DATA or FITS_CLIMATE missing from the runtime pipeline');

const errors=[],warnings=[];
const err=m=>errors.push(m),warn=m=>warnings.push(m);
const validStatus=new Set(['owned','missing']);
const validCategory=new Set(['Top','Pants','Shoes','Outerwear','Jackets','Accessory']);
const clean=src=>String(src||'').split('?')[0];
const isExternal=src=>/^https?:/i.test(src);

// ---- Images -------------------------------------------------------------------------------
function pngInfo(buffer){
  if(buffer.subarray(1,4).toString()!=='PNG')return null;
  const width=buffer.readUInt32BE(16),height=buffer.readUInt32BE(20),bitDepth=buffer[24],colorType=buffer[25];
  const hasAlpha=colorType===4||colorType===6||buffer.includes('tRNS');
  const info={format:'png',width,height,hasAlpha,cornersTransparent:null};
  if(bitDepth===8&&colorType===6){
    const idat=[];let offset=8;
    while(offset<buffer.length){
      const length=buffer.readUInt32BE(offset),type=buffer.subarray(offset+4,offset+8).toString();
      if(type==='IDAT')idat.push(buffer.subarray(offset+8,offset+8+length));
      offset+=12+length;
    }
    const raw=zlib.inflateSync(Buffer.concat(idat)),stride=width*4,rows=[];
    let previousRow=Buffer.alloc(stride);
    for(let y=0;y<height;y++){
      const filter=raw[y*(stride+1)],line=Buffer.from(raw.subarray(y*(stride+1)+1,(y+1)*(stride+1)));
      for(let x=0;x<stride;x++){
        const a=x>=4?line[x-4]:0,b=previousRow[x],c=x>=4?previousRow[x-4]:0;
        let add=0;
        if(filter===1)add=a;else if(filter===2)add=b;else if(filter===3)add=(a+b)>>1;
        else if(filter===4){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);add=pa<=pb&&pa<=pc?a:pb<=pc?b:c}
        line[x]=(line[x]+add)&255;
      }
      rows.push(line);previousRow=line;
    }
    const alphaAt=(x,y)=>rows[y][x*4+3];
    const corners=[[2,2],[width-3,2],[2,height-3],[width-3,height-3]].map(([x,y])=>alphaAt(x,y));
    info.cornersTransparent=corners.every(a=>a===0);
    let transparent=0;for(let y=0;y<height;y+=8)for(let x=0;x<width;x+=8)if(alphaAt(x,y)<8)transparent++;
    info.transparentShare=Math.round(transparent/Math.ceil(width/8)/Math.ceil(height/8)*100)/100;
  }
  return info;
}
function jpegInfo(buffer){
  if(buffer[0]!==0xff||buffer[1]!==0xd8)return null;
  let offset=2;
  while(offset<buffer.length-9){
    if(buffer[offset]!==0xff){offset++;continue}
    const marker=buffer[offset+1];
    if(marker>=0xc0&&marker<=0xcf&&![0xc4,0xc8,0xcc].includes(marker))return{format:'jpeg',height:buffer.readUInt16BE(offset+5),width:buffer.readUInt16BE(offset+7),hasAlpha:false};
    offset+=2+buffer.readUInt16BE(offset+2);
  }
  return{format:'jpeg',width:0,height:0,hasAlpha:false};
}
function webpInfo(buffer){
  if(buffer.subarray(0,4).toString()!=='RIFF'||buffer.subarray(8,12).toString()!=='WEBP')return null;
  const chunk=buffer.subarray(12,16).toString();
  if(chunk==='VP8X')return{format:'webp',width:1+buffer.readUIntLE(24,3),height:1+buffer.readUIntLE(27,3),hasAlpha:!!(buffer[20]&0x10)};
  if(chunk==='VP8L'){const bits=buffer.readUInt32LE(21);return{format:'webp',width:(bits&0x3fff)+1,height:((bits>>14)&0x3fff)+1,hasAlpha:!!((bits>>28)&1)}}
  return{format:'webp',width:0,height:0,hasAlpha:false};
}
const imageCache=new Map();
function inspectImage(src){
  const clean_=clean(src);
  if(!clean_)return{kind:'none'};
  if(isExternal(clean_))return{kind:'external',src:clean_};
  if(imageCache.has(clean_))return imageCache.get(clean_);
  const file=path.join(root,clean_);
  let result;
  if(!fs.existsSync(file))result={kind:'missing',src:clean_};
  else{
    const buffer=fs.readFileSync(file);
    const info=/\.png$/i.test(clean_)?pngInfo(buffer):/\.webp$/i.test(clean_)?webpInfo(buffer):/\.jpe?g$/i.test(clean_)?jpegInfo(buffer):null;
    result=info?{kind:'local',src:clean_,bytes:buffer.length,...info}:{kind:'invalid',src:clean_,bytes:buffer.length};
  }
  imageCache.set(clean_,result);
  return result;
}

// ---- Structure ------------------------------------------------------------------------------
const seen=new Set();
for(const p of D.pieces){
  if(seen.has(p.id))err(`Duplicate piece ID: ${p.id}`);seen.add(p.id);
  if(!validStatus.has(p.status))err(`${p.id}: invalid status "${p.status}"`);
  if(!validCategory.has(p.category))err(`${p.id}: invalid category "${p.category}"`);
  if(/^owned-/.test(p.id)&&p.status!=='owned')err(`${p.id}: owned-* piece is not marked owned`);
}
const pieceById=new Map(D.pieces.map(p=>[p.id,p]));
const looksByPiece=new Map(D.pieces.map(p=>[p.id,[]]));
for(const look of D.looks){
  if(!look.pieces?.length)err(`${look.id}: look has no pieces`);
  if(new Set(look.pieces).size!==look.pieces.length)err(`${look.id}: duplicate piece inside look`);
  for(const id of look.pieces||[]){
    if(!pieceById.has(id)){err(`${look.id}: broken piece reference ${id}`);continue}
    looksByPiece.get(id).push(look.id);
  }
  const slots=(look.pieces||[]).map(id=>pieceById.get(id)).filter(Boolean).map(p=>C.classify(p).slot);
  if(!slots.includes('bottom'))warn(`${look.id}: no trousers or shorts linked`);
  if(!slots.includes('shoes'))warn(`${look.id}: no shoes linked`);
}
const orphanPieces=D.pieces.filter(p=>!looksByPiece.get(p.id).length).map(p=>p.id);
for(const id of orphanPieces)if(!baseline.orphanPieces.includes(id))warn(`${id}: not used by any look`);

// ---- Piece images --------------------------------------------------------------------------
const pieceImage={};
const used=new Set();
for(const p of D.pieces){
  const src=IMAGES[p.id]||p.image||'';
  const info=inspectImage(src);
  pieceImage[p.id]=info;
  if(info.src&&info.kind==='local')used.add(info.src);
  if(info.kind==='none')debt(baseline.pendingImages,p.id,`${p.id}: piece has no individual image yet`);
  else if(info.kind==='missing'||info.kind==='invalid')err(`${p.id}: ${info.kind} piece image ${info.src||''}`);
  if(info.kind==='external')debt(baseline.externalImages,p.id,`${p.id}: new externally hosted piece image (store it in assets/)`);
  if(info.kind==='local'&&!info.hasAlpha)debt(baseline.noAlpha,p.id,`${p.id}: piece image has no alpha channel (${info.src})`);
  if(info.kind==='local'&&info.cornersTransparent===false)debt(baseline.opaqueBackground,p.id,`${p.id}: PNG corners are opaque, background is not transparent (${info.src})`);
}
const lookImage={};
for(const look of D.looks){
  const info=inspectImage(look.image);
  lookImage[look.id]=info;
  if(info.kind==='local')used.add(info.src);
  if(info.kind==='none'||info.kind==='missing'||info.kind==='invalid')err(`${look.id}: ${info.kind} look image ${info.src||''}`);
  if(info.kind==='external')debt(baseline.externalImages,look.id,`${look.id}: new externally hosted look image`);
}
const shared=new Map();
for(const look of D.looks){const key=clean(look.image);if(!key)continue;(shared.get(key)||shared.set(key,[]).get(key)).push(look.id)}
for(const [image,ids] of shared)if(ids.length>1)err(`Several looks share one image ${image}: ${ids.join(', ')}`);

const assetFiles=fs.readdirSync(path.join(root,'assets'),{recursive:true}).filter(f=>/\.(png|webp|jpe?g)$/i.test(f)).map(f=>`assets/${f}`);
const unusedAssets=assetFiles.filter(f=>!used.has(f)&&!/inspiration|approved|standardized/.test(f)||(/standardized/.test(f)&&!used.has(f)));
for(const f of unusedAssets)if(!baseline.unusedAssets.includes(f))warn(`Unused image: ${f}`);

// ---- Climate -------------------------------------------------------------------------------
for(const look of D.looks){
  const c=look.climate,classes=(look.pieces||[]).map(id=>pieceById.get(id)).filter(Boolean).map(p=>C.classify(p).cls);
  if(!c){err(`${look.id}: missing climate classification`);continue}
  const heavy=classes.includes('overcoat'),light=!classes.some(x=>['knit','heavy-knit','cardigan','overcoat','leather-jacket','casual-jacket','blazer','overshirt'].includes(x));
  if(heavy&&(c.seasons.includes('Summer')||c.thermal.includes('Warmer')))err(`${look.id}: heavy coat classified Summer/Warmer`);
  if(light&&(c.seasons.includes('Winter')||c.thermal.includes('Colder')))err(`${look.id}: light outfit classified Winter/Colder`);
  if(classes.includes('shorts')&&c.seasons.includes('Winter'))err(`${look.id}: shorts classified Winter`);
  if(classes.some(x=>x==='knit'||x==='heavy-knit')&&c.thermal.length===1&&c.thermal[0]==='Warmer')err(`${look.id}: sweater look classified Warmer only`);
  const expected=c.seasons.map(s=>C.legacySeason[s]);
  for(const s of expected)if(!look.seasons.includes(s))err(`${look.id}: legacy seasons ${look.seasons} drift from climate ${c.seasons}`);
  for(const s of look.seasons)if(!expected.includes(s)&&!(s==='Cold'&&look.winterLayerable))err(`${look.id}: season ${s} not backed by climate rules`);
  if(!c.seasons.length||!c.thermal.length)err(`${look.id}: empty climate classification`);
}
// Behavioural checks on the weather model.
const sample=(name,pieces)=>({id:name,pieces});
const hot={temp:30},cold={temp:-2},mild={temp:15};
const overcoatLook=D.looks.find(l=>(l.pieces||[]).some(id=>C.classify(pieceById.get(id)||{}).cls==='overcoat'));
const teeLook=D.looks.find(l=>l.climate?.warmth<=0.85);
if(overcoatLook&&C.eligible(overcoatLook,hot))err('Heavy coat looks must not be eligible at 30°C');
if(teeLook&&C.eligible(teeLook,cold))err('T-shirt looks must not be eligible at -2°C');
if(C.weatherContext({temp:3,apparent:-4}).thermal!=='Colder')err('Apparent temperature must drive the Colder band');
if(C.weatherContext(mild).thermal!=='Mild')err('15°C should be Mild');
if(C.weatherContext({temp:15,apparent:8},{indoor:true}).feelsC<=8)err('Indoor use must raise the effective temperature');

// ---- Ownership and reviews -----------------------------------------------------------------
const colorOf=name=>{const m=name.toLowerCase().match(/\b(off-?white|light grey|light gr[ae]y|charcoal|dark charcoal|navy|white|black|grey|gray|olive|green|cream|beige|tan|taupe|khaki|brown|cognac|camel|burgundy|chocolate|blue|red)\b/);return m?m[1].replace(/dark |light |off-?|gr[ae]y/,x=>x.trim()==='grey'||x.trim()==='gray'?'grey':x.trim()):'?'};
const groups=new Map();
for(const p of D.pieces){const key=`${p.category}|${C.classify(p).cls}|${colorOf(p.name)}`;(groups.get(key)||groups.set(key,[]).get(key)).push(p.id)}
const needsReview=[...groups.entries()].filter(([,ids])=>ids.length>1).map(([key,ids])=>({key,ids,reason:'Same category, garment class and colour family: confirm whether these are the same item or materially different.'}));

// ---- Report ----------------------------------------------------------------------------------
const owned=D.pieces.filter(p=>p.status==='owned').length;
const summary={pieces:D.pieces.length,owned,missing:D.pieces.length-owned,looks:D.looks.length,families:D.families.length,
  localPieceImages:Object.values(pieceImage).filter(i=>i.kind==='local').length,
  externalPieceImages:Object.values(pieceImage).filter(i=>i.kind==='external').length,
  pieceImagesWithoutAlpha:Object.values(pieceImage).filter(i=>i.kind==='local'&&!i.hasAlpha).length,
  externalLookImages:Object.values(lookImage).filter(i=>i.kind==='external').length,
  orphanPieces:orphanPieces.length,unusedAssets:unusedAssets.length,needsReviewGroups:needsReview.length};
console.log('FITS audit',JSON.stringify(summary));
for(const w of warnings)console.warn(`WARN: ${w}`);
if(errors.length){for(const e of errors)console.error(`ERROR: ${e}`);process.exit(1)}

if(write){
  const missingFor=look=>(look.pieces||[]).filter(id=>pieceById.get(id)?.status!=='owned');
  const manifest={
    generatedBy:'scripts/audit-fits.mjs --write',
    note:'Machine-readable audit state. Regenerate after data or image changes; knownDebt is the baseline the audit tolerates so only new problems fail CI.',
    summary,
    climateConfig:C.config.comfort&&{comfort:C.config.comfort,thermal:C.config.thermal,seasons:C.config.seasons,minOverlapC:C.config.minOverlapC},
    pieces:D.pieces.map(p=>({id:p.id,name:p.name,category:p.category,ownership:p.status,class:C.classify(p).cls,
      image:pieceImage[p.id].src||null,imageKind:pieceImage[p.id].kind,hasAlpha:pieceImage[p.id].hasAlpha??null,
      looks:looksByPiece.get(p.id)})),
    looks:D.looks.map(l=>({id:l.id,name:l.name,pieces:l.pieces,missingPieces:missingFor(l),image:lookImage[l.id].src||null,imageKind:lookImage[l.id].kind,
      seasons:l.climate.seasons,thermal:l.climate.thermal,comfortC:l.climate.comfortC,warmth:l.climate.warmth,winterLayerable:!!l.winterLayerable})),
    needsReview,
    knownDebt:{
      externalImages:[...Object.entries(pieceImage).filter(([,i])=>i.kind==='external').map(([id])=>id),...Object.entries(lookImage).filter(([,i])=>i.kind==='external').map(([id])=>id)],
      noAlpha:Object.entries(pieceImage).filter(([,i])=>i.kind==='local'&&!i.hasAlpha).map(([id])=>id),
      opaqueBackground:Object.entries(pieceImage).filter(([,i])=>i.kind==='local'&&i.cornersTransparent===false).map(([id])=>id),
      pendingImages:Object.entries(pieceImage).filter(([,i])=>i.kind==='none').map(([id])=>id),
      orphanPieces,unusedAssets
    }
  };
  fs.mkdirSync(path.dirname(manifestPath),{recursive:true});
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,1)+'\n');

  // ChatGPT request list: only what is genuinely missing, recoverable or unconfirmed.
  const referenceModel='assets/look-85-approved-intake.webp';
  const piecePrompt=p=>`Product photo of a single men's garment: ${p.name}. Ghost-mannequin (invisible body) presentation, front view, the garment alone with natural volume, faithful colour, texture and material. Fully transparent background with a real alpha channel (PNG), no white, beige or checkerboard background, no hanger, no person, no extra accessories. Centered, consistent framing, 1200x1200 px, soft realistic shading only inside the garment.`;
  const lookPrompt=l=>`Full-body editorial photograph of the approved FITS male model (use the attached reference ${referenceModel} for the same face, hair, build and proportions), adult and natural looking, walking confidently outdoors in front of the approved elegant stone facade with columns in an urban setting, natural daylight. One person only, shoes fully visible. Outfit exactly: ${(l.pieces||[]).map(id=>pieceById.get(id)?.name).join('; ')}. No collage, no floating garments, no side panels, no studio background.`;
  const lines=['# FITS image requests for ChatGPT','','Generated by `node scripts/audit-fits.mjs --write`. Do not request images that already exist.','',
    '## A. Pieces without a valid individual image (missing, no alpha channel or opaque background)',''];
  for(const [id,i] of Object.entries(pieceImage).filter(([,i])=>i.kind==='local'&&!i.hasAlpha)){
    const p=pieceById.get(id);
    lines.push(`### ${id} — ${p.name}`,`- Type: ${p.category} (${C.classify(p).cls}) · Ownership: ${p.status} · Used by: ${looksByPiece.get(id).join(', ')||'no look'}`,`- Existing image: \`${i.src}\` (${i.width}x${i.height}, no alpha)`,'- Reason: image must be replaced with a transparent-background version of the same garment.',`- Prompt: ${piecePrompt(p)}`,'');
  }
  for(const [id,i] of Object.entries(pieceImage).filter(([,i])=>i.kind==='none'||(i.kind==='local'&&i.cornersTransparent===false))){
    const p=pieceById.get(id);
    lines.push(`### ${id} — ${p.name}`,`- Type: ${p.category} (${C.classify(p).cls}) · Ownership: ${p.status} · Used by: ${looksByPiece.get(id).join(', ')||'no look'}`,i.kind==='none'?'- Existing image: none':`- Existing image: \`${i.src}\` (opaque background)`,i.kind==='none'?'- Reason: piece exists in the data but has no individual garment image yet.':'- Reason: the PNG has an opaque background instead of real transparency.',`- Prompt: ${piecePrompt(p)}`,'');
  }
  lines.push('## B. Looks without an approved local image','');
  const noLocalLook=D.looks.filter(l=>lookImage[l.id].kind!=='local');
  if(!noLocalLook.some(l=>lookImage[l.id].kind==='none'))lines.push('None: every live look has an image (see C for the ones still hosted externally).','');
  lines.push('## C. Generated but not recovered into the repository (hosted on an external CDN, not published locally)','',
    'These already exist: download them from the original generation history and add them to `assets/` rather than regenerating them.','');
  const cPieces=Object.entries(pieceImage).filter(([,i])=>i.kind==='external').map(([id])=>id);
  lines.push('### Pieces','');
  for(const id of cPieces){const p=pieceById.get(id);lines.push(`- \`${id}\` — ${p.name} (${p.status}) · looks: ${looksByPiece.get(id).join(', ')||'none'}`)}
  lines.push('','### Looks','');
  for(const l of D.looks.filter(l=>lookImage[l.id].kind==='external'))lines.push(`- \`${l.id}\` — ${l.name} · pieces: ${l.pieces.join(', ')}`);
  lines.push('','Fallback prompt if an original cannot be recovered (use the approved reference, do not invent a new model):','',`\`${lookPrompt({pieces:['<piece ids from the list above>']})}\``,'');
  lines.push('## D. References pending identification (possible duplicates, keep both until confirmed)','');
  for(const g of needsReview)lines.push(`- ${g.ids.map(id=>`\`${id}\` (${pieceById.get(id).name})`).join(' ↔ ')}`);
  lines.push('');
  fs.writeFileSync(path.join(root,'audit','chatgpt-image-requests.md'),lines.join('\n'));
  console.log('Wrote audit/fits-audit-manifest.json and audit/chatgpt-image-requests.md');
}
console.log(errors.length?'FITS audit: FAILED':'FITS audit: OK');
