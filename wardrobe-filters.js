(()=>{
  if(document.body.dataset.page!=='wardrobe')return;

  const params=new URLSearchParams(location.search);
  const CATEGORIES=['Dress Shirts','T-Shirts & Polos','Sweaters & Knitwear','Pants','Shorts','Outerwear','Shoes','Accessories','Other'];
  const impactMin=Math.max(0,Number(params.get('impact'))||0);
  const requestedCategory=params.get('category');
  let category=requestedCategory==='All'||CATEGORIES.includes(requestedCategory)?requestedCategory:(impactMin?'All':'Dress Shirts');
  const requestedStatus=params.get('status');
  let ownership=impactMin?'Missing':({missing:'Missing',owned:'Owned',wishlist:'Wishlist',hidden:'Hidden'}[requestedStatus]||'All');
  const META={
    'All':{label:'All',icon:'<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><rect x="28" y="8" width="12" height="12" rx="2"/><rect x="8" y="28" width="12" height="12" rx="2"/><rect x="28" y="28" width="12" height="12" rx="2"/></svg>'},
    'Dress Shirts':{label:'Shirts',place:'Hanging',icon:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M15 13 8 18l4 8 4-2v14h16V24l4 2 4-8-7-5-4 4H19l-4-4Z"/><path d="m19 13 5 6 5-6M24 19v19"/></svg>'},
    'T-Shirts & Polos':{label:'Tees & polos',place:'Hanging',icon:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="m17 13-9 5 4 9 5-2v13h14V25l5 2 4-9-9-5c-1 4-13 4-14 0Z"/></svg>'},
    'Sweaters & Knitwear':{label:'Knitwear',place:'Folded',icon:'<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="9" y="13" width="30" height="10" rx="3"/><rect x="7" y="25" width="34" height="11" rx="3"/><path d="M16 18h16M15 30h18"/></svg>'},
    'Pants':{label:'Pants',place:'Half-hung',icon:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M15 10h18l-2 29h-7l-1-17-2 17h-7l1-29Z"/><path d="M15 17h18"/></svg>'},
    'Shorts':{label:'Shorts',place:'Folded',icon:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M13 13h22l2 22-12-3-1-10-1 10-12 3 2-22Z"/><path d="M13 19h22"/></svg>'},
    'Outerwear':{label:'Outerwear',place:'Hanging',icon:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="m18 10-7 6 3 22h20l3-22-7-6-6 8-6-8Z"/><path d="M24 18v20M18 10l6 8 6-8"/></svg>'},
    'Shoes':{label:'Shoes',place:'Lower shelf',icon:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 29c8 0 12-4 14-12l6 2c2 7 7 8 12 9v7H8v-6Z"/><path d="M10 31h28M25 22l5-1"/></svg>'},
    'Accessories':{label:'Accessories',place:'Drawer',icon:'<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="12" width="32" height="25" rx="3"/><path d="M8 21h32M20 17h8M20 29h8"/></svg>'},
    'Other':{label:'Other',place:'Closet',icon:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 12a4 4 0 1 1 4 4l-4 3-15 9h30l-15-9"/></svg>'}
  };
  const STATUS_META={
    All:{label:'All',icon:META.All.icon},
    Owned:{label:'Owned',icon:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="m12 25 8 8 17-18"/></svg>'},
    Missing:{label:'Missing',icon:'<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="16"/><path d="M24 15v11M24 33h.1"/></svg>'},
    Wishlist:{label:'Favs',icon:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="m24 8 4.8 9.8 10.8 1.6-7.8 7.6 1.8 10.7-9.6-5.1-9.6 5.1L16.2 27l-7.8-7.6 10.8-1.6L24 8Z"/></svg>'},
    Hidden:{label:'Hidden',icon:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 7l36 34M20 20a6 6 0 0 0 8 8M18 10a22 22 0 0 1 6-1c11 0 19 10 19 10a31 31 0 0 1-7 7M12 13C7 16 5 20 5 20s8 10 19 10c2 0 4-.3 6-.8"/></svg>'}
  };

  function text(card){
    return((card.querySelector('.ward-card-copy strong')?.textContent||'')+' '+(card.querySelector('.ward-card-copy small')?.textContent||'')).toLowerCase();
  }
  function kind(card){return window.FITS_WARDROBE_KIND?FITS_WARDROBE_KIND(card):'Other'}
  function updateUrl(){
    const next=new URLSearchParams({category});
    if(ownership!=='All')next.set('status',ownership.toLowerCase());
    if(impactMin)next.set('impact',String(impactMin));
    history.replaceState(null,'',`wardrobe.html?${next}`);
  }
  function apply(){
    const cards=[...document.querySelectorAll('.ward-card')];
    let shown=0;
    cards.forEach(card=>{
      const categoryMatch=category==='All'||kind(card)===category;
      const impactMatch=!impactMin||Number(card.dataset.impactCount)>=impactMin;
      const hidden=card.classList.contains('is-hidden');
      const ownershipMatch=ownership==='Hidden'?hidden:!hidden&&(ownership==='All'||ownership==='Owned'&&card.classList.contains('is-owned')||ownership==='Missing'&&card.classList.contains('is-missing')||ownership==='Wishlist'&&card.classList.contains('is-wishlist'));
      const show=categoryMatch&&impactMatch&&ownershipMatch;
      card.style.display=show?'':'none';
      if(show)shown++;
    });
    document.querySelectorAll('.ward-section').forEach(section=>{
      section.style.display=[...section.querySelectorAll('.ward-card')].some(card=>card.style.display!=='none')?'':'none';
    });
    const count=document.querySelector('.wardrobe-filter-count');
    if(count)count.textContent=`${shown} ${shown===1?'item':'items'}`;
  }
  function chip(label,type){
    const active=(type==='category'?category:ownership)===label;
    if(type!=='category'){const meta=STATUS_META[label];return`<button class="wardrobe-filter-chip ${active?'active':''}" data-${type}="${label}" aria-label="${meta.label}" aria-pressed="${active}"><span class="filter-symbol">${meta.icon}</span><span class="filter-name">${meta.label}</span></button>`}
    const count=label==='All'?[...document.querySelectorAll('.ward-card')].filter(card=>!card.classList.contains('is-hidden')).length:[...document.querySelectorAll('.ward-card')].filter(card=>kind(card)===label&&!card.classList.contains('is-hidden')).length,meta=META[label];
    return`<button class="wardrobe-filter-chip closet-section ${active?'active':''}" data-${type}="${label}" aria-label="${meta.label}, ${count} items" aria-pressed="${active}"><span class="closet-icon">${meta.icon}</span><span class="closet-label"><strong>${meta.label}</strong></span></button>`;
  }
  function enhance(){
    const grid=document.querySelector('.ward-grid');
    if(!grid)return;
    const availableCategories=CATEGORIES.filter(label=>[...document.querySelectorAll('.ward-card')].some(card=>kind(card)===label));
    if(category!=='All'&&!availableCategories.includes(category))category=availableCategories[0]||'Other';
    let bar=document.querySelector('.wardrobe-filterbar');
    if(!bar){
      bar=document.createElement('div');
      bar.className='wardrobe-filterbar';
      bar.innerHTML=`<section class="closet-browser" aria-label="Wardrobe categories"><div class="wardrobe-filter-chips wardrobe-category-chips">${['All',...availableCategories].map(x=>chip(x,'category')).join('')}</div></section><div class="wardrobe-filter-head wardrobe-status-head"><span>Show</span><b class="wardrobe-filter-count"></b></div><div class="wardrobe-filter-chips wardrobe-status-chips">${['All','Owned','Missing','Wishlist','Hidden'].map(x=>chip(x,'ownership')).join('')}</div>`;
      grid.before(bar);
      bar.querySelectorAll('[data-category]').forEach(btn=>btn.onclick=()=>{
        category=btn.dataset.category;
        bar.querySelectorAll('[data-category]').forEach(x=>{const active=x.dataset.category===category;x.classList.toggle('active',active);x.setAttribute('aria-pressed',active)});
        updateUrl();
        apply();
      });
      bar.querySelectorAll('[data-ownership]').forEach(btn=>btn.onclick=()=>{
        ownership=btn.dataset.ownership;
        bar.querySelectorAll('[data-ownership]').forEach(x=>{const active=x.dataset.ownership===ownership;x.classList.toggle('active',active);x.setAttribute('aria-pressed',active)});
        updateUrl();
        apply();
      });
    }
    apply();
  }

  new MutationObserver(()=>requestAnimationFrame(enhance)).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(enhance));
})();
