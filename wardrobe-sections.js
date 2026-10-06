(()=>{
  if(document.body.dataset.page!=='wardrobe')return;

  const ORDER=['Dress Pants','Shoes','Dress Shirts','T-Shirts & Polos','Sweaters & Knitwear','Outerwear','Accessories','Other'];

  function text(card){
    return ((card.querySelector('.ward-card-copy strong')?.textContent||'')+' '+(card.querySelector('.ward-card-copy small')?.textContent||'')).toLowerCase();
  }
  function kind(card){
    const t=text(card);
    if(/belt|watch|accessor|tie|scarf|wallet/.test(t))return'Accessories';
    if(/shoe|sneaker|loafer|boot|chelsea|derb|brogue|wingtip|footwear/.test(t))return'Shoes';
    if(/blazer|jacket|coat|outerwear|bomber/.test(t))return'Outerwear';
    if(/sweater|crewneck|crew-neck|v-neck|quarter-zip|quarter zip|cardigan|turtleneck|knit/.test(t))return'Sweaters & Knitwear';
    if(/shirt|button-down|button down|button-up|button up|oxford|gingham|check/.test(t)&&!/t-shirt|tee|polo|henley/.test(t))return'Dress Shirts';
    if(/t-shirt|tee|polo|henley/.test(t))return'T-Shirts & Polos';
    if(/trouser|chino|pant|denim|jean|bottom/.test(t))return'Dress Pants';
    return'Other';
  }

  let scheduled=false,observer;
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
      const items=groups.get(label); if(!items?.length)return;
      items.sort((a,b)=>(a.querySelector('.ward-card-copy strong')?.textContent||'').localeCompare(b.querySelector('.ward-card-copy strong')?.textContent||''));
      const section=document.createElement('section');
      section.className='ward-section'; section.dataset.wardSection=label;
      section.innerHTML=`<div class="ward-section-head"><h2>${label}</h2><span>${items.length}</span></div><div class="ward-section-grid"></div>`;
      const inner=section.querySelector('.ward-section-grid'); items.forEach(card=>inner.appendChild(card)); frag.appendChild(section);
    });
    grid.replaceChildren(frag); grid.dataset.sectioned='yes'; observe();
  }
  function observe(){observer?.observe(document.body,{childList:true,subtree:true})}
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;groupWardrobe()})}
  observer=new MutationObserver(schedule);observe();document.addEventListener('DOMContentLoaded',schedule);schedule();
})();