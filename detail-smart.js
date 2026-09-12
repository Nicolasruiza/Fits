(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const safe=(k,f)=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):f}catch(e){return f}},q=new URLSearchParams(location.search);
  const family=D.families.find(f=>f.id===q.get('family'))||D.families[0],look=id=>D.looks.find(l=>l.id===id),piece=id=>D.pieces.find(p=>p.id===id);
  const looks=(family.looks||[]).map(look).filter(Boolean),active=look(q.get('look'))||look(family.hero)||looks[0];
  function wardrobe(){return safe('fitsWardrobe',{})}function missing(l,w){return(l.pieces||[]).filter(id=>w[id]!=='owned')}
  function shortVariant(v){const base=active,add=(v.pieces||[]).filter(x=>!(base.pieces||[]).includes(x)).map(x=>piece(x)?.name).filter(Boolean),rem=(base.pieces||[]).filter(x=>!(v.pieces||[]).includes(x)).map(x=>piece(x)?.name).filter(Boolean);if(add.length===1&&rem.length===1)return`${rem[0]} → ${add[0]}`;return v.name}
  function enhance(){const row=document.querySelector('.statusrow');if(!row)return;document.querySelector('.wardrobe-smart-banner')?.remove();const w=wardrobe(),m=missing(active,w),ready=looks.filter(v=>!missing(v,w).length&&v.id!==active.id),banner=document.createElement('div');banner.className='wardrobe-smart-banner';
    if(!m.length){banner.classList.add('ready');banner.innerHTML=`<div><b>✓ Ready from your wardrobe</b><span>You own every required piece for this exact variant.</span></div>`}
    else if(ready.length){const alt=ready[0];banner.classList.add('switch');banner.innerHTML=`<div><b>You can wear this family now</b><span>This variant needs ${m.length} ${m.length===1?'piece':'pieces'}, but another saved combination is complete.</span></div><a href="detail.html?family=${encodeURIComponent(family.id)}&look=${encodeURIComponent(alt.id)}">Switch · ${shortVariant(alt)} →</a>`}
    else{const names=m.slice(0,2).map(id=>piece(id)?.name||id).join(' + '),more=m.length>2?` + ${m.length-2} more`:'';banner.classList.add('missing');banner.innerHTML=`<div><b>${m.length} ${m.length===1?'piece':'pieces'} away</b><span>${names}${more}</span></div><a href="unlock.html">See buying priority →</a>`}
    row.after(banner)}
  let lock=false;const obs=new MutationObserver(()=>{if(lock)return;lock=true;requestAnimationFrame(()=>{enhance();lock=false})});obs.observe(document.getElementById('root')||document.body,{childList:true,subtree:true});document.addEventListener('DOMContentLoaded',enhance);enhance();
})();