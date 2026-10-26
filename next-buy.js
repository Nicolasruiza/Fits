/* Fits v5 Best next buy page: why a piece is worth buying, ranked by looks it finishes. */
(()=>{
  const V=window.FITS_V5,root=document.getElementById('root');
  if(!V||!root)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const back='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
  const chevron='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  const lower=s=>String(s||'').charAt(0).toLowerCase()+String(s||'').slice(1);

  function thumbs(looks,max){
    const shown=looks.slice(0,max),more=looks.length-shown.length;
    return shown.map(l=>`<a href="${esc(V.detailHref(l))}" aria-label="${esc(l.name)}"><img src="${esc(l.image)}" alt="${esc(l.name)}" loading="lazy" onerror="this.classList.add('is-broken')"></a>`).join('')
      +(more>0?`<a href="#all" class="nb-more" data-action="all" style="display:grid;place-items:center;font-weight:700;color:#3f4549;text-decoration:none">+${more}</a>`:'');
  }

  const fromWardrobe=new URLSearchParams(location.search).get('from')==='wardrobe';
  let showAll=false;
  function render(){
    const st=V.state(),ranked=V.nextBuys(st);
    const id=new URLSearchParams(location.search).get('piece')||ranked[0]?.id;
    const p=V.piece(id);
    if(!p){root.innerHTML=`<div class="v5"><div class="v5-back-row"><a class="v5-back" href="looks.html">${back}Looks</a></div><p class="v5-empty">Nothing to recommend right now. Every look is either ready or needs several pieces.</p></div>`;return}

    const rank=ranked.findIndex(x=>x.id===id);
    const all=(window.FITS_DATA.looks||[]).filter(l=>!st.hidden.has(l.id));
    const info=ranked[rank]||{completes:[],appears:all.filter(l=>V.missing(l,st).includes(id)),closer:{1:[],2:[]}};
    if(rank<0){all.forEach(l=>{const m=V.missing(l,st);if(!m.includes(id))return;if(m.length===2)info.closer[1].push(l);if(m.length===3)info.closer[2].push(l)})}
    const isOwned=V.owned(id,st),wish=st.wishlist.has(id);
    const seasons=[...new Set(info.completes.flatMap(l=>l.climate?.seasons||[]))].filter(s=>V.SEASONS.includes(s)).sort((a,b)=>V.SEASONS.indexOf(a)-V.SEASONS.indexOf(b));
    const pairs=V.pairsWithOwned(id,st).slice(0,4);
    const together=V.betterTogether(id,st);
    const mostFrequent=[...new Map(all.flatMap(l=>V.missing(l,st).map(m=>[m,0]))).keys()]
      .map(m=>({id:m,appears:all.filter(l=>V.missing(l,st).includes(m)).length,completes:(ranked.find(r=>r.id===m)?.completes.length)||0}))
      .sort((a,b)=>b.appears-a.appears)[0];
    const others=ranked.filter(r=>r.id!==id).slice(0,4);

    let why='';
    if(mostFrequent&&mostFrequent.id!==id&&mostFrequent.appears>info.appears.length){
      const name=V.piece(mostFrequent.id)?.name||mostFrequent.id;
      why=`<section class="nb-why"><h2>Why not the ${esc(lower(name))}?</h2><p>It shows up in more looks (${mostFrequent.appears}) but only finishes ${mostFrequent.completes} of them. The rest still need other pieces. The ranking counts only looks you can wear the day it arrives.</p></section>`;
    }else if(info.completes.length){
      why=`<section class="nb-why"><h2>Why this one</h2><p>It finishes the most looks you can wear the day it arrives, and it appears in ${info.appears.length} looks overall.</p></section>`;
    }

    const imgSrc=V.pieceImage(id);
    root.innerHTML=`<div class="v5" style="padding-bottom:0">
      <div class="v5-back-row"><a class="v5-back" href="${fromWardrobe?'wardrobe.html?status=missing':'looks.html'}">${back}${fromWardrobe?'Wardrobe':'Looks'}</a></div>
      <div class="nb-hero">${imgSrc?`<img src="${esc(imgSrc)}" alt="${esc(p.name)}" onerror="this.classList.add('is-broken')">`:''}</div>
      <header class="nb-head">
        <span class="v5-kicker" style="color:#2d6a4c">${rank===0?'Best next buy':rank>0?`Next buy · #${rank+1}`:'Piece'}${isOwned?' · You own it':''}</span>
        <h1>${esc(p.name)}</h1>
        <p>${seasons.length?`Works in ${esc(seasons.join(' and '))}. `:''}${pairs.length?'Pairs with what you already own.':''}</p>
      </header>
      <section class="nb-stats" aria-label="Impact">
        <div class="nb-stat good"><b>+${info.completes.length}</b><span>ready right away</span></div>
        <div class="nb-stat"><b>${info.closer[1].length}</b><span>become 1 piece away</span></div>
        <div class="nb-stat"><b>${info.closer[2].length}</b><span>become 2 pieces away</span></div>
      </section>
      ${info.completes.length?`<section class="nb-section" id="all"><div class="v5-row-head"><h2 class="v5-h2">Ready right away</h2><span class="v5-count">${info.completes.length} ${info.completes.length===1?'look':'looks'}</span></div>
        <div class="nb-thumbs">${thumbs(info.completes,showAll?999:5)}</div></section>`:''}
      ${pairs.length?`<section class="nb-section"><h2 class="v5-h2">Pairs with what you own</h2><div class="nb-pills">${pairs.map((x,i)=>`<span>${esc(x.piece.name)} · ${x.count}${i===0?` ${x.count===1?'look':'looks'}`:''}</span>`).join('')}</div></section>`:''}
      ${together?`<a class="nb-together" href="next-buy.html?piece=${encodeURIComponent(together.partner.id)}${fromWardrobe?'&from=wardrobe':''}">
        <span class="v5-kicker">Better together</span>
        <div class="nb-together-row"><div><strong>${esc(p.name.replace(/ shirt$/i,''))} + ${esc(lower(together.partner.name))}</strong><span>Buying both also finishes ${together.pairLooks.length} ${together.pairLooks.length===1?'look that needs':'looks that need'} the two of them</span></div><span class="nb-big">+${together.total}</span></div>
      </a>`:''}
      ${why}
      ${others.length?`<section class="nb-section"><h2 class="v5-h2" style="font-size:14px;color:#4a5055">Other good buys</h2><div class="nb-list">${others.map(r=>`<a href="next-buy.html?piece=${encodeURIComponent(r.id)}${fromWardrobe?'&from=wardrobe':''}"><span>${esc(r.piece.name)}</span><span style="display:flex;align-items:center;gap:8px"><b>+${r.completes.length}</b>${chevron}</span></a>`).join('')}</div></section>`:''}
      ${isOwned?'':V.shopLinks(id)}
      <div class="nb-actions">
        <button class="nb-secondary" type="button" data-action="own">${isOwned?'Mark as missing':'I own it'}</button>
        <button class="nb-primary${wish?' is-on':''}" type="button" data-action="wish" aria-pressed="${wish}">${wish?'On your wishlist':'Add to wishlist'}</button>
      </div>
    </div>`;
  }

  root.addEventListener('click',e=>{
    const el=e.target.closest('[data-action]');if(!el)return;
    const id=new URLSearchParams(location.search).get('piece')||V.nextBuys()[0]?.id;if(!id)return;
    if(el.dataset.action==='all'){e.preventDefault();showAll=true;render();return}
    if(el.dataset.action==='own'){
      const w=V.read('fitsWardrobe',{});const st=V.state();
      w[id]=V.owned(id,st)?'missing':'owned';V.write('fitsWardrobe',w);V.track(w[id]==='owned'?'nextBuyOwned':'nextBuyUnowned');
      if(w[id]==='owned'){location.href=fromWardrobe?'wardrobe.html':'looks.html';return}
    }
    if(el.dataset.action==='wish'){
      const list=new Set(V.read('fitsWishlistPieces',[]));list.has(id)?list.delete(id):(list.add(id),V.track('wishlistAdd'));V.write('fitsWishlistPieces',[...list]);
    }
    render();
  });
  render();
})();
