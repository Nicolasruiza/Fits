(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const safe=(k,f)=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):f}catch(e){return f}};
  const look=id=>D.looks.find(x=>x.id===id),piece=id=>D.pieces.find(x=>x.id===id),familyLooks=f=>(f.looks||[]).map(look).filter(Boolean);
  const daysSince=date=>{if(!date)return Infinity;const d=new Date(date+'T12:00:00');return Math.max(0,Math.floor((Date.now()-d.getTime())/86400000))};
  function state(){
    const saved=safe('fitsSavedVariants',{}),hidden=new Set(safe('fitsHiddenLooks',[])),legacy=safe('fitsLookFeedback',{});let changed=false;
    Object.entries(legacy).forEach(([id,value])=>{if(value==='like'&&!saved[id]){saved[id]=true;changed=true}if(value==='dislike'&&!hidden.has(id)){hidden.add(id);changed=true}});
    if(changed){localStorage.setItem('fitsSavedVariants',JSON.stringify(saved));localStorage.setItem('fitsHiddenLooks',JSON.stringify([...hidden]))}
    return{wardrobe:safe('fitsWardrobe',{}),swaps:safe('fitsClosetSwaps',{}),wear:safe('fitsWearHistory',{}),saved,hidden,weather:safe('fitsWeatherHome',null)}
  }
  function filters(){
    const fromUI=typeof window.getFitsActiveFilters==='function'?window.getFitsActiveFilters():null;
    return fromUI||{occasion:localStorage.getItem('fitsOccasionFilter')||'All',season:localStorage.getItem('fitsSeasonFilter')||'All',recommendedSeason:typeof window.getFitsWeatherSeason==='function'?window.getFitsWeatherSeason():null};
  }
  const owned=(id,s)=>s.wardrobe[id]==='owned',missing=(v,s)=>window.FITS_SWAPS?FITS_SWAPS.missing(v,s.wardrobe,s.swaps):(v.pieces||[]).filter(id=>!owned(id,s)),adapted=(v,s)=>window.FITS_SWAPS?FITS_SWAPS.accepted(v,s.wardrobe,s.swaps).length:0;
  const namesFor=v=>(v.pieces||[]).map(id=>(piece(id)?.name||id).toLowerCase()).join(' ');
  function dominantColor(v){
    const ps=(v.pieces||[]).map(piece).filter(Boolean),outer=ps.find(p=>p.category==='Outerwear'),tops=ps.filter(p=>p.category==='Top');
    const visible=outer||tops.find(p=>/(sweater|crew[- ]?neck|v-neck|quarter[- ]?zip|turtleneck)/i.test(p.name))||tops[0],name=(visible?.name||'').toLowerCase();
    if(/navy|blue|indigo/.test(name))return'blue';if(/green|olive/.test(name))return'green';if(/burgundy|red/.test(name))return'red';if(/brown|cognac|camel/.test(name))return'brown';if(/cream|beige|white|stone|tan/.test(name))return'light';if(/grey|gray|charcoal|black/.test(name))return'dark';return'other';
  }
  function colorBalanced(entries){
    const output=[];let last=null;
    [0,1,2].forEach(tier=>{const pool=entries.filter(x=>x.tier===tier);while(pool.length){let index=pool.findIndex(x=>x.color!==last);if(index<0)index=0;const [next]=pool.splice(index,1);output.push(next);last=next.color}});
    return output;
  }
  function matchesFilters(v,f,s){
    const badges=v.badges||[],seasons=v.seasons||['Summer'];
    const isHidden=s.hidden.has(v.id);
    const occasionMatch=f.occasion==='Hidden'?isHidden:!isHidden&&(f.occasion==='All'||f.occasion==='Favorites'&&!!s.saved[v.id]||badges.includes(f.occasion));
    return occasionMatch&&(f.season==='All'||seasons.includes(f.season));
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
    const names=namesFor(v),t=Math.round(w.temp),high=Number.isFinite(w.maxTemp)?Math.round(w.maxTemp):t,rain=w.currentRain||w.maxRain>=40,outer=/blazer|jacket|vest|coat|overshirt|bomber|sweater|cardigan|quarter[- ]?zip|turtleneck/.test(names),outerPiece=(v.pieces||[]).map(piece).find(p=>/blazer|jacket|coat|overshirt|bomber/i.test(p?.name||'')),dress=/loafer|derbies|dress shoe|chelsea/.test(names),sneakers=/sneaker/.test(names),winterCold=high<=7||(t<=4&&high<=13);
    if(t>=25&&outer)return{score:-24,reason:'The extra layer may feel warm later.'};
    if(t<=12&&outerPiece)return{score:12,reason:`The ${outerPiece.name.toLowerCase()} already provides the outer layer.`};
    if(winterCold&&v.winterLayerable){const coat=window.FITS_WINTER_LAYERS?.selected(v)||window.FITS_WINTER_LAYERS?.ownedCoats()[0];return{score:coat?12:2,reason:coat?`Add your ${coat.name.toLowerCase()} for winter weather.`:'Add an overcoat to make this winter-ready.'}}
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
    const autoSeason=activeFilters.season==='All',recommended=activeFilters.recommendedSeason||null;
    const candidates=familyLooks(f).filter(v=>matchesFilters(v,{...activeFilters,season:autoSeason?'All':activeFilters.season},s));
    if(!candidates.length)return null;
    return candidates.map(v=>{const result=variantScore(v,s);if(autoSeason&&recommended&&(v.seasons||[]).includes(recommended))result.score+=35;return result}).sort((a,b)=>b.score-a.score||(a.v.id===f.hero?-1:1))[0];
  }
  function familyIdFromCard(card){try{return new URL(card.getAttribute('href'),location.href).searchParams.get('family')||card.dataset.family||null}catch(e){return card.dataset.family||null}}
  function setCardDestination(card,fid,lookId){
    if(!fid)return;
    card.dataset.family=fid;
    const href=lookId?`detail.html?family=${encodeURIComponent(fid)}&look=${encodeURIComponent(lookId)}`:`detail.html?family=${encodeURIComponent(fid)}`;
    if(card.getAttribute('href')!==href)card.setAttribute('href',href);
    card.onclick=null;
  }
  function ensureStyle(){
    if(document.getElementById('fits-smart-filter-style'))return;
    const style=document.createElement('style');style.id='fits-smart-filter-style';style.textContent='.card.smart-hidden{display:none!important}';document.head.appendChild(style);
  }
  function enhance(){
    ensureStyle();
    const grid=document.querySelector('.grid');if(!grid)return;
    grid.querySelectorAll('.thermal-duplicate').forEach(card=>card.remove());
    grid.querySelectorAll('.look-group').forEach(group=>{group.querySelectorAll('a.card').forEach(card=>grid.appendChild(card));group.remove()});
    const s=state(),activeFilters=filters(),hasWardrobe=Object.keys(s.wardrobe||{}).length>0,cards=[...grid.querySelectorAll('a.card')],ranked=[];
    cards.forEach(card=>{
      const fid=familyIdFromCard(card),f=D.families.find(x=>x.id===fid);if(!f)return;
      const familySaved=familyLooks(f).some(v=>s.saved[v.id]);card.dataset.saved=familySaved?'yes':'no';
      const familyHidden=familyLooks(f).some(v=>s.hidden.has(v.id));card.dataset.hidden=familyHidden?'yes':'no';
      const best=bestForFamily(f,s,activeFilters);
      card.classList.toggle('smart-hidden',!best);
      if(!best){
        delete card.dataset.smartLook;delete card.dataset.smartScore;delete card.dataset.ready;
        card.classList.remove('is-ready');setCardDestination(card,fid,null);return;
      }
      const ready=!best.m.length;
      card.dataset.smartLook=best.v.id;card.dataset.ready=ready?'yes':'no';card.dataset.smartScore=String(best.score);card.classList.toggle('is-ready',ready);
      setCardDestination(card,fid,best.v.id);
      const img=card.querySelector('.look-img');if(img&&best.v.image&&img.getAttribute('src')!==best.v.image){img.src=best.v.image;img.alt=best.v.name;img.style.display='block'}
      const p=card.querySelector('.body p');if(p){const text=hasWardrobe?(ready?`Ready now · ${best.wx.reason}`:`${best.m.length} ${best.m.length===1?'piece':'pieces'} away · ${best.wx.reason}`):best.wx.reason;if(p.textContent!==text)p.textContent=text}
      const visual=card.querySelector('.visual');if(visual){let pill=visual.querySelector('.readiness-pill');if(!pill){pill=document.createElement('span');pill.className='readiness-pill';visual.appendChild(pill)}const swapCount=adapted(best.v,s),cls=`readiness-pill ${ready?'ready':'need'}`,text=hasWardrobe?(ready?(swapCount?`ADAPTED · ${swapCount}`:'READY'):`${best.m.length} TO GO`):'SET WARDROBE';if(pill.className!==cls)pill.className=cls;if(pill.textContent!==text)pill.textContent=text}
      const tier=Math.min(2,best.m.length),color=dominantColor(best.v);card.dataset.dominantColor=color;
      ranked.push({card,score:best.score,tier,color});
    });
    ranked.sort((a,b)=>a.tier-b.tier||b.score-a.score);
    const balanced=colorBalanced(ranked);ranked.splice(0,ranked.length,...balanced);
    const manualSeason=activeFilters.season!=='All',recommended=activeFilters.recommendedSeason||'Transitional';
    const order=manualSeason?[activeFilters.season]:[recommended,...['Summer','Transitional','Cold'].filter(x=>x!==recommended)];
    const assigned=new Set();
    order.forEach(season=>{
      const entries=colorBalanced(ranked.filter(x=>!assigned.has(x.card)&&((x.card.dataset.seasons||'Summer').split(',').includes(season))));
      if(!entries.length)return;
      const current=manualSeason||season===recommended,group=document.createElement('section');
      group.className=`look-group ${current?'recommended':'compact'}`;
      group.dataset.season=season;
      group.innerHTML=`<div class="look-group-title"><strong>${manualSeason?season:`${season}${current?' · recommended now':''}`}</strong><span>${entries.length} ${entries.length===1?'look':'looks'}</span></div><div class="look-group-rail"></div>${current?'':`<button class="look-group-more" type="button" onclick="toggleSeasonGroup(this)">See more ${season.toLowerCase()} looks</button>`}`;
      grid.appendChild(group);const rail=group.querySelector('.look-group-rail');
      entries.forEach(x=>{assigned.add(x.card);rail.appendChild(x.card)});
    });
    /* Keep every card inside a season rail. Hidden/filter-mismatched cards stay hidden,
       but never fall through as orphan tiles below the accordion. */
    cards.filter(card=>!assigned.has(card)).forEach(card=>{
      const preferred=(card.dataset.seasons||'Transitional').split(',').find(x=>order.includes(x))||'Transitional';
      let group=[...grid.querySelectorAll('.look-group')].find(x=>x.dataset.season===preferred);
      if(!group){
        group=document.createElement('section');group.className='look-group compact';group.dataset.season=preferred;
        group.innerHTML=`<div class="look-group-title"><strong>${preferred}</strong><span>0 looks</span></div><div class="look-group-rail"></div>`;
        grid.appendChild(group);
      }
      group.querySelector('.look-group-rail').appendChild(card);
    });
    const empty=grid.querySelector('.empty');
    if(empty){if(grid.lastElementChild!==empty)grid.appendChild(empty);const visible=ranked.filter(x=>!x.card.classList.contains('hidden')&&!x.card.classList.contains('smart-hidden')).length;empty.style.display=visible?'none':'block';if(!visible)empty.textContent='No looks match the current weather and filters.'}
    document.querySelector('.smart-rotation-head')?.remove();
    document.querySelector('.daily-pick')?.remove();
    window.dispatchEvent(new CustomEvent('fits:home-enhanced'));
  }
  window.toggleSeasonGroup=function(button){const group=button.closest('.look-group');if(!group)return;const expanded=group.classList.toggle('expanded');button.textContent=expanded?'Show less':`See more ${group.dataset.season.toLowerCase()} looks`};
  let scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhance()})}
  const previousRender=window.render;
  if(typeof previousRender==='function'){
    const wrapped=function(...args){const out=previousRender.apply(this,args);schedule();return out};
    wrapped.__fitsSmartHomeStable=true;
    window.render=wrapped;
  }
  window.addEventListener('fits:filters-changed',schedule);
  window.addEventListener('storage',e=>{if(['fitsOccasionFilter','fitsSeasonFilter','fitsWeatherHome','fitsWardrobe','fitsClosetSwaps','fitsWearHistory','fitsSavedVariants','fitsHiddenLooks','fitsLookFeedback'].includes(e.key))schedule()});
  document.addEventListener('DOMContentLoaded',schedule);
  schedule();
})();
