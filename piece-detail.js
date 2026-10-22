(()=>{
  if(document.body.dataset.page!=='piece')return;
  const id=new URLSearchParams(location.search).get('id');
  const item=piece(id);
  if(!item){document.body.innerHTML='<main class="piece-error"><a href="wardrobe.html">← Wardrobe</a><h1>Piece not found</h1></main>';return}

  // Back returns to the exact Wardrobe view (category, status, scroll) the piece was opened from.
  let backUrl='wardrobe.html';
  try{backUrl=sessionStorage.getItem('fitsWardrobeUrl')||backUrl}catch(e){}
  document.addEventListener('click',e=>{
    const back=e.target.closest?.('.piece-back');if(!back)return;
    back.setAttribute('href',backUrl);
    if(/wardrobe\.html/.test(document.referrer)&&history.length>1){e.preventDefault();history.back()}
  });

  let wishlist=new Set(safeJSON('fitsWishlistPieces',[]));
  let hidden=new Set(safeJSON('fitsHiddenPieces',[]));
  const related=stylesForPiece(id).sort((a,b)=>missingFor(a).length-missingFor(b).length||a.name.localeCompare(b.name));
  const ready=related.filter(l=>missingFor(l).length===0).length;
  const unlocks=related.filter(l=>missingFor(l).length===1&&missingFor(l)[0]===id).length;

  function saveSets(){
    localStorage.setItem('fitsWishlistPieces',JSON.stringify([...wishlist]));
    localStorage.setItem('fitsHiddenPieces',JSON.stringify([...hidden]));
  }
  let swapPickerOpen=false;
  function swapTile(p,extra=''){return`<span class="swap-photo ward-photo">${piecePhoto(p)}</span><span class="swap-name">${p.name}</span><span class="swap-state ${isOwned(p.id)?'owned':'missing'}">${isOwned(p.id)?'Owned':'Missing'}</span>${extra}`}
  function swapSection(){
    const S=window.FITS_SWAPS;if(!S)return'';
    const linked=S.interchangeable(id).map(piece).filter(Boolean);
    const options=(window.FITS_DATA.pieces||[]).filter(p=>p.category===item.category&&p.id!==id&&!linked.some(l=>l.id===p.id)).sort((a,b)=>Number(isOwned(b.id))-Number(isOwned(a.id))||a.name.localeCompare(b.name));
    return`<section class="piece-swaps"><small>Interchangeable with</small>${linked.length?`<div class="swap-grid">${linked.map(p=>`<div class="swap-tile">${swapTile(p,`<button type="button" class="swap-remove" data-unlink="${p.id}" aria-label="Remove ${p.name}">×</button>`)}</div>`).join('')}</div>`:'<p class="swap-empty">Nothing yet. If another piece can stand in for this one, add it and Looks will suggest the swap.</p>'}${options.length?`<button type="button" class="swap-toggle" data-swap-toggle aria-expanded="${swapPickerOpen}">${swapPickerOpen?'Close':'Add an interchangeable piece'}</button>${swapPickerOpen?`<div class="swap-grid swap-picker">${options.map(p=>`<button type="button" class="swap-tile pick" data-pick="${p.id}" aria-label="Add ${p.name}">${swapTile(p)}</button>`).join('')}</div>`:''}`:''}</section>`;
  }
  function render(){
    const ownedNow=isOwned(id),saved=wishlist.has(id),isHidden=hidden.has(id);
    document.body.innerHTML=`<div class="app wardrobe-v2 piece-detail-app">
      <main class="piece-detail-main">
        <div class="piece-detail-top"><a class="piece-back" href="${backUrl}" aria-label="Back to wardrobe">←</a><span>${item.category}</span></div>
        <div class="piece-detail-photo ward-photo">${piecePhoto(item)}<span class="piece-status-badge ${ownedNow?'owned':'missing'}">${ownedNow?'In wardrobe':'Missing'}</span></div>
        <section class="piece-detail-copy">
          <p>Wardrobe piece</p><h1>${item.name}</h1>
          ${item.styleRole?`<div class="piece-role"><strong>${item.styleRole}</strong>${item.styleNote?`<span>${item.styleNote}</span>`:''}</div>`:''}
          <div class="piece-impact-row"><div><b>${related.length}</b><span>Styles</span></div><div><b>${ready}</b><span>Ready now</span></div><div><b>${unlocks}</b><span>Unlocks now</span></div></div>
          <div class="piece-actions">
            <button class="piece-action ${ownedNow?'active':''}" data-action="own" aria-pressed="${ownedNow}"><i>✓</i><span>${ownedNow?'Owned':'Mark owned'}</span></button>
            <button class="piece-action ${saved?'active':''}" data-action="wishlist" aria-pressed="${saved}"><i>♡</i><span>${saved?'In wishlist':'Wishlist'}</span></button>
            <button class="piece-action" data-action="buy"><i>↗</i><span>Buy</span></button>
            <button class="piece-action danger ${isHidden?'active':''}" data-action="hide" aria-pressed="${isHidden}"><i>×</i><span>${isHidden?'Show again':"Don't suggest"}</span></button>
          </div>
          ${isHidden?'<div class="piece-hidden-note">Hidden from Wardrobe and future shopping suggestions.</div>':''}
        </section>
        ${swapSection()}
        <section class="piece-styles"><div class="piece-styles-head"><div><small>Works with</small><h2>${related.length} styles</h2></div><span>Tap to open</span></div><div class="piece-look-grid">${related.length?related.map(l=>{const missing=missingFor(l);return`<a class="piece-look-card" href="detail.html?look=${encodeURIComponent(l.id)}&family=${encodeURIComponent(l.family)}" aria-label="Open ${l.name}"><img src="${l.image}" alt="${l.name}" loading="lazy"><span class="${missing.length?'missing':'ready'}">${missing.length?`${missing.length} missing`:'Ready'}</span></a>`}).join(''):'<div class="piece-no-styles">No styles use this piece yet.</div>'}</div></section>
      </main>${nav('wardrobe')}
    </div>`;
    bind();
  }
  function bind(){
    document.querySelector('[data-action="own"]').onclick=()=>{wardrobe[id]=isOwned(id)?'missing':'owned';persist();render()};
    document.querySelector('[data-action="wishlist"]').onclick=()=>{wishlist.has(id)?wishlist.delete(id):wishlist.add(id);saveSets();render()};
    document.querySelector('[data-action="buy"]').onclick=()=>searchItem(id);
    document.querySelectorAll('[data-unlink]').forEach(btn=>btn.onclick=()=>{window.FITS_SWAPS.unlink(id,btn.dataset.unlink);render()});
    const toggle=document.querySelector('[data-swap-toggle]');
    if(toggle)toggle.onclick=()=>{swapPickerOpen=!swapPickerOpen;render()};
    document.querySelectorAll('[data-pick]').forEach(btn=>btn.onclick=()=>{window.FITS_SWAPS.link(id,btn.dataset.pick);render()});
    document.querySelector('[data-action="hide"]').onclick=()=>{hidden.has(id)?hidden.delete(id):hidden.add(id);saveSets();render()};
  }
  document.addEventListener('DOMContentLoaded',render);
})();
