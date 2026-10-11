(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const KEY='fitsLookSequence',q=new URLSearchParams(location.search);
  const currentFamily=q.get('family')||(D.looks||[]).find(l=>l.id===q.get('look'))?.family;
  const look=id=>(D.looks||[]).find(l=>l.id===id);
  function filteredFallback(){
    const occasion=localStorage.getItem('fitsOccasionFilter')||'All',season=localStorage.getItem('fitsSeasonFilter')||'All';
    return(D.families||[]).filter(f=>{
      const variants=(f.looks||[]).map(look).filter(Boolean);
      return(occasion==='All'||variants.some(v=>(v.badges||[]).includes(occasion)))&&
        (season==='All'||variants.some(v=>(v.seasons||['Summer']).includes(season)));
    }).map(f=>f.id);
  }
  function sequence(){
    try{
      const saved=JSON.parse(sessionStorage.getItem(KEY)||'null');
      if(saved&&Array.isArray(saved.families)&&saved.families.includes(currentFamily))return saved.families;
    }catch(_){}
    return filteredFallback();
  }
  const ids=sequence(),index=ids.indexOf(currentFamily),previous=index>0?ids[index-1]:null,next=index>=0&&index<ids.length-1?ids[index+1]:null;
  const destination=id=>{
    const f=(D.families||[]).find(x=>x.id===id);if(!f)return null;
    const hero=look(f.hero)||(f.looks||[]).map(look).find(Boolean);
    return`detail.html?family=${encodeURIComponent(id)}${hero?`&look=${encodeURIComponent(hero.id)}`:''}`;
  };
  function go(id,direction){
    const url=destination(id);if(!url)return;
    document.documentElement.dataset.swipeExit=direction;
    setTimeout(()=>location.assign(url),130);
  }
  function enhance(){
    const hero=document.querySelector('.hero');if(!hero||document.querySelector('.look-swipe-nav'))return;
    hero.classList.add('swipe-surface');
    const nav=document.createElement('div');nav.className='look-swipe-nav';
    nav.innerHTML=`<button type="button" class="swipe-prev" ${previous?'':'disabled'} aria-label="Previous look">‹<span>Previous</span></button><small>${index>=0?`${index+1} of ${ids.length}`:'Swipe between looks'}</small><button type="button" class="swipe-next" ${next?'':'disabled'} aria-label="Next look"><span>Next</span>›</button>`;
    hero.after(nav);
    nav.querySelector('.swipe-prev').onclick=()=>go(previous,'right');
    nav.querySelector('.swipe-next').onclick=()=>go(next,'left');
    let startX=0,startY=0,tracking=false;
    hero.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;startX=e.touches[0].clientX;startY=e.touches[0].clientY;tracking=true;hero.classList.add('is-touching')},{passive:true});
    hero.addEventListener('touchmove',e=>{if(!tracking)return;const dx=e.touches[0].clientX-startX,dy=e.touches[0].clientY-startY;if(Math.abs(dx)>Math.abs(dy)+8){e.preventDefault();hero.style.setProperty('--swipe-x',`${Math.max(-90,Math.min(90,dx))}px`) }},{passive:false});
    hero.addEventListener('touchend',e=>{if(!tracking)return;tracking=false;const t=e.changedTouches[0],dx=t.clientX-startX,dy=t.clientY-startY;hero.classList.remove('is-touching');hero.style.removeProperty('--swipe-x');if(Math.abs(dx)>=58&&Math.abs(dx)>Math.abs(dy)*1.25){if(dx<0&&next)go(next,'left');else if(dx>0&&previous)go(previous,'right')}});
  }
  document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'&&previous)go(previous,'right');if(e.key==='ArrowRight'&&next)go(next,'left')});
  new MutationObserver(()=>requestAnimationFrame(enhance)).observe(document.getElementById('root')||document.body,{childList:true,subtree:false});
  enhance();
})();
