(()=>{
  let navigating=false;
  function cardFromEvent(e){
    const direct=e.target?.closest?.('.card');
    if(direct)return direct;
    const p=e.changedTouches?.[0]||e.touches?.[0]||e;
    if(document.elementsFromPoint&&Number.isFinite(p.clientX)&&Number.isFinite(p.clientY)){
      for(const el of document.elementsFromPoint(p.clientX,p.clientY)){
        const card=el?.closest?.('.card');if(card)return card;
      }
    }
    return null;
  }
  function destination(card){
    try{
      const href=card.getAttribute('href')||'detail.html';
      const u=new URL(href,location.href);
      const family=u.searchParams.get('family')||card.dataset.family;
      const smart=card.dataset.smartLook;
      if(family)u.searchParams.set('family',family);
      if(smart)u.searchParams.set('look',smart);
      return family?u.href:null;
    }catch(e){return null}
  }
  function go(e){
    if(navigating)return;
    const card=cardFromEvent(e);if(!card)return;
    if(e.target?.closest?.('button,input,select,textarea,.chip,.weather-btn'))return;
    const url=destination(card);if(!url)return;
    navigating=true;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();
    location.assign(url);
  }
  function normalize(){
    document.querySelectorAll('.grid .card').forEach(card=>{
      const href=card.getAttribute('href');if(!href)return;
      try{
        const u=new URL(href,location.href);
        const smart=card.dataset.smartLook;
        if(smart)u.searchParams.set('look',smart);
        card.setAttribute('href',u.pathname.split('/').pop()+u.search);
      }catch(e){}
    });
  }
  const root=document.getElementById('root')||document.body;
  new MutationObserver(()=>requestAnimationFrame(normalize)).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['data-smart-look','href']});
  document.addEventListener('touchend',go,true);
  document.addEventListener('click',go,true);
  normalize();
  const s=document.createElement('style');
  s.textContent='.card{cursor:pointer;pointer-events:auto!important;touch-action:manipulation}.card .ownership-pill,.card .readiness-pill,.card .variant-count,.card .tag{pointer-events:none!important}';
  document.head.appendChild(s);
})();
