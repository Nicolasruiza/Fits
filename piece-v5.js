/* Fits v5 piece page: photo, favorite / wishlist star, owned switch, what the piece does for you. */
(()=>{
  const V=window.FITS_V5,D=window.FITS_DATA,root=document.getElementById('root');
  if(!V||!D||!root)return;
  const esc=V.esc,id=new URLSearchParams(location.search).get('id');
  const I={
    back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    star:on=>`<svg viewBox="0 0 24 24" fill="${on?'currentColor':'none'}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg>`,
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>',
    eyeOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10 10 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-3 3.8M6.1 6.1C3.6 7.8 2.5 12 2.5 12s3.5 7 9.5 7a9.7 9.7 0 0 0 4.2-1"/></svg>',
    chevron:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>'
  };
  const backHref=()=>{try{const r=new URL(document.referrer);if(r.origin===location.origin&&/wardrobe-v5|stats-v5|looks|detail|next-buy/.test(r.pathname))return'back'}catch(e){}return'wardrobe-v5.html'};

  function rail(title,looks,count,labelFn){
    if(!looks.length)return'';
    return`<section class="p5-section"><div class="v5-row-head v5-pad-x"><h2 class="v5-h2">${title}</h2><span class="v5-count">${count} ${count===1?'look':'looks'}</span></div>
      <div class="v5-rail">${looks.map(l=>`<a class="p5-look" href="${esc(V.detailHref(l))}" aria-label="${esc(l.name)}"><img src="${esc(l.image)}" alt="${esc(l.name)}" loading="lazy" onerror="this.classList.add('is-broken')">${labelFn?`<span class="v5-needs">${esc(labelFn(l))}</span>`:''}</a>`).join('')}</div></section>`;
  }
  function render(){
    const p=V.piece(id);
    if(!p){root.innerHTML=`<div class="v5"><div class="v5-back-row"><a class="v5-back" href="wardrobe-v5.html">${I.back}Wardrobe</a></div><p class="v5-empty">This piece isn’t in your catalog anymore.</p></div>`;return}
    const st=V.state(),owned=V.owned(id,st),star=st.wishlist.has(id),hidden=new Set(V.read('fitsHiddenPieces',[])).has(id);
    const looks=(D.looks||[]).filter(l=>!st.hidden.has(l.id)&&(l.pieces||[]).includes(id)).map(l=>({l,m:V.missing(l,st)}));
    const worn=V.pieceWearCounts(V.wearRecords()).get(id)||0;
    const src=V.pieceImage(id),swaps=window.FITS_SWAPS?FITS_SWAPS.interchangeable(id).map(V.piece).filter(Boolean):[];
    let stats,rails;
    if(owned){
      const ready=looks.filter(x=>!x.m.length),one=looks.filter(x=>x.m.length===1);
      stats=[[looks.length,'looks use it',''],[ready.length,'ready to wear','good'],[one.length,'one piece away','']];
      rails=rail('Ready with it',ready.slice(0,10).map(x=>x.l),ready.length)
        +rail('One piece away',one.slice(0,10).map(x=>x.l),one.length,l=>`Needs ${(V.piece(V.missing(l,st)[0])?.name||'').toLowerCase()}`);
    }else{
      const completes=looks.filter(x=>x.m.length===1),closer=looks.filter(x=>x.m.length===2);
      stats=[[completes.length,'ready the day it arrives','good'],[closer.length,'become 1 piece away',''],[looks.length,'looks use it','']];
      rails=rail('Makes these ready',completes.slice(0,10).map(x=>x.l),completes.length)
        +rail('Gets you closer to',closer.slice(0,10).map(x=>x.l),closer.length,l=>`Then needs ${(V.piece(V.missing(l,st).find(m=>m!==id))?.name||'').toLowerCase()}`);
    }
    const back=backHref();
    root.innerHTML=`<div class="v5">
      <div class="v5-back-row"><a class="v5-back" href="${back==='back'?'#':back}" data-action="${back==='back'?'back':''}">${I.back}Back</a></div>
      <div class="p5-hero">${src?`<img src="${esc(src)}" alt="${esc(p.name)}" onerror="this.classList.add('is-broken')">`:''}
        <button class="p5-star${star?' is-on':''}" type="button" data-action="star" aria-pressed="${star}" aria-label="${owned?(star?'Remove from favorites':'Add to favorites'):(star?'Remove from wishlist':'Add to wishlist')}">${I.star(star)}</button></div>
      <header class="nb-head"><span class="v5-kicker" style="color:#5b6166">${esc(V.pieceKind(p))}${worn?` · worn ${worn}×`:''}${hidden?' · hidden':''}</span><h1>${esc(p.name)}</h1>${p.styleNote?`<p>${esc(p.styleNote)}</p>`:''}</header>
      <div class="p5-own" role="radiogroup" aria-label="Do you own it?">
        <button type="button" role="radio" aria-checked="${owned}" class="${owned?'is-on':''}" data-action="own" data-value="owned">${owned?I.check:''}I own it</button>
        <button type="button" role="radio" aria-checked="${!owned}" class="${!owned?'is-missing':''}" data-action="own" data-value="missing">Missing</button>
      </div>
      <section class="nb-stats" aria-label="What it does for you">${stats.map(([n,label,cls])=>`<div class="nb-stat ${cls}"><b>${n}</b><span>${label}</span></div>`).join('')}</section>
      ${!owned?`<div class="p5-actions"><a class="p5-why" href="next-buy.html?piece=${encodeURIComponent(id)}&from=wardrobe"><span>Why it’s worth buying</span>${I.chevron}</a><button class="p5-find" type="button" data-action="find">Find it to buy ↗</button></div>`:''}
      ${rails}
      ${swaps.length||owned?`<section class="p5-section v5-pad-x"><h2 class="v5-h2" style="font-size:16px">Can swap with</h2><p class="v5-note" style="margin:6px 0 0">${swaps.length?esc(swaps.map(s=>s.name).join(', ')):'No swaps set.'} <a href="piece.html?id=${encodeURIComponent(id)}&classic=1">Edit swaps</a></p></section>`:''}
      <div class="p5-hide"><button type="button" data-action="hide">${I.eyeOff}${hidden?'Unhide this piece':'Hide this piece'}</button></div>
    </div>${V.nav('wardrobe')}`;
  }
  root.addEventListener('click',e=>{
    const el=e.target.closest('[data-action]');if(!el||!el.dataset.action)return;
    const a=el.dataset.action;
    if(a==='back'){e.preventDefault();history.back();return}
    if(a==='star'){const w=new Set(V.read('fitsWishlistPieces',[]));w.has(id)?w.delete(id):w.add(id);V.write('fitsWishlistPieces',[...w])}
    else if(a==='own'){const w=V.read('fitsWardrobe',{});w[id]=el.dataset.value;V.write('fitsWardrobe',w);V.track(el.dataset.value==='owned'?'pieceOwned':'pieceMissing')}
    else if(a==='hide'){const h=new Set(V.read('fitsHiddenPieces',[]));h.has(id)?h.delete(id):h.add(id);V.write('fitsHiddenPieces',[...h])}
    else if(a==='find'){const p=V.piece(id);window.open(`https://www.google.com/search?udm=28&q=${encodeURIComponent((p?.name||'')+" men's clothing Canada")}`,'_blank','noopener,noreferrer');return}
    render();
  });
  window.addEventListener('pageshow',e=>{if(e.persisted)render()});
  render();
})();
