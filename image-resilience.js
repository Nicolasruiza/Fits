(()=>{
  const style=document.createElement('style');
  style.textContent=`.fits-img-fallback{position:absolute;inset:0;display:grid;place-items:center;background:linear-gradient(145deg,#eef1ef,#dde3e0);color:#7b8589;font:700 11px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.02em;text-align:center;padding:12px}.ward-photo .fits-img-fallback,.unlock-photo .fits-img-fallback,.piece-photo .fits-img-fallback{font-size:18px}.variant-media .fits-img-fallback{font-size:9px}.visual,.hero,.variant-media,.ward-photo,.unlock-photo,.piece-photo{position:relative}`;
  document.head.appendChild(style);

  function initials(s=''){
    const parts=s.trim().split(/\s+/).filter(Boolean);
    return (parts.slice(0,2).map(x=>x[0]).join('')||'—').toUpperCase();
  }
  function fail(img){
    if(!img||img.dataset.fallbackDone==='1')return;
    img.dataset.fallbackDone='1';
    const p=img.parentElement;
    if(!p)return;
    if(img.classList.contains('variant-thumb')){img.style.display='none';return;}
    img.style.display='none';
    if(p.querySelector(':scope > .fits-img-fallback'))return;
    const d=document.createElement('div');
    d.className='fits-img-fallback';
    const pieceLike=p.classList.contains('ward-photo')||p.classList.contains('unlock-photo')||p.classList.contains('piece-photo');
    d.textContent=pieceLike?initials(img.alt):'Photo pending';
    p.appendChild(d);
  }
  document.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement)fail(e.target)},true);
  function scan(root=document){
    root.querySelectorAll?.('img').forEach(img=>{if(img.complete&&img.naturalWidth===0)fail(img)});
  }
  scan();
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType!==1)return;if(n.tagName==='IMG'){if(n.complete&&n.naturalWidth===0)fail(n)}else scan(n)}))).observe(document.documentElement,{childList:true,subtree:true});
})();