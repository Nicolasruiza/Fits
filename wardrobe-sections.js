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
  // Dark to light by colour family, so similar colours sit together. First matching rule wins.
  const COLOR_RULES=[[/red, white and blue/,9],[/light[- ]blue|sky blue/,9.2],[/light[- ]?gr[ae]y/,9],[/off-?white|cream|ivory/,12],[/\bwhite\b/,13],[/black/,0],[/dark brown|chocolate|espresso/,3],[/dark green/,4.5],[/charcoal|\bdark\b/,1],[/navy|indigo/,2],[/burgundy|\bred\b/,4],[/olive|green/,5],[/blue/,6],[/brown|cognac/,7],[/gr[ae]y/,8],[/taupe|\btan\b|camel|khaki|stone/,10],[/beige/,11]];
  function colorRank(card){const name=(card.querySelector('.ward-card-copy strong')?.textContent||'').toLowerCase();const hit=COLOR_RULES.find(([re])=>re.test(name));return hit?hit[1]:8.5}
  window.FITS_COLOR_RANK=name=>{const hit=COLOR_RULES.find(([re])=>re.test(String(name).toLowerCase()));return hit?hit[1]:8.5};
  // Interchangeable pieces stay separate cards (each can still be owned or wishlisted) but sit next to each
  // other, at the spot of the first one in the colour order, and carry a "Linked" badge.
  function linkedNames(card){const S=window.FITS_SWAPS,id=card.dataset.pieceId;if(!S||!id)return[];return S.interchangeable(id).map(other=>window.FITS_DATA.pieces.find(p=>p.id===other)?.name).filter(Boolean)}
  function clusterLinked(cards){
    const S=window.FITS_SWAPS;if(!S)return cards;
    const byId=new Map(cards.map(c=>[c.dataset.pieceId,c])),placed=new Set(),out=[];
    cards.forEach(card=>{
      if(placed.has(card))return;
      const group=[card],queue=[card];placed.add(card);
      while(queue.length){const current=queue.shift();S.interchangeable(current.dataset.pieceId).forEach(other=>{const next=byId.get(other);if(next&&!placed.has(next)){placed.add(next);group.push(next);queue.push(next)}})}
      out.push(...group);
    });
    cards.forEach(card=>{
      const names=linkedNames(card),photo=card.querySelector('.ward-photo');
      if(!names.length||!photo||photo.querySelector('.linked-badge'))return;
      const badge=document.createElement('span');badge.className='linked-badge';badge.textContent='Linked';badge.title='Interchangeable with '+names.join(', ');photo.appendChild(badge);
    });
    return out;
  }
  let scheduled=false,observer;
  function groupWardrobe(){const grid=document.querySelector('.ward-grid');if(!grid||grid.dataset.sectioned==='yes')return;const cards=[...grid.querySelectorAll('.ward-card')];if(!cards.length)return;observer?.disconnect();const groups=new Map(ORDER.map(k=>[k,[]]));cards.forEach(card=>groups.get(kind(card)).push(card));const frag=document.createDocumentFragment();ORDER.forEach(label=>{const items=groups.get(label);if(!items?.length)return;items.sort((a,b)=>colorRank(a)-colorRank(b)||(a.querySelector('.ward-card-copy strong')?.textContent||'').localeCompare(b.querySelector('.ward-card-copy strong')?.textContent||''));const section=document.createElement('section');section.className='ward-section';section.dataset.wardSection=label;section.innerHTML=`<div class="ward-section-head"><h2>${label}</h2><span>${items.length}</span></div><div class="ward-section-grid"></div>`;const inner=section.querySelector('.ward-section-grid');clusterLinked(items).forEach(card=>inner.appendChild(card));frag.appendChild(section)});grid.replaceChildren(frag);grid.dataset.sectioned='yes';observe()}
  function observe(){observer?.observe(document.body,{childList:true,subtree:true})}function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;groupWardrobe()})}
  observer=new MutationObserver(schedule);observe();document.addEventListener('DOMContentLoaded',schedule);schedule();
})();
