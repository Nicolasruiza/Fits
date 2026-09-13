(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const safe=(k,f)=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):f}catch(e){return f}};
  const look=id=>D.looks.find(x=>x.id===id),piece=id=>D.pieces.find(x=>x.id===id),familyLooks=f=>(f.looks||[]).map(look).filter(Boolean);
  const daysSince=date=>{if(!date)return Infinity;const d=new Date(date+'T12:00:00');return Math.max(0,Math.floor((Date.now()-d.getTime())/86400000))};
  function state(){return{wardrobe:safe('fitsWardrobe',{}),wear:safe('fitsWearHistory',{}),saved:safe('fitsSavedVariants',{}),weather:safe('fitsWeatherHome',null)}}
  const owned=(id,s)=>s.wardrobe[id]==='owned',missing=(v,s)=>(v.pieces||[]).filter(id=>!owned(id,s));
  function weatherEval(v,w){if(!w)return{score:0,reason:'Weather will refine this recommendation.'};const names=(v.pieces||[]).map(id=>(piece(id)?.name||id).toLowerCase()).join(' '),t=Math.round(w.temp),rain=w.currentRain||w.maxRain>=40,outer=/blazer|jacket|vest|coat|sweater|cardigan|quarter[- ]?zip|turtleneck/.test(names),dress=/loafer|derbies|dress shoe|chelsea/.test(names),sneakers=/sneaker/.test(names);if(t>=25&&outer)return{score:-24,reason:'The extra layer may feel warm later.'};if(t<=12&&!outer)return{score:-20,reason:'You may want another layer.'};if(rain&&dress&&!sneakers)return{score:-16,reason:'The shoes are less practical if rain arrives.'};if(t>=22&&!outer)return{score:18,reason:'The lighter combination suits today.'};if(rain&&sneakers)return{score:10,reason:'The footwear is practical if rain arrives.'};return{score:7,reason:'The weather is flexible for this combination.'}}
  function variantScore(v,s){const m=missing(v,s),history=s.wear[v.id]||[],last=history.length?history[history.length-1]:null,days=daysSince(last),wx=weatherEval(v,s.weather);let score=wx.score;if(!m.length)score+=1000;else score+=Math.max(0,190-m.length*55);if(s.saved[v.id])score+=24;if(days===Infinity)score+=28;else if(days>=30)score+=22;else if(days>=14)score+=14;else if(days<=0)score-=45;else if(days<=3)score-=18;return{v,m,days,wx,score}}
  function bestForFamily(f,s){return familyLooks(f).map(v=>variantScore(v,s)).sort((a,b)=>b.score-a.score||(a.v.id===f.hero?-1:1))[0]}
  const todayKey=()=>new Date().toISOString().slice(0,10);
  function chosenEntry(ranked){
    if(!ranked.length)return null;
    const day=todayKey(),stored=safe('fitsDailyPick',null);
    const chosen=stored&&stored.date===day?ranked.find(entry=>entry.card.dataset.smartLook===stored.lookId):null;
    if(chosen)return chosen;
    const next=ranked[0];
    localStorage.setItem('fitsDailyPick',JSON.stringify({date:day,lookId:next.card.dataset.smartLook}));
    return next;
  }
  function renderDailyPick(ranked,s,hasWardrobe,head){
    const entry=chosenEntry(ranked);if(!entry)return;
    const v=look(entry.card.dataset.smartLook),fid=familyIdFromCard(entry.card);if(!v||!fid)return;
    const scored=variantScore(v,s),ready=!scored.m.length,worn=(s.wear[v.id]||[]).includes(todayKey());
    let panel=document.querySelector('.daily-pick');if(!panel){panel=document.createElement('section');panel.className='daily-pick';head.before(panel)}
    const stateText=!hasWardrobe?'Set your wardrobe to confirm this look':ready?(worn?'Logged for today':'Ready from your wardrobe'):`${scored.m.length} ${scored.m.length===1?'piece':'pieces'} away`;
    const action=!hasWardrobe?`<a class="daily-action primary" href="wardrobe.html">Set wardrobe</a>`:ready?`<button class="daily-action primary ${worn?'logged':''}" onclick="toggleHomeWear(event,'${v.id}')">${worn?'Worn today · undo':'I’ll wear this'}</button>`:`<a class="daily-action primary" href="detail.html?family=${encodeURIComponent(fid)}&look=${encodeURIComponent(v.id)}">Review pieces</a>`;
    panel.innerHTML=`<div class="daily-heading"><span>TODAY’S PICK</span><b>${stateText}</b></div><div class="daily-body"><a class="daily-photo" href="detail.html?family=${encodeURIComponent(fid)}&look=${encodeURIComponent(v.id)}"><img src="${v.image}" alt="${v.name}"></a><div class="daily-copy"><h2>${v.name}</h2><p>${scored.wx.reason}</p><div class="daily-actions">${action}<a class="daily-action secondary" href="detail.html?family=${encodeURIComponent(fid)}&look=${encodeURIComponent(v.id)}">Details</a></div></div></div>`;
  }
  window.toggleHomeWear=function(event,id){event?.preventDefault();event?.stopPropagation();const s=state(),dates=s.wear[id]||[],today=todayKey(),index=dates.indexOf(today);if(index>=0)dates.splice(index,1);else dates.push(today);s.wear[id]=dates.sort();localStorage.setItem('fitsWearHistory',JSON.stringify(s.wear));enhance()};
  function familyIdFromCard(card){try{return new URL(card.getAttribute('href'),location.href).searchParams.get('family')}catch(e){return null}}
  let scheduled=false,observer;const target=document.getElementById('root')||document.body;
  function enhance(){
    observer?.disconnect();
    const grid=document.querySelector('.grid');if(!grid){observe();return}
    const s=state(),hasWardrobe=Object.keys(s.wardrobe||{}).length>0,cards=[...grid.querySelectorAll('a.card')],ranked=[];let readyFamilies=0,savedFamilies=0;
    cards.forEach(card=>{const fid=familyIdFromCard(card),f=D.families.find(x=>x.id===fid);if(!f)return;const best=bestForFamily(f,s);if(!best)return;const ready=!best.m.length;if(ready)readyFamilies++;if(familyLooks(f).some(v=>s.saved[v.id]))savedFamilies++;card.dataset.smartLook=best.v.id;card.dataset.ready=ready?'yes':'no';card.dataset.smartScore=String(best.score);card.classList.toggle('is-ready',ready);const img=card.querySelector('.look-img');if(img&&best.v.image&&img.getAttribute('src')!==best.v.image){img.src=best.v.image;img.alt=best.v.name;img.style.display='block'}const p=card.querySelector('.body p');if(p){const text=hasWardrobe?(ready?`Ready now · ${best.wx.reason}`:`${best.m.length} ${best.m.length===1?'piece':'pieces'} away · ${best.wx.reason}`):best.wx.reason;if(p.textContent!==text)p.textContent=text}const visual=card.querySelector('.visual');if(visual){let pill=visual.querySelector('.readiness-pill');if(!pill){pill=document.createElement('span');visual.appendChild(pill)}pill.className=`readiness-pill ${ready?'ready':'need'}`;const t=hasWardrobe?(ready?'READY':`${best.m.length} TO GO`):'SET WARDROBE';if(pill.textContent!==t)pill.textContent=t}card.onclick=e=>{if(e.defaultPrevented)return;e.preventDefault();location.href=`detail.html?family=${encodeURIComponent(fid)}&look=${encodeURIComponent(best.v.id)}`};ranked.push({card,score:best.score})});
    const sorted=ranked.sort((a,b)=>b.score-a.score).map(x=>x.card),current=[...grid.querySelectorAll('a.card')];if(sorted.some((c,i)=>current[i]!==c))sorted.forEach(c=>grid.appendChild(c));const empty=grid.querySelector('.empty');if(empty&&grid.lastElementChild!==empty)grid.appendChild(empty);
    let head=document.querySelector('.smart-rotation-head');if(!head){head=document.createElement('div');head.className='smart-rotation-head';grid.before(head)}const html=hasWardrobe?`<div><span>SMART ROTATION</span><strong>${readyFamilies} ready ${readyFamilies===1?'family':'families'}</strong></div><small>Ready first · weather-aware · rotates what you haven’t worn lately${savedFamilies?` · ${savedFamilies} saved`:''}</small>`:`<div><span>SMART ROTATION</span><strong>Set your wardrobe</strong></div><small>Mark what you own and Fits will rank wearable combinations first.</small>`;if(head.innerHTML!==html)head.innerHTML=html;
    renderDailyPick(ranked,s,hasWardrobe,head);
    observe();
  }
  function observe(){observer?.observe(target,{childList:true,subtree:true})}
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhance()})}
  observer=new MutationObserver(schedule);observe();document.addEventListener('DOMContentLoaded',schedule);schedule();
})();
