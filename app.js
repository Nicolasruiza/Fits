const DATA=window.FITS_DATA;

function safeJSON(key,fallback){
  try{
    const raw=localStorage.getItem(key);
    return raw?JSON.parse(raw):fallback;
  }catch(e){
    localStorage.removeItem(key);
    return fallback;
  }
}

const PIECE_IMAGES={
  'green-polo':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112731_a1c25724-b0f8-46cb-bc6f-5b7b3b5997b3_min.webp',
  'burgundy-polo':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112753_ff1de524-d9ec-4de2-aa78-4304419858b5_min.webp',
  'white-polo':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112731_4d1b0f4f-21e9-4b91-8bb6-c1d654401378_min.webp',
  'navy-polo':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112731_477bd972-f6a4-4a09-a3f1-a0df7b38632d_min.webp',
  'charcoal-polo':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112753_fc716767-a5d6-4723-866b-07a040bdcc56_min.webp',
  'khaki-chinos':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112731_5946e51f-ff6c-42db-8bd9-644e7f4ed155_min.webp',
  'charcoal-trousers':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112753_f41efad4-e9e4-4480-829c-41239c1d38f7_min.webp',
  'navy-trousers':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112753_43b423c1-f59e-48b3-a2c9-24f788e4bfa2_min.webp',
  'grey-trousers':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112817_6d6cfb77-6fa0-4e49-a2c0-fa33cf4c9604_min.webp',
  'taupe-trousers':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112818_ec918c39-3ae5-4f91-a734-0b6ea8b702a3_min.webp',
  'light-grey-trousers':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112817_60657859-8786-4f95-9c81-c2be37c1d559_min.webp',
  'dark-denim':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112817_01ac291a-1b8c-4757-a18e-f3b9ac0296ef_min.webp',
  'brown-loafers':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112842_b1adba30-919a-4995-9291-db61c94d25db_min.webp',
  'brown-derbies':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112842_00d2596d-3241-45f9-9c90-778a49d4915c_min.webp',
  'dark-loafers':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112842_f2f03f65-dc19-4bec-a160-baf9d04215e9_min.webp',
  'brown-casual-shoes':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112842_71500d40-4372-45e1-b15b-b91397303402_min.webp',
  'white-leather-sneakers':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112908_e55159f1-41bc-4d9e-853b-d7869d9f20ec_min.webp',
  'brown-belt':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112908_19f73389-fb2a-4934-a355-cfb245aa0556_min.webp',
  'dark-belt':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112908_ee0582d0-3cb1-4bc9-8c99-88c38aa186a1_min.webp',
  'navy-blazer':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_112909_dc9051d9-9e9a-4899-82eb-fa27d3dd05f6_min.webp'
};

let wearHistory=safeJSON('fitsWearHistory',{});
const storedWardrobe=safeJSON('fitsWardrobe',{});
let wardrobe={};

function normalizeWardrobe(){
  DATA.pieces.forEach(p=>{
    const current=storedWardrobe[p.id];
    wardrobe[p.id]=(current==='owned'||(!current&&p.status==='owned'))?'owned':'missing';
  });
  localStorage.setItem('fitsWardrobe',JSON.stringify(wardrobe));
}
normalizeWardrobe();

const piece=id=>DATA.pieces.find(p=>p.id===id);
const look=id=>DATA.looks.find(l=>l.id===id);
const family=id=>DATA.families.find(f=>f.id===id);
const swapState=()=>safeJSON('fitsClosetSwaps',{});
const missingFor=l=>window.FITS_SWAPS?FITS_SWAPS.missing(l,wardrobe,swapState()):l.pieces.filter(id=>wardrobe[id]!=='owned');
const familyLooks=f=>f.looks.map(look).filter(Boolean);

function nav(active){
  return `<nav class="nav"><a href="index.html"><b>▦</b>Looks</a><a href="wardrobe.html" class="${active==='wardrobe'?'active':''}"><b>◇</b>Wardrobe</a><a href="stats.html" class="${active==='stats'?'active':''}"><b>◫</b>Stats</a></nav>`;
}

function headerBar(title,subtitle,kicker=''){
  return `<header class="topbar"><div class="brandrow"><div class="brand">${title}</div><div class="kicker">${kicker}</div></div><div class="subtitle">${subtitle}</div></header>`;
}

function persist(){
  localStorage.setItem('fitsWardrobe',JSON.stringify(wardrobe));
  localStorage.setItem('fitsWearHistory',JSON.stringify(wearHistory));
}

function saveAndRender(){persist();renderCurrent();}
function isOwned(id){return wardrobe[id]==='owned'}

window.toggleOwned=function(id){
  wardrobe[id]=isOwned(id)?'missing':'owned';
  saveAndRender();
};

window.searchItem=function(id){
  const p=piece(id);
  if(!p)return;
  const query=encodeURIComponent(`${p.name} men's clothing Canada`);
  window.open(`https://www.google.com/search?udm=28&q=${query}`,'_blank','noopener,noreferrer');
};

function piecePhoto(p){
  const src=PIECE_IMAGES[p.id];
  if(src)return `<img src="${src}" alt="${p.name}" loading="lazy">`;
  const initials=p.name.split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase();
  return `<div class="piece-fallback">${initials}</div>`;
}

