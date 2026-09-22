(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const safe=(k,f)=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):f}catch(e){return f}};
  const look=id=>D.looks.find(x=>x.id===id),piece=id=>D.pieces.find(x=>x.id===id),familyLooks=f=>(f.looks||[]).map(look).filter(Boolean);
  const daysSince=date=>{if(!date)return Infinity;const d=new Date(date+'T12:00:00');return Math.max(0,Math.floor((Date.now()-d.getTime())/86400000))};
  function state(){return{wardrobe:safe('fitsWardrobe',{}),wear:safe('fitsWearHistory',{}),saved:safe('fitsSavedVariants',{}),weather:safe('fitsWeatherHome',null)}}
  function filters(){
    const fromUI=typeof window.getFitsActiveFilters==='function'?window.getFitsActiveFilters():null;
    return fromUI||{occasion:localStorage.getItem('fitsOccasionFilter')||'All',season:localStorage.getItem('fitsSeasonFilter')||'All'};
  }
  const owned=(id,s)=>s.wardrobe[id]==='owned',missing=(v,s)=>(v.pieces||[]).filter(id=>!owned(id,s));
  const namesFor=v=>(v.pieces||[]).map(id=>(piece(id)?.name||id).toLowerCase()).join(' ');
  function matchesFilters(v,f){
    const badges=v.badges||[],seasons=v.seasons||['Summer'];
    return(f.occasion==='All'||badges.includes(f.occasion))&&(f.season==='All'||seasons.includes(f.season));
  }
  function weatherEligible(v,w){
    if(!w)return true;
    const seasons=v.seasons||['Summer'],names=namesFor(v),high=Number.isFinite(w.maxTemp)?w.maxTemp:w.temp,t=Number.isFinite(w.temp)?w.temp:high;
    const heavy=/overcoat|heavy sweater|turtleneck/.test(names),outer=/blazer|jacket|vest|coat|sweater|cardigan|quarter[- ]?zip|turtleneck/.test(names);
    if(high>=18&&!seasons.includes('Summer')&&!seasons.includes('Transitional'))return false;
    if(high<18&&!seasons.includes('Transitional')&&!seasons.includes('Cold'))return false;
    if(high>=24&&heavy)return false;
    if(t>=27&&outer)return false;
    if(high<=12&&!outer&&seasons.includes('Summer')&&!seasons.includes('Transitional'))return false;
    return true;
  }
  function weatherEval(v,w){
    if(!w)return{score:0,reason:'Weather will refine this recommendation.'};
    const names=namesFor(v),t=Math.round(w.temp),rain=w.currentRain||w.maxRain>=40,outer=/blazer|jacket|vest|coat|sweater|cardigan|quarter[- ]?zip|turtleneck/.test(names),dress=/loafer|derbies|dress shoe|chelsea/.test(names),sneakers=/sneaker/.test(names);
    if(t>=25&&outer)return{score:-24,reason:'The extra layer may feel warm later.'};
    if(t<=12&&!outer)return{score:-20,reason:'You may want another layer.'};
    if(rain&&dress&&!sneakers)return{score:-16,reason:'The shoes are less practical if rain arrives.'};
    if(t>=22&&!outer)return{score:18,reason:'The lighter combination suits today.'};
    if(rain&&sneakers)return{score:10,reason:'The footwear is practical if rain arrives.'};
    return{score:7,reason:'The weather is flexible for this combination.'};
  }
  function variantScore(v,s){
    const m=missing(v,s),history=s.wear[v.id]||[],last=history.length?history[history.length-1]:null,days=daysSince(last),wx=weatherEval(v,s.weather);let score=wx.score;
    if(!m.length)score+=1000;else score+=Math.max(0,190-m.length*55);
    if(s.saved[v.id])score+=24;
    if(days===Infinity)score+=28;else if(days>=30)score+=22;else if(days>=14)score+=14;else if(days<=0)score-=45;else if(days<=3)score-=18;
    return{v,m,days,wx,score};
  }
  function bestForFamily(f,s,activeFilters){
    const candidates=familyLooks(f).filter(v=>matchesFilters(v,activeFilters)&&weatherEligible(v,s.weather));
    if(!candidates.length)return null;
    return candidates.map(v=>variantScore(v,s)).sort((a,b)=>b.score-a.score||(a.v.id===f.hero?-1:1))[0];
  }
  const todayKey=()=>{
    const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  };
  function chosenEntry(ranked){
    if(!ranked.length)return null;
    const day=todayKey(),stored=safe('fitsDailyPick',null);
    const chosen=stored&&stored.date===day?ranked.find(entry=>entry.card.dataset.smartLook===stored.lookId):null;
    if(chosen)return chosen;
    const next=ranked[0];
    localStorage.setItem('fitsDailyPick',JSON.stringify({date:day,lookId:next.card.dataset.smartLook}));
    return next;
  }
  function familyIdFromCard(card){try{return new URL(card.getAttribute('href'),location.href).searchParams.get('family')||card.dataset.family||null}catch(e){return card.dataset.family||null}}
  function setCardDestination(card,fid,lookId){
    if(!fid)return;
    card.dataset.family=fid;
    const href=lookId?`detail.html?family=${encodeURIComponent(fid)}&look=${encodeURIComponent(lookId)}`:`detail.html?family=${encodeURIComponent(fid)}`;
    if(card.getAttribute('href')!==href)card.setAttribute('href',href);
    card.onclick=null;
  }
  function renderDailyPick(ranked,s,hasWardrobe,head){
    const entry=chosenEntry(ranked),existing=document.querySelector('.daily-pick');
    if(!entry){existing?.remove();return}
    const v=look(entry.card.dataset.smartLook),fid=familyIdFromCard(entry.card);if(!v||!fid){existing?.remove();return}
    const scored=variantScore(v,s),ready=!scored.m.length,worn=(s.wear[v.id]||[]).includes(todayKey());
    let panel=existing;if(!panel){panel=document.createElement('section');panel.className='daily-pick';head.before(panel)}
    const stateText=!hasWardrobe?'Set your wardrobe to confirm this look':ready?(worn?'Logged for today':'Ready from your wardrobe'):`${scored.m.length} ${scored.m.length===1?'piece':'pieces'} away`;
    const action=!hasWardrobe?`<a class="daily-action primary" href="wardrobe.html">Set wardrobe</a>`:ready?`<button class="daily-action primary ${worn?'logged':''}" onclick="toggleHomeWear(event,'${v.id}')">${worn?'Worn today · undo':'I’ll wear this'}</button>`:`<a class="daily-action primary" href="detail.html?family=${encodeURIComponent(fid)}&look=${encodeURIComponent(v.id)}">Review pieces</a>`;
    panel.innerHTML=`<div class="daily-heading"><span>TODAY’S PICK</span><b>${stateText}</b></div><div class="daily-body"><a class="daily-photo" href="detail.html?family=${encodeURIComponent(fid)}&look=${encodeURIComponent(v.id)}"><img src="${v.image}" alt="${v.name}"></a><div class="daily-copy"><h2>${v.name}</h2><p>${scored.wx.reason}</p><div class="daily-actions">${action}<a class="daily-action secondary" href="detail.html?family=${encodeURIComponent(fid)}&look=${encodeURIComponent(v.id)}">Details</a></div></div></div>`;
  }
  window.toggleHomeWear=function(event,id){
    event?.preventDefault();event?.stopPropagation();
    const s=state(),dates=s.wear[id]||[],today=todayKey(),index=dates.indexOf(today);
    if(index>=0)dates.splice(index,1);else dates.push(today);
    s.wear[id]=dates.sort();localStorage.setItem('fitsWearHistory',JSON.stringify(s.wear));schedule();
  };
  function ensureStyle(){
    if(document.getElementById('fits-smart-filter-style'))return;
    const style=document.createElement('style');style.id='fits-smart-filter-style';style.textContent='.card.smart-hidden{display:none!important}';document.head.appendChild(style);
  }
  function enhance(){
    ensureStyle();
    const grid=document.querySelector('.grid');if(!grid)return;
    const s=state(),activeFilters=filters(),hasWardrobe=Object.keys(s.wardrobe||{}).length>0,cards=[...grid.querySelectorAll('a.card')],ranked=[];let readyFamilies=0,savedFamilies=0;
    cards.forEach(card=>{
      const fid=familyIdFromCard(card),f=D.families.find(x=>x.id===fid);if(!f)return;
      const best=bestForFamily(f,s,activeFilters);
      card.classList.toggle('smart-hidden',!best);
      if(!best){
        delete card.dataset.smartLook;delete card.dataset.smartScore;delete card.dataset.ready;
        card.classList.remove('is-ready');setCardDestination(card,fid,null);return;
      }
      const ready=!best.m.length;if(ready)readyFamilies++;
      if(familyLooks(f).some(v=>s.saved[v.id]))savedFamilies++;
      card.dataset.smartLook=best.v.id;card.dataset.ready=ready?'yes':'no';card.dataset.smartScore=String(best.score);card.classList.toggle('is-ready',ready);
      setCardDestination(card,fid,best.v.id);
      const img=card.querySelector('.look-img');if(img&&best.v.image&&img.getAttribute('src')!==best.v.image){img.src=best.v.image;img.alt=best.v.name;img.style.display='block'}
      const p=card.querySelector('.body p');if(p){const text=hasWardrobe?(ready?`Ready now · ${best.wx.reason}`:`${best.m.length} ${best.m.length===1?'piece':'pieces'} away · ${best.wx.reason}`):best.wx.reason;if(p.textContent!==text)p.textContent=text}
      const visual=card.querySelector('.visual');if(visual){let pill=visual.querySelector('.readiness-pill');if(!pill){pill=document.createElement('span');pill.className='readiness-pill';visual.appendChild(pill)}const cls=`readiness-pill ${ready?'ready':'need'}`,text=hasWardrobe?(ready?'READY':`${best.m.length} TO GO`):'SET WARDROBE';if(pill.className!==cls)pill.className=cls;if(pill.textContent!==text)pill.textContent=text}
      ranked.push({card,score:best.score});
    });
    ranked.sort((a,b)=>b.score-a.score).forEach(x=>grid.appendChild(x.card));
    const empty=grid.querySelector('.empty');
    if(empty){if(grid.lastElementChild!==empty)grid.appendChild(empty);const visible=ranked.filter(x=>!x.card.classList.contains('hidden')&&!x.card.classList.contains('smart-hidden')).length;empty.style.display=visible?'none':'block';if(!visible)empty.textContent='No looks match the current weather and filters.'}
    let head=document.querySelector('.smart-rotation-head');if(!head){head=document.createElement('div');head.className='smart-rotation-head';grid.before(head)}
    const filterText=[activeFilters.occasion!=='All'?activeFilters.occasion:null,activeFilters.season!=='All'?activeFilters.season:null].filter(Boolean).join(' · ');
    const html=hasWardrobe?`<div><span>SMART ROTATION</span><strong>${readyFamilies} ready ${readyFamilies===1?'family':'families'}</strong></div><small>${filterText?filterText+' · ':''}weather-matched first · rotates what you haven’t worn lately${savedFamilies?` · ${savedFamilies} saved`:''}</small>`:`<div><span>SMART ROTATION</span><strong>Set your wardrobe</strong></div><small>${filterText?filterText+' · ':''}weather and filters narrow the list first.</small>`;
    if(head.innerHTML!==html)head.innerHTML=html;
    const visibleRanked=ranked.filter(x=>!x.card.classList.contains('hidden')&&!x.card.classList.contains('smart-hidden'));
    renderDailyPick(visibleRanked,s,hasWardrobe,head);
    window.dispatchEvent(new CustomEvent('fits:home-enhanced'));
  }
  let scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhance()})}
  const previousRender=window.render;
  if(typeof previousRender==='function'){
    const wrapped=function(...args){const out=previousRender.apply(this,args);schedule();return out};
    wrapped.__fitsSmartHomeStable=true;
    window.render=wrapped;
  }
  window.addEventListener('fits:filters-changed',schedule);
  window.addEventListener('storage',e=>{if(['fitsOccasionFilter','fitsSeasonFilter','fitsWeatherHome','fitsWardrobe','fitsWearHistory','fitsSavedVariants'].includes(e.key))schedule()});
  document.addEventListener('DOMContentLoaded',schedule);
  schedule();
})();
