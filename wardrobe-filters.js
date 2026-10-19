(()=>{
  if(document.body.dataset.page!=='wardrobe')return;

  const params=new URLSearchParams(location.search);
  const CATEGORIES=['Dress Shirts','T-Shirts & Polos','Sweaters & Knitwear','Pants','Shorts','Outerwear','Shoes','Accessories','Other'];
  const requestedCategory=params.get('category');
  let category=requestedCategory==='All'||CATEGORIES.includes(requestedCategory)?requestedCategory:'Dress Shirts';
  const requestedStatus=params.get('status');
  let ownership={missing:'Missing',owned:'Owned',wishlist:'Wishlist',hidden:'Hidden'}[requestedStatus]||'All';
  let query='';
  const META={
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

  function text(card){
    return((card.querySelector('.ward-card-copy strong')?.textContent||'')+' '+(card.querySelector('.ward-card-copy small')?.textContent||'')).toLowerCase();
  }
  function kind(card){return window.FITS_WARDROBE_KIND?FITS_WARDROBE_KIND(card):'Other'}
  function normalized(value){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
  function updateUrl(){
    const next=new URLSearchParams({category});
    if(ownership!=='All')next.set('status',ownership.toLowerCase());
    history.replaceState(null,'',`wardrobe.html?${next}`);
  }
  function apply(){
    const cards=[...document.querySelectorAll('.ward-card')],needle=normalized(query);
    let shown=0;
    cards.forEach(card=>{
      const categoryMatch=category==='All'||kind(card)===category;
      const hidden=card.classList.contains('is-hidden');
      const ownershipMatch=ownership==='Hidden'?hidden:!hidden&&(ownership==='All'||ownership==='Owned'&&card.classList.contains('is-owned')||ownership==='Missing'&&card.classList.contains('is-missing')||ownership==='Wishlist'&&card.classList.contains('is-wishlist'));
      const searchMatch=!needle||normalized(text(card)).includes(needle);
      const show=categoryMatch&&ownershipMatch&&searchMatch;
      card.style.display=show?'':'none';
      if(show)shown++;
    });
    document.querySelectorAll('.ward-section').forEach(section=>{
      section.style.display=[...section.querySelectorAll('.ward-card')].some(card=>card.style.display!=='none')?'':'none';
    });
    const count=document.querySelector('.wardrobe-filter-count');
    if(count)count.textContent=`${shown} ${shown===1?'item':'items'}`;
    const empty=document.querySelector('.wardrobe-search-empty');
    if(empty)empty.hidden=shown!==0;
  }
  function chip(label,type){
    const active=(type==='category'?category:ownership)===label;
    if(type!=='category')return`<button class="wardrobe-filter-chip ${active?'active':''}" data-${type}="${label}" aria-pressed="${active}"><span>${label}</span></button>`;
    const count=[...document.querySelectorAll('.ward-card')].filter(card=>kind(card)===label&&!card.classList.contains('is-hidden')).length,meta=META[label];
    return`<button class="wardrobe-filter-chip closet-section ${active?'active':''}" data-${type}="${label}" aria-pressed="${active}"><span class="closet-icon">${meta.icon}</span><span class="closet-label"><strong>${meta.label}</strong><small>${meta.place} · ${count}</small></span><span class="closet-check" aria-hidden="true">✓</span></button>`;
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
      const total=[...document.querySelectorAll('.ward-card')].filter(card=>!card.classList.contains('is-hidden')).length;
      bar.innerHTML=`<section class="closet-browser" aria-label="Wardrobe sections"><div class="closet-browser-head"><div><small>Your closet</small><strong>Choose a section</strong></div><button class="closet-view-all ${category==='All'?'active':''}" data-category="All" aria-pressed="${category==='All'}">${category==='All'?'Viewing all':`View all ${total}`}</button></div><div class="closet-rail" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="wardrobe-filter-chips wardrobe-category-chips">${availableCategories.map(x=>chip(x,'category')).join('')}</div></section><label class="wardrobe-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="${category==='All'?'Search all wardrobe':`Search in ${META[category]?.label||category}`}" aria-label="Search selected wardrobe category"><button type="button" aria-label="Clear search" hidden>×</button></label><div class="wardrobe-filter-head wardrobe-status-head"><span>Show</span><b class="wardrobe-filter-count"></b></div><div class="wardrobe-filter-chips wardrobe-status-chips">${['All','Owned','Missing','Wishlist','Hidden'].map(x=>chip(x,'ownership')).join('')}</div><div class="wardrobe-search-empty" hidden>No items match this search.</div>`;
      grid.before(bar);
      const input=bar.querySelector('input'),clear=bar.querySelector('.wardrobe-search button');
      input.addEventListener('input',()=>{query=input.value;clear.hidden=!query;apply()});
      clear.addEventListener('click',()=>{query='';input.value='';clear.hidden=true;input.focus();apply()});
      bar.querySelectorAll('[data-category]').forEach(btn=>btn.onclick=()=>{
        category=btn.dataset.category;
        bar.querySelectorAll('[data-category]').forEach(x=>{const active=x.dataset.category===category;x.classList.toggle('active',active);x.setAttribute('aria-pressed',active)});
        input.placeholder=category==='All'?'Search all wardrobe':`Search in ${META[category]?.label||category}`;
        const viewAll=bar.querySelector('.closet-view-all');
        viewAll.classList.toggle('active',category==='All');
        viewAll.setAttribute('aria-pressed',category==='All');
        viewAll.textContent=category==='All'?'Viewing all':`View all ${[...document.querySelectorAll('.ward-card')].filter(card=>!card.classList.contains('is-hidden')).length}`;
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