function wardrobeImpact(pieceId){
  let used=0,unlocks=0;const families=new Set();
  DATA.looks.forEach(l=>{if(!l.pieces.includes(pieceId))return;const missing=missingFor(l);if(!missing.includes(pieceId))return;used++;families.add(l.family);if(missing.length===1)unlocks++});
  return{used,unlocks,families:families.size};
}

function renderWardrobe(){
  const all=DATA.pieces;
  const readyLooks=DATA.looks.filter(l=>missingFor(l).length===0).length;
  const highImpactGaps=all.filter(p=>!isOwned(p.id)&&wardrobeImpact(p.id).used>=5).length;
  document.body.innerHTML=`<div class="app wardrobe-v2">
    ${headerBar('Wardrobe','Everything in one place: what you own, what is missing, and which looks each piece unlocks.',`${all.length} items`)}
    <main>
      <div class="stats wardrobe-stats"><div class="stat"><b>${readyLooks}</b><span>Looks ready now</span></div><div class="stat"><b>${highImpactGaps}</b><span>Missing pieces</span><small>Needed by 5+ looks</small></div></div>
      <div class="ward-grid">${all.map(p=>{
        const ownedNow=isOwned(p.id),impact=ownedNow?null:wardrobeImpact(p.id);
        return `<article class="ward-card ${ownedNow?'is-owned':'is-missing'}" data-piece-id="${p.id}">
          <div class="ward-photo">${piecePhoto(p)}${!ownedNow?'<span class="need-badge">NO</span>':''}</div>
          <div class="ward-card-body">
            <div class="ward-card-copy"><strong>${p.name}</strong><small>${p.category}</small></div>
            ${!ownedNow&&impact?`<div class="ward-impact ${impact.unlocks?'ready':''}"><b>${impact.unlocks?`Unlocks ${impact.unlocks} look${impact.unlocks===1?'':'s'} now`:impact.used?`Used in ${impact.used} look${impact.used===1?'':'s'}`:'Not used in a look yet'}</b>${impact.families?`<span>${impact.families} style ${impact.families===1?'family':'families'}</span>`:''}</div>`:''}
            <div class="own-row"><span class="own-question">Own it?</span><button class="own-toggle ${ownedNow?'on':''}" aria-pressed="${ownedNow}" onclick="toggleOwned('${p.id}')"><span class="toggle-knob"></span></button><b class="own-state">${ownedNow?'Yes':'No'}</b></div>
            ${!ownedNow?`<button class="find-item" onclick="searchItem('${p.id}')">⌕ Find item to buy <span>${impact?.unlocks?`+${impact.unlocks} looks`:'↗'}</span></button>`:''}
          </div>
        </article>`;
      }).join('')}</div>
    </main>${nav('wardrobe')}
  </div>`;
}

function renderUnlock(){
  const items=DATA.pieces.filter(p=>!isOwned(p.id)).map(p=>{
    let used=0,completes=0;
    const familiesHelped=new Set();
    DATA.looks.forEach(l=>{
      if(!l.pieces.includes(p.id))return;
      const missing=missingFor(l);
      if(missing.includes(p.id)){
        used++;
        familiesHelped.add(l.family);
        if(missing.length===1)completes++;
      }
    });
    const familyCount=familiesHelped.size;
    const score=completes*100+familyCount*10+used;
    return {...p,used,completes,familiesHelped:familyCount,score};
  }).filter(x=>x.used).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));

  document.body.innerHTML=`<div class="app wardrobe-v2">
    ${headerBar('Unlock','What should you buy next? Ranked by how much each piece expands your real outfits.','smart buys')}
    <main>
      <div class="notice">Ranked from your actual saved looks and your current Yes/No wardrobe. Nothing is searched until you tap <b>Find item</b>.</div>
      <div class="unlock-list-v2">${items.map((p,i)=>{
        const impact=p.completes?`Unlocks ${p.completes} complete look${p.completes>1?'s':''} now`:`Moves ${p.familiesHelped} style famil${p.familiesHelped===1?'y':'ies'} closer`;
        const support=p.used===1?'Appears in 1 real variant.':`Appears in ${p.used} real variants.`;
        return `<article class="unlock-card-v2">
          <div class="unlock-photo">${piecePhoto(p)}<span class="unlock-rank">${i+1}</span></div>
          <div class="unlock-copy-v2"><strong>${p.name}</strong><span>${impact}</span><small>${support}</small><button class="find-item" onclick="searchItem('${p.id}')">⌕ Find item to buy <span>↗</span></button></div>
        </article>`;
      }).join('')}</div>
    </main>${nav('unlock')}
  </div>`;
}

function renderCurrent(){
  try{
    const page=document.body.dataset.page;
    if(page==='wardrobe')renderWardrobe();
    else if(page==='unlock')renderUnlock();
  }catch(e){
    console.error(e);
    document.body.innerHTML='<div style="max-width:430px;margin:0 auto;padding:28px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"><h1>Fits</h1><p>The wardrobe hit a startup error.</p><button onclick="localStorage.clear();location.reload()" style="border:0;border-radius:999px;background:#202428;color:white;padding:10px 14px">Reset and reload</button></div>';
  }
}

document.addEventListener('DOMContentLoaded',renderCurrent);
