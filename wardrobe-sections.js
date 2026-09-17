(()=>{
  if(document.body.dataset.page!=='wardrobe')return;

  const ORDER=['Tops','Pants','Shoes','Layers','Accessories','Other'];

  function kind(card){
    const cat=(card.querySelector('.ward-card-copy small')?.textContent||'').toLowerCase();
    if(cat.includes('outer'))return'Layers';
    if(cat.includes('pant')||cat.includes('trouser')||cat.includes('denim')||cat.includes('bottom'))return'Pants';
    if(cat.includes('shoe')||cat.includes('foot'))return'Shoes';
    if(cat.includes('top'))return'Tops';
    if(cat.includes('access'))return'Accessories';
    return'Other';
  }

  let scheduled=false;
  let observer;

  function groupWardrobe(){
    const grid=document.querySelector('.ward-grid');
    if(!grid||grid.dataset.sectioned==='yes')return;

    const cards=[...grid.querySelectorAll('.ward-card')];
    if(!cards.length)return;

    observer?.disconnect();
    const groups=new Map(ORDER.map(k=>[k,[]]));
    cards.forEach(card=>groups.get(kind(card)).push(card));

    const frag=document.createDocumentFragment();
    ORDER.forEach(label=>{
      const items=groups.get(label);
      if(!items?.length)return;
      items.sort((a,b)=>{
        const an=(a.querySelector('.ward-card-copy strong')?.textContent||'').trim();
        const bn=(b.querySelector('.ward-card-copy strong')?.textContent||'').trim();
        return an.localeCompare(bn);
      });

      const section=document.createElement('section');
      section.className='ward-section';
      section.dataset.wardSection=label;
      section.innerHTML=`<div class="ward-section-head"><h2>${label}</h2><span>${items.length}</span></div><div class="ward-section-grid"></div>`;
      const inner=section.querySelector('.ward-section-grid');
      items.forEach(card=>inner.appendChild(card));
      frag.appendChild(section);
    });

    grid.replaceChildren(frag);
    grid.dataset.sectioned='yes';
    observe();
  }

  function observe(){observer?.observe(document.body,{childList:true,subtree:true})}
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      groupWardrobe();
    });
  }

  observer=new MutationObserver(schedule);
  observe();
  document.addEventListener('DOMContentLoaded',schedule);
  schedule();
})();
