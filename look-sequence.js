(()=>{
  const KEY='fitsLookSequence';
  const familyId=card=>{try{return new URL(card.getAttribute('href'),location.href).searchParams.get('family')}catch(_){return null}};
  function snapshot(){
    const cards=[...document.querySelectorAll('.grid a.card')].filter(card=>!card.classList.contains('hidden')&&getComputedStyle(card).display!=='none');
    const families=cards.map(familyId).filter(Boolean);
    if(!families.length)return;
    const context={
      families,
      occasion:localStorage.getItem('fitsOccasionFilter')||'All',
      season:localStorage.getItem('fitsSeasonFilter')||'All',
      savedAt:Date.now()
    };
    sessionStorage.setItem(KEY,JSON.stringify(context));
  }
  let queued=false;
  const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;snapshot()})};
  document.addEventListener('click',event=>{
    const card=event.target.closest?.('.grid a.card');
    if(card)snapshot();
  },true);
  window.addEventListener('fits:filters-changed',schedule);
  new MutationObserver(schedule).observe(document.getElementById('root')||document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('DOMContentLoaded',schedule);
  schedule();
})();
