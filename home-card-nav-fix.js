(()=>{
  function getCard(target){return target?.closest?.('a.card')||null}
  function destination(card){
    const href=card.getAttribute('href');
    if(!href)return null;
    try{
      const u=new URL(href,location.href);
      const smart=card.dataset.smartLook;
      if(smart&&!u.searchParams.get('look'))u.searchParams.set('look',smart);
      return u.href;
    }catch(e){return href}
  }
  function go(e){
    const card=getCard(e.target);if(!card)return;
    if(e.target.closest('button,input,select,textarea'))return;
    const url=destination(card);if(!url)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    location.href=url;
  }
  document.addEventListener('click',go,true);
  const s=document.createElement('style');
  s.textContent='.card{cursor:pointer;pointer-events:auto!important}.card .ownership-pill,.card .readiness-pill,.card .variant-count,.card .tag{pointer-events:none!important}';
  document.head.appendChild(s);
})();
