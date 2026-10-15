(()=>{
  if(document.body.dataset.page!=='wardrobe')return;
  const ORDER=['Dress Shirts','T-Shirts & Polos','Sweaters & Knitwear','Pants','Shorts','Outerwear','Shoes','Accessories','Other'];
  function text(card){return((card.querySelector('.ward-card-copy strong')?.textContent||'')+' '+(card.querySelector('.ward-card-copy small')?.textContent||'')).toLowerCase()}
  function kind(card){
    const t=text(card);
    if(/belt|watch|accessor|tie|scarf|wallet/.test(t))return'Accessories';
    if(/shoe|sneaker|loafer|boot|chelsea|derb|brogue|wingtip|footwear|espadrille/.test(t))return'Shoes';
    if(/t-shirt|tee|polo|henley/.test(t))return'T-Shirts & Polos';
    if(/sweater|crewneck|crew-neck|v-neck|quarter-zip|quarter zip|cardigan|turtleneck|knit/.test(t))return'Sweaters & Knitwear';
    if(/overshirt|blazer|jacket|coat|outerwear|bomber/.test(t))return'Outerwear';
    if(/shirt|button-down|button down|button-up|button up|oxford|gingham|check/.test(t))return'Dress Shirts';
    if(/short/.test(t))return'Shorts';
    if(/denim|jean|chino|trouser|dress pant|tailored pant|pants|bottom/.test(t))return'Pants';
    return'Other';
  }
  window.FITS_WARDROBE_KIND=kind;
  let scheduled=false,observer;
  function groupWardrobe(){const grid=document.querySelector('.ward-grid');if(!grid||grid.dataset.sectioned==='yes')return;const cards=[...grid.querySelectorAll('.ward-card')];if(!cards.length)return;observer?.disconnect();const groups=new Map(ORDER.map(k=>[k,[]]));cards.forEach(card=>groups.get(kind(card)).push(card));const frag=document.createDocumentFragment();ORDER.forEach(label=>{const items=groups.get(label);if(!items?.length)return;items.sort((a,b)=>(a.querySelector('.ward-card-copy strong')?.textContent||'').localeCompare(b.querySelector('.ward-card-copy strong')?.textContent||''));const section=document.createElement('section');section.className='ward-section';section.dataset.wardSection=label;section.innerHTML=`<div class="ward-section-head"><h2>${label}</h2><span>${items.length}</span></div><div class="ward-section-grid"></div>`;const inner=section.querySelector('.ward-section-grid');items.forEach(card=>inner.appendChild(card));frag.appendChild(section)});grid.replaceChildren(frag);grid.dataset.sectioned='yes';observe()}
  function observe(){observer?.observe(document.body,{childList:true,subtree:true})}function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;groupWardrobe()})}
  observer=new MutationObserver(schedule);observe();document.addEventListener('DOMContentLoaded',schedule);schedule();
})();
