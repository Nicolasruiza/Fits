(()=>{
  if(document.body.dataset.page!=='wardrobe')return;

  const params=new URLSearchParams(location.search);
  const CATEGORIES=['Dress Shirts','T-Shirts & Polos','Sweaters & Knitwear','Pants','Shorts','Outerwear','Shoes','Accessories','Other'];
  let category=CATEGORIES.includes(params.get('category'))?params.get('category'):'Dress Shirts';
  let ownership=params.get('status')==='missing'?'Missing':'All';
  let query='';

  function text(card){
    return((card.querySelector('.ward-card-copy strong')?.textContent||'')+' '+(card.querySelector('.ward-card-copy small')?.textContent||'')).toLowerCase();
  }
  function kind(card){return window.FITS_WARDROBE_KIND?FITS_WARDROBE_KIND(card):'Other'}
  function normalized(value){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
  function updateUrl(){
    const next=new URLSearchParams({category});
    if(ownership==='Missing')next.set('status','missing');
    history.replaceState(null,'',`wardrobe.html?${next}`);
  }
  function apply(){
    const cards=[...document.querySelectorAll('.ward-card')],needle=normalized(query);
    let shown=0;
    cards.forEach(card=>{
      const categoryMatch=kind(card)===category;
      const ownershipMatch=ownership==='All'||ownership==='Owned'&&card.classList.contains('is-owned')||ownership==='Missing'&&card.classList.contains('is-missing');
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
    const count=type==='category'?[...document.querySelectorAll('.ward-card')].filter(card=>kind(card)===label).length:null;
    return`<button class="wardrobe-filter-chip ${active?'active':''}" data-${type}="${label}" aria-pressed="${active}"><span>${label}</span>${count===null?'':`<b>${count}</b>`}</button>`;
  }
  function enhance(){
    const grid=document.querySelector('.ward-grid');
    if(!grid)return;
    const availableCategories=CATEGORIES.filter(label=>[...document.querySelectorAll('.ward-card')].some(card=>kind(card)===label));
    if(!availableCategories.includes(category))category=availableCategories[0]||'Other';
    let bar=document.querySelector('.wardrobe-filterbar');
    if(!bar){
      bar=document.createElement('div');
      bar.className='wardrobe-filterbar';
      bar.innerHTML=`<div class="wardrobe-filter-head wardrobe-category-head"><span>Browse wardrobe</span><b class="wardrobe-filter-count"></b></div><div class="wardrobe-filter-chips wardrobe-category-chips">${availableCategories.map(x=>chip(x,'category')).join('')}</div><label class="wardrobe-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search in ${category}" aria-label="Search selected wardrobe category"><button type="button" aria-label="Clear search" hidden>×</button></label><div class="wardrobe-filter-head wardrobe-status-head"><span>Show</span><small>Missing pieces include their look impact</small></div><div class="wardrobe-filter-chips wardrobe-status-chips">${['All','Owned','Missing'].map(x=>chip(x,'ownership')).join('')}</div><div class="wardrobe-search-empty" hidden>No items match this search.</div>`;
      grid.before(bar);
      const input=bar.querySelector('input'),clear=bar.querySelector('.wardrobe-search button');
      input.addEventListener('input',()=>{query=input.value;clear.hidden=!query;apply()});
      clear.addEventListener('click',()=>{query='';input.value='';clear.hidden=true;input.focus();apply()});
      bar.querySelectorAll('[data-category]').forEach(btn=>btn.onclick=()=>{
        category=btn.dataset.category;
        bar.querySelectorAll('[data-category]').forEach(x=>{const active=x.dataset.category===category;x.classList.toggle('active',active);x.setAttribute('aria-pressed',active)});
        input.placeholder=`Search in ${category}`;
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
