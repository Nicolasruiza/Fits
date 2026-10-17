(()=>{
  const D=window.FITS_DATA,L=window.FITS_WINTER_LAYERS;if(!D||!L)return;
  const q=new URLSearchParams(location.search),look=id=>D.looks.find(x=>x.id===id),family=D.families.find(f=>f.id===q.get('family'))||D.families[0];
  const active=look(q.get('look'))||look(family?.hero)||(family?.looks||[]).map(look).find(Boolean);
  const image=id=>(window.FITS_CATALOG_IMAGES||{})[id];
  const escape=s=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  if(!active||(!L.canLayer(active)&&!L.hasWinterCoat(active)))return;
  window.chooseWinterLayer=function(id){L.choose(active.id,id||null);enhance()};
  function coatCard(p,chosen){
    const src=image(p.id);
    return `<button class="coat-option ${chosen?'selected':''}" type="button" onclick="chooseWinterLayer('${escape(p.id)}')" aria-pressed="${chosen}">${src?`<span class="coat-photo"><img src="${escape(src)}" alt="${escape(p.name)}"></span>`:'<span class="coat-photo empty">Coat</span>'}<span class="coat-copy"><b>${escape(p.name)}</b><small>${chosen?'Added · winter ready':'Tap to add'}</small></span><span class="coat-check">${chosen?'✓':'+'}</span></button>`;
  }
  function enhance(){
    const actions=document.querySelector('.actions'),row=document.querySelector('.statusrow');if(!actions||!row)return;
    const existing=document.querySelector('.winter-layer-panel'),selected=L.selected(active),owned=L.ownedCoats();
    if(L.hasWinterCoat(active)){
      existing?.remove();
      let badge=row.querySelector('[data-season="Cold"]');if(!badge){badge=document.createElement('span');badge.className='status season-status';badge.dataset.season='Cold';row.prepend(badge)}
      badge.classList.add('layered-season-status');
      if(badge.textContent!=='Cold · coat included')badge.textContent='Cold · coat included';return;
    }
    let panel=existing;if(!panel){panel=document.createElement('section');panel.className='winter-layer-panel';actions.after(panel)}
    const options=owned.map(p=>coatCard(p,selected?.id===p.id)).join('');
    panel.classList.toggle('is-layered',!!selected);
    const state=`${selected?.id||'none'}:${owned.map(p=>p.id).join(',')}`;
    if(panel.dataset.layerState!==state){panel.dataset.layerState=state;panel.innerHTML=`<div class="winter-layer-head"><div><span>${selected?'WINTER VERSION':'MAKE IT WINTER'}</span><h2>${selected?'Coat added':'Add a coat'}</h2></div>${selected?'<button type="button" onclick="chooseWinterLayer(null)">Remove</button>':''}</div><p>${selected?`${escape(active.name)} + ${escape(selected.name)}`:'Keep this base look and add one of your coats. It stays one look, with a warmer version.'}</p>${options?`<div class="coat-options">${options}</div>`:`<a class="set-coats" href="wardrobe.html">Choose your coats in Wardrobe →</a>`}`}
    let badge=row.querySelector('[data-season="Cold"]');
    if(!badge){badge=document.createElement('span');badge.className='status season-status';badge.dataset.season='Cold';row.prepend(badge)}
    badge.classList.toggle('layered-season-status',!!selected);const label=selected?'Cold · layered':'Cold · add coat';if(badge.textContent!==label)badge.textContent=label;
  }
  let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance()})}).observe(document.getElementById('root')||document.body,{childList:true,subtree:true});
  window.addEventListener('fits:winter-layer-changed',enhance);document.addEventListener('DOMContentLoaded',enhance);enhance();
})();
