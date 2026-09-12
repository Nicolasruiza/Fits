(()=>{
  const D=window.FITS_DATA;
  if(!D)return;
  const p=id=>D.pieces.find(x=>x.id===id);
  const l=id=>D.looks.find(x=>x.id===id);
  function seasonsForLook(look){
    const names=(look?.pieces||[]).map(id=>(p(id)?.name||id).toLowerCase()).join(' ');
    const cold=/overcoat|wool|leather jacket|coat|turtleneck|cable|sweater/.test(names);
    const layer=/blazer|jacket|cardigan|quarter[- ]?zip|vest|overshirt|henley/.test(names);
    if(cold)return ['Cold'];
    if(layer)return ['Transitional'];
    return ['Summer'];
  }
  function seasonsForFamily(f){
    return [...new Set((f.looks||[]).map(l).filter(Boolean).flatMap(seasonsForLook))];
  }
  function enhance(){
    const chips=document.querySelector('.chips');
    if(!chips)return;
    D.families.forEach(f=>{
      const card=document.querySelector(`a.card[href="detail.html?family=${f.id}"]`);
      if(card)card.dataset.seasons=seasonsForFamily(f).join(',');
    });
    if(!chips.querySelector('[data-season="Summer"]')){
      ['Summer','Transitional','Cold'].forEach(name=>{
        const b=document.createElement('button');
        b.className='chip season-chip';
        b.dataset.season=name;
        b.textContent=name;
        b.addEventListener('click',()=>{
          document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
          b.classList.add('active');
          let visible=0;
          document.querySelectorAll('.card').forEach(card=>{
            const show=(card.dataset.seasons||'').split(',').includes(name);
            card.classList.toggle('hidden',!show);
            if(show)visible++;
          });
          const empty=document.querySelector('.empty');
          if(empty)empty.style.display=visible?'none':'block';
        });
        chips.appendChild(b);
      });
    }
  }
  const original=window.render;
  if(typeof original==='function'){
    window.render=function(...args){const out=original.apply(this,args);enhance();return out};
  }
  enhance();
})();