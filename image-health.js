(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const look=id=>(D.looks||[]).find(x=>x.id===id);
  const family=id=>(D.families||[]).find(x=>x.id===id);
  const normalize=s=>String(s||'').trim();
  function familyIdFor(img){
    const a=img.closest?.('a[href*="family="]');
    if(a){try{return new URL(a.getAttribute('href'),location.href).searchParams.get('family')}catch(e){}}
    try{return new URL(location.href).searchParams.get('family')}catch(e){return null}
  }
  function lookIdFor(img){
    const a=img.closest?.('a[href*="look="]');
    if(a){try{return new URL(a.getAttribute('href'),location.href).searchParams.get('look')}catch(e){}}
    try{return new URL(location.href).searchParams.get('look')}catch(e){return null}
  }
  function candidates(img){
    const fid=familyIdFor(img),f=family(fid);if(!f)return[];
    const requested=lookIdFor(img),ordered=[];
    if(requested){const l=look(requested);if(l)ordered.push(l)}
    const hero=look(f.hero);if(hero&&!ordered.includes(hero))ordered.push(hero);
    (f.looks||[]).map(look).filter(Boolean).forEach(l=>{if(!ordered.includes(l))ordered.push(l)});
    return ordered.map(l=>normalize(l.image)).filter(Boolean);
  }
  function tried(img){try{return new Set(JSON.parse(img.dataset.fitsTried||'[]'))}catch(e){return new Set}}
  function saveTried(img,set){img.dataset.fitsTried=JSON.stringify([...set])}
  function recover(img){
    if(!(img instanceof HTMLImageElement))return false;
    const classes=['look-img','variant-thumb'];
    const outfit=classes.some(c=>img.classList.contains(c))||!!img.closest('.hero,.variant-media,.rank-photo,.recent-photo,.daily-photo');
    if(!outfit)return false;
    const seen=tried(img),current=normalize(img.getAttribute('src'));
    if(current)seen.add(current);
    const next=candidates(img).find(src=>!seen.has(src));
    if(!next)return false;
    seen.add(next);saveTried(img,seen);img.style.display='';img.src=next;return true;
  }
  document.addEventListener('error',e=>{
    const img=e.target;if(!(img instanceof HTMLImageElement))return;
    if(recover(img)){e.stopImmediatePropagation();e.preventDefault();}
  },true);
  document.addEventListener('load',e=>{const img=e.target;if(img instanceof HTMLImageElement)img.dataset.fitsHealthy='1'},true);
})();