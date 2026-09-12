(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const safe=(k,f)=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):f}catch(e){return f}};
  const look=id=>D.looks.find(x=>x.id===id),piece=id=>D.pieces.find(x=>x.id===id);
  const familyLooks=f=>(f.looks||[]).map(look).filter(Boolean);
  const daysSince=date=>{if(!date)return Infinity;const d=new Date(date+'T12:00:00');return Math.max(0,Math.floor((Date.now()-d.getTime())/86400000))};
  function state(){return{wardrobe:safe('fitsWardrobe',{}),wear:safe('fitsWearHistory',{}),saved:safe('fitsSavedVariants',{}),weather:safe('fitsWeatherHome',null)}}
  function owned(id,s){return s.wardrobe[id]==='owned'}
  function missing(v,s){return(v.pieces||[]).filter(id=>!owned(id,s))}
  function weatherEval(v,w){
    if(!w)return{score:0,label:'Weather pending',reason:'Weather will refine this recommendation.'};
    const names=(v.pieces||[]).map(id=>(piece(id)?.name||id).toLowerCase()).join(' '),t=Math.round(w.temp),rain=w.currentRain||w.maxRain>=40;
    const outer=/blazer|jacket|vest|coat|sweater|cardigan|quarter[- ]?zip|turtleneck/.test(names),dress=/loafer|derbies|dress shoe|chelsea/.test(names),sneakers=/sneaker/.test(names);
    if(t>=25&&outer)return{score:-24,label:'Warm for layers',reason:'The extra layer may feel warm later.'};
    if(t<=12&&!outer)return{score:-20,label:'Light for today',reason:'You may want another layer.'};
    if(rain&&dress&&!sneakers)return{score:-16,label:'Rain note',reason:'The shoes are less practical if rain arrives.'};
    if(t>=22&&!outer)return{score:18,label:'Great today',reason:'The lighter combination suits today.'};
    if(rain&&sneakers)return{score:10,label:'Good today',reason:'The footwear is practical if rain arrives.'};
    return{score:7,label:'Good option',reason:'The weather is flexible for this combination.'};
  }
  function variantScore(v,s){
    const m=missing(v,s),history=s.wear[v.id]||[],last=history.length?history[history.length-1]:null,days=daysSince(last),wx=weatherEval(v,s.weather);
    let score=wx.score;
    if(!m.length)score+=1000;else score+=Math.max(0,190-m.length*55);
    if(s.saved[v.id])score+=24;
    if(days===Infinity)score+=28;else if(days>=30)score+=22;else if(days>=14)score+=14;else if(days<=0)score-=45;else if(days<=3)score-=18;
    return{v,m,days,wx,score};
  }
  function bestForFamily(f,s){return familyLooks(f).map(v=>variantScore(v,s)).sort((a,b)=>b.score-a.score||(a.v.id===f.hero?-1:1))[0]}
  function familyIdFromCard(card){try{return new URL(card.getAttribute('href'),location.href).searchParams.get('family')}catch(e){return null}}
  let applying=false,scheduled=false;
  function enhance(){
    if(applying)return;applying=true;
    const grid=document.querySelector('.grid');if(!grid){applying=false;return}
    const s=state(),hasWardrobe=Object.keys(s.wardrobe||{}).length>0,cards=[...grid.querySelectorAll('a.card')],ranked=[];
    let readyFamilies=0,savedFamilies=0;
    cards.forEach(card=>{
      const fid=familyIdFromCard(card),f=D.families.find(x=>x.id===fid);if(!f)return;
      const best=bestForFamily(f,s);if(!best)return;
      const ready=!best.m.length;if(ready)readyFamilies++;
      if(familyLooks(f).some(v=>s.saved[v.id]))savedFamilies++;
      card.dataset.smartLook=best.v.id;card.dataset.ready=ready?'yes':'no';card.dataset.smartScore=String(best.score);
      card.classList.toggle('is-ready',ready);
      const img=card.querySelector('.look-img');if(img&&best.v.image&&img.getAttribute('src')!==best.v.image){img.src=best.v.image;img.alt=best.v.name;img.style.display='block'}
      const body=card.querySelector('.body'),p=body?.querySelector('p');
      if(p)p.textContent=hasWardrobe?(ready?`Ready now · ${best.wx.reason}`:`${best.m.length} ${best.m.length===1?'piece':'pieces'} away · ${best.wx.reason}`):best.wx.reason;
      const visual=card.querySelector('.visual');if(visual){let pill=visual.querySelector('.readiness-pill');if(!pill){pill=document.createElement('span');pill.className='readiness-pill';visual.appendChild(pill)}pill.className=`readiness-pill ${ready?'ready':'need'}`;pill.textContent=hasWardrobe?(ready?'READY':`${best.m.length} TO GO`):'SET WARDROBE'}
      card.onclick=e=>{if(e.defaultPrevented)return;e.preventDefault();location.href=`detail.html?family=${encodeURIComponent(fid)}&look=${encodeURIComponent(best.v.id)}`};
      ranked.push({card,score:best.score});
    });
    ranked.sort((a,b)=>b.score-a.score).forEach(x=>grid.appendChild(x.card));
    const empty=grid.querySelector('.empty');if(empty)grid.appendChild(empty);
    let head=document.querySelector('.smart-rotation-head');
    if(!head){head=document.createElement('div');head.className='smart-rotation-head';grid.before(head)}
    head.innerHTML=hasWardrobe?`<div><span>SMART ROTATION</span><strong>${readyFamilies} ready ${readyFamilies===1?'family':'families'}</strong></div><small>Ready first · weather-aware · rotates what you haven’t worn lately${savedFamilies?` · ${savedFamilies} saved`:''}</small>`:`<div><span>SMART ROTATION</span><strong>Set your wardrobe</strong></div><small>Mark what you own and Fits will rank wearable combinations first.</small>`;
    applying=false;
  }
  function schedule(){if(scheduled||applying)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhance()})}
  new MutationObserver(schedule).observe(document.getElementById('root')||document.body,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',schedule);schedule();
})();