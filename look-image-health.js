(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const look=id=>(D.looks||[]).find(x=>x.id===id);
  const family=id=>(D.families||[]).find(x=>x.id===id);
  const clean=s=>String(s||'').trim();
  function familyFromNode(img){
    const link=img.closest?.('a[href*="detail.html?family="]');
    if(link){try{return family(new URL(link.getAttribute('href'),location.href).searchParams.get('family'))}catch(e){}}
    const q=new URLSearchParams(location.search),fid=q.get('family');
    return fid?family(fid):null;
  }
  function candidates(img){
    const f=familyFromNode(img);if(!f)return[];
    const current=clean(img.getAttribute('src'));
    return (f.looks||[]).map(look).filter(Boolean).map(l=>clean(l.image)).filter(src=>src&&src!==current&&!src.includes('inspiration-'));
  }
  function tried(img){try{return JSON.parse(img.dataset.triedSources||'[]')}catch(e){return[]}}
  function retry(img){
    const seen=new Set(tried(img));seen.add(clean(img.getAttribute('src')));
    const next=candidates(img).find(src=>!seen.has(src));
    if(!next)return false;
    seen.add(next);img.dataset.triedSources=JSON.stringify([...seen]);
    img.removeAttribute('onerror');img.onerror=null;img.style.display='block';img.src=next;return true;
  }
  function handle(img,e){
    if(!(img instanceof HTMLImageElement))return;
    const pieceLike=!!img.closest?.('.ward-photo,.unlock-photo,.piece-photo');
    if(pieceLike)return;
    const lookLike=!!img.closest?.('.card,.hero,.variant-media,.rank-row,.recent-row,.daily-photo');
    if(!lookLike)return;
    if(retry(img)){e?.stopImmediatePropagation?.();e?.preventDefault?.();return}
    const variant=img.closest?.('.variant');if(variant){variant.remove();e?.stopImmediatePropagation?.();return}
    const row=img.closest?.('.rank-row,.recent-row');if(row){row.remove();e?.stopImmediatePropagation?.();return}
    const card=img.closest?.('.card');if(card){card.remove();e?.stopImmediatePropagation?.();return}
    const hero=img.closest?.('.hero');if(hero){hero.style.display='none';e?.stopImmediatePropagation?.();}
  }
  document.addEventListener('error',e=>handle(e.target,e),true);
  function scan(root=document){root.querySelectorAll?.('img').forEach(img=>{if(img.complete&&img.naturalWidth===0)handle(img)})}
  scan();
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType!==1)return;if(n.tagName==='IMG'){if(n.complete&&n.naturalWidth===0)handle(n)}else scan(n)}))).observe(document.documentElement,{childList:true,subtree:true});
})();