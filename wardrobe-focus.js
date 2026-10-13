(()=>{
  const id=new URLSearchParams(location.search).get('piece');if(!id)return;
  function focus(){const card=document.querySelector(`[data-piece-id="${CSS.escape(id)}"]`);if(!card)return false;card.classList.add('ward-focus');card.scrollIntoView({behavior:'smooth',block:'center'});return true}
  if(focus())return;const observer=new MutationObserver(()=>{if(focus())observer.disconnect()});observer.observe(document.body,{childList:true,subtree:true});
})();
