/* Fits v5 Wardrobe: Owned / Missing tabs, category chips, favorites (owned) and wishlist (missing)
   rows, sort toggles, Best next buy, hidden pieces. The star on a piece is the same saved list the
   classic app uses (fitsWishlistPieces): on owned pieces it reads as a favorite, on missing ones as
   a wish. */
(()=>{
  const V=window.FITS_V5,D=window.FITS_DATA,root=document.getElementById('root');
  if(!V||!D||!root)return;
  const esc=V.esc,params=new URLSearchParams(location.search);
  // Older links opened a piece inside Wardrobe (wardrobe.html?piece=id); pieces have their own page now.
  if(params.get('piece')){location.replace(V.pieceHref(params.get('piece')));return}
  const ui={
    tab:params.get('status')==='missing'?'missing':(sessionStorage.getItem('fitsV5WardTab')||'owned'),
    kind:sessionStorage.getItem('fitsV5WardKind')||'All',
    view:params.get('view')==='hidden'?'hidden':'main',
    rowAll:false
  };

  const ICON={
    All:'<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    Shirts:'<path d="M8 3l4 3 4-3 5 3-2 5-2-1v11H7V10l-2 1-2-5z"/><path d="M12 6v15"/>',
    'Tees & polos':'<path d="M9 3c.5 1.5 1.5 2 3 2s2.5-.5 3-2l6 3-2 4-3-1v12H8V9L5 10 3 6z"/>',
    Knitwear:'<rect x="3" y="6" width="18" height="5" rx="2.5"/><rect x="3" y="13" width="18" height="5" rx="2.5"/>',
    Pants:'<path d="M6 3h12l1 18h-5l-2-12-2 12H5z"/>',
    Shorts:'<path d="M5 5h14l1 11h-6l-2-6-2 6H4z"/>',
    Outerwear:'<path d="M9 3h6l5 4v14h-5v-8l-3 2-3-2v8H4V7z"/><path d="M12 15V6"/>',
    Shoes:'<path d="M3 8h5l2 3 7 2c2.5.7 4 2 4 4H3z"/><path d="M3 17h18v2H3z"/>',
    Accessories:'<rect x="3" y="10" width="18" height="4" rx="1"/><rect x="14" y="9" width="4" height="6" rx="1"/>'
  };
  const LABEL={'Tees & polos':'Tees','Knitwear':'Knits','Accessories':'Extras'};
  const I={
    star:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg>',
    bag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2l-2 4v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6l-2-4z"/><path d="M4 6h16M16 10a4 4 0 0 1-8 0"/></svg>',
    eyeOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10 10 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-3 3.8M6.1 6.1C3.6 7.8 2.5 12 2.5 12s3.5 7 9.5 7a9.7 9.7 0 0 0 4.2-1"/></svg>',
    chevron:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>'
  };

  function model(){
    const st=V.state(),hiddenPieces=new Set(V.read('fitsHiddenPieces',[])),s=V.season(st).season;
    const looks=(D.looks||[]).filter(l=>!st.hidden.has(l.id));
    const buys=new Map(V.nextBuys(st).map(b=>[b.id,b]));
    const wearCounts=V.pieceWearCounts(V.wearRecords());
    const pieces=(D.pieces||[]).filter(p=>!hiddenPieces.has(p.id)).map(p=>({
      p,owned:V.owned(p.id,st),kind:V.pieceKind(p),star:st.wishlist.has(p.id),
      looks:looks.filter(l=>(l.pieces||[]).includes(p.id)).length,
      completes:buys.get(p.id)?.completes.length||0,
      worn:wearCounts.get(p.id)||0,inSeason:V.pieceInSeason(p,s)
    }));
    return{st,hiddenPieces,pieces,buys,season:s};
  }
  const img=p=>V.pieceImage(p.id);

  function pieceTile(x,label,tagClass,size){
    const src=img(x.p);
    return`<a class="w5-tile${size==='rail'?' w5-rail-tile':''}${x.inSeason?'':' is-off'}" href="${esc(V.pieceHref(x.p.id))}" aria-label="${esc(x.p.name)}">
      ${src?`<img src="${esc(src)}" alt="${esc(x.p.name)}" loading="lazy" onerror="this.classList.add('is-broken')">`:`<span class="w5-noimg">${esc(x.p.name)}</span>`}
      ${label?`<span class="w5-tag ${tagClass||''}">${esc(label)}</span>`:''}</a>`;
  }
  function chips(list){
    const present=new Set(list.map(x=>x.kind));
    const kinds=['All',...V.KINDS.filter(k=>present.has(k))];
    if(!kinds.includes(ui.kind))ui.kind='All';
    return`<div class="w5-cats" role="radiogroup" aria-label="Category">${kinds.map(k=>`<button type="button" role="radio" aria-checked="${ui.kind===k}" class="w5-cat${ui.kind===k?' is-active':''}" data-action="kind" data-value="${esc(k)}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]||ICON.All}</svg><span>${esc(LABEL[k]||k)}</span></button>`).join('')}</div>`;
  }
  function toggle(name,options,current){
    return`<div class="v5-sort" role="radiogroup" aria-label="${esc(name)}">${options.map(([v,label])=>`<button type="button" role="radio" aria-checked="${current===v}" class="v5-sort-btn${current===v?' is-active':''}" data-action="sort" data-key="${esc(name)}" data-value="${v}">${label}</button>`).join('')}</div>`;
  }
  function row(title,icon,list,labelFn,tagClassFn){
    if(!list.length)return'';
    if(ui.rowAll)return`<div class="v5-row-head v5-pad"><h2 class="v5-h2"><span class="v5-star">${icon}</span>${title}</h2><button class="v5-link" type="button" data-action="row-back">Back</button></div>
      <div class="w5-grid">${list.map(x=>pieceTile(x,labelFn(x),tagClassFn(x))).join('')}</div>`;
    return`<section class="v5-favs"><div class="v5-row-head"><h2 class="v5-h2"><span class="v5-star">${icon}</span>${title}</h2>
      <button class="v5-link" type="button" data-action="row-all">See all${list.length>3?` ${list.length}`:''}</button></div>
      <div class="v5-rail">${list.map(x=>pieceTile(x,labelFn(x),tagClassFn(x),'rail')).join('')}</div></section>`;
  }
  function bestBuy(m){
    const top=V.nextBuys(m.st).find(b=>!m.hiddenPieces.has(b.id));if(!top)return'';
    const src=V.pieceImage(top.id),thumbs=top.completes.slice(0,4);
    return`<a class="v5-buy" href="next-buy.html?piece=${encodeURIComponent(top.id)}&from=wardrobe" data-action="open-buy">
      <div class="v5-buy-head">${src?`<span class="w5-buy-piece"><img src="${esc(src)}" alt="" onerror="this.classList.add('is-broken')"></span>`:''}
        <div><span class="v5-kicker">Best next buy</span><strong>${esc(top.piece.name)}</strong><span>Makes ${top.completes.length} ${top.completes.length===1?'look':'looks'} fully wearable</span></div></div>
      <div class="v5-buy-thumbs w5-buy-thumbs">${thumbs.map(l=>`<img src="${esc(l.image)}" alt="" loading="lazy" onerror="this.classList.add('is-broken')">`).join('')}</div></a>`;
  }
  const missingLabel=x=>x.completes?`Completes ${x.completes} ${x.completes===1?'look':'looks'}`:`In ${x.looks} ${x.looks===1?'look':'looks'}`;
  const missingClass=x=>x.completes?'good':'plain';
  const ownedLabel=x=>`In ${x.looks} ${x.looks===1?'look':'looks'}`;
  const bySeason=(a,b)=>(b.inSeason?1:0)-(a.inSeason?1:0);

  function mainView(){
    const m=model();
    const owned=m.pieces.filter(x=>x.owned),miss=m.pieces.filter(x=>!x.owned);
    const list=ui.tab==='owned'?owned:miss;
    const inKind=x=>ui.kind==='All'||x.kind===ui.kind;
    let body='';
    if(ui.tab==='owned'){
      const sort=V.read('fitsWardSortOwned','most');
      const sorted=owned.filter(inKind).sort((a,b)=>bySeason(a,b)||(sort==='least'?(a.worn-b.worn||a.looks-b.looks):(b.worn-a.worn||b.looks-a.looks))||a.p.name.localeCompare(b.p.name));
      const favs=owned.filter(x=>x.star&&inKind(x)).sort((a,b)=>b.looks-a.looks);
      body=ui.rowAll?row('Your favorites',I.star,favs,ownedLabel,()=>'dark')
        :`${row('Your favorites',I.star,favs,ownedLabel,()=>'dark')}
        <div class="v5-row-head v5-pad"><h2 class="v5-h2">All owned</h2>${toggle('Sort owned pieces',[['most','Most worn'],['least','Least worn']],sort)}</div>
        ${sorted.length?`<div class="w5-grid">${sorted.map(x=>pieceTile(x,ownedLabel(x),'dark')).join('')}</div>`:'<p class="v5-empty">Nothing owned in this category yet.</p>'}`;
    }else{
      const sort=V.read('fitsWardSortMissing','unlocks');
      const sorted=miss.filter(inKind).sort((a,b)=>bySeason(a,b)||(sort==='looks'?(b.looks-a.looks||b.completes-a.completes):(b.completes-a.completes||b.looks-a.looks))||a.p.name.localeCompare(b.p.name));
      const wish=miss.filter(x=>x.star&&inKind(x)).sort((a,b)=>b.completes-a.completes||b.looks-a.looks);
      body=ui.rowAll?row('Your wishlist',I.bag,wish,missingLabel,missingClass)
        :`${ui.kind==='All'?bestBuy(m):''}
        ${row('Your wishlist',I.bag,wish,missingLabel,missingClass)}
        <div class="v5-row-head v5-pad"><h2 class="v5-h2">All missing</h2>${toggle('Sort missing pieces',[['unlocks','Unlocks most'],['looks','In most looks']],sort)}</div>
        ${sorted.length?`<div class="w5-grid">${sorted.map(x=>pieceTile(x,missingLabel(x),missingClass(x))).join('')}</div>`:'<p class="v5-empty">Nothing missing in this category.</p>'}`;
    }
    const tab=(id,label)=>`<button class="v5-tab${ui.tab===id?' is-active':''}" role="tab" aria-selected="${ui.tab===id}" data-action="tab" data-tab="${id}">${label}</button>`;
    return`<header class="v5-header"><h1>Wardrobe</h1><span>${m.pieces.length} PIECES</span></header>
      <div class="v5-tabs w5-tabs" role="tablist" aria-label="Wardrobe">${tab('owned',`Owned · ${owned.length}`)}${tab('missing',`Missing · ${miss.length}`)}</div>
      ${chips(list)}
      ${body}
      <a class="v5-hidden-link" href="wardrobe.html?view=hidden"><span>${I.eyeOff}Pieces you hid${m.hiddenPieces.size?` · ${m.hiddenPieces.size}`:''}</span>${I.chevron}</a>`;
  }
  function hiddenView(){
    const st=V.state(),hidden=V.read('fitsHiddenPieces',[]).map(V.piece).filter(Boolean);
    return`<div class="v5-back-row"><a class="v5-back" href="wardrobe.html">${I.back}Wardrobe</a></div>
      <header class="v5-header"><h1>Pieces you hid</h1><span>${hidden.length}</span></header>
      <p class="v5-note">Hidden pieces don’t show in Wardrobe or count toward Best next buy.</p>
      ${hidden.length?`<div class="w5-grid">${hidden.map(p=>`<div class="v5-card-wrap">${pieceTile({p,inSeason:true},V.owned(p.id,st)?'Owned':'Missing','plain')}<button class="v5-unhide" type="button" data-action="unhide" data-id="${esc(p.id)}">Unhide</button></div>`).join('')}</div>`:'<p class="v5-empty">You haven’t hidden any pieces.</p>'}`;
  }
  function render(){
    const y=window.scrollY;
    root.innerHTML=`<div class="v5">${ui.view==='hidden'?hiddenView():mainView()}</div>${V.nav('wardrobe')}`;
    window.scrollTo(0,y);
  }
  root.addEventListener('click',e=>{
    const el=e.target.closest('[data-action]');if(!el)return;
    const a=el.dataset.action;
    if(a==='open-buy'){V.track('nextBuyTap');return}
    e.preventDefault();
    if(a==='tab'){ui.tab=el.dataset.tab;ui.rowAll=false;sessionStorage.setItem('fitsV5WardTab',ui.tab)}
    else if(a==='kind'){ui.kind=el.dataset.value;sessionStorage.setItem('fitsV5WardKind',ui.kind)}
    else if(a==='sort'){V.write(ui.tab==='owned'?'fitsWardSortOwned':'fitsWardSortMissing',el.dataset.value)}
    else if(a==='row-all'){ui.rowAll=true;window.scrollTo(0,0)}
    else if(a==='row-back'){ui.rowAll=false}
    else if(a==='unhide'){const h=new Set(V.read('fitsHiddenPieces',[]));h.delete(el.dataset.id);V.write('fitsHiddenPieces',[...h])}
    render();
  });
  window.addEventListener('storage',e=>{if(/^fits/.test(e.key||''))render()});
  window.addEventListener('pageshow',e=>{if(e.persisted)render()});
  V.track('wardrobeOpen');
  render();
})();
