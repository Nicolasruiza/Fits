(()=>{
  const DATA=window.FITS_DATA;
  if(!DATA)return;
  const safe=(key,fallback)=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch(e){return fallback}};
  const look=id=>DATA.looks.find(item=>item.id===id);
  const family=id=>DATA.families.find(item=>item.id===id);
  const wardrobe=safe('fitsWardrobe',{});
  const saved=safe('fitsSavedVariants',{});
  let wear=safe('fitsWearHistory',{});
  const validIds=new Set(DATA.looks.map(item=>item.id));

  function history(){
    return Object.entries(wear).flatMap(([lookId,dates])=>validIds.has(lookId)&&Array.isArray(dates)?[...new Set(dates)].filter(date=>/^\d{4}-\d{2}-\d{2}$/.test(date)).map(date=>({lookId,date})):[]).sort((a,b)=>b.date.localeCompare(a.date));
  }
  function dateAtNoon(key){return new Date(`${key}T12:00:00`)}
  function dateKey(date){const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');return`${y}-${m}-${d}`}
  function readableDate(key){return dateAtNoon(key).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}
  function monthLabel(){return new Date().toLocaleDateString(undefined,{month:'long',year:'numeric'})}
  function shortName(item){const f=family(item.family);return f?f.name.replace(' chinos','').replace(' polo',''):item.name}
  function detailHref(item){return`detail.html?family=${encodeURIComponent(item.family)}&look=${encodeURIComponent(item.id)}`}
  function isReady(item){return Object.keys(wardrobe).length>0&&item.pieces.every(id=>wardrobe[id]==='owned')}
  function lastDate(item){const dates=(wear[item.id]||[]).slice().sort();return dates[dates.length-1]||''}
  function totalFor(item,records){return records.filter(record=>record.lookId===item.id).length}

  function weekData(records){
    const days=[];
    for(let offset=6;offset>=0;offset--){const date=new Date();date.setHours(12,0,0,0);date.setDate(date.getDate()-offset);const key=dateKey(date);days.push({key,label:date.toLocaleDateString(undefined,{weekday:'narrow'}),count:records.filter(record=>record.date===key).length})}
    return days;
  }
  function insight(records,monthRecords){
    if(!records.length)return{eyebrow:'START HERE',title:'Your rotation starts with one tap',text:'Open a look and tap “I’ll wear this.” Fits will build your real pattern from there.',href:'index.html',cta:'Choose a look'};
    const monthCounts=DATA.looks.map(item=>({item,count:totalFor(item,monthRecords)})).sort((a,b)=>b.count-a.count);
    const repeated=monthCounts.find(entry=>entry.count>1);
    if(repeated)return{eyebrow:'ROTATION NOTE',title:`${shortName(repeated.item)} is leading this month`,text:`You’ve worn this exact variant ${repeated.count} times. Try a ready look that hasn’t had a turn yet.`,href:detailHref(repeated.item),cta:'Review the look'};
    const readyForgotten=DATA.looks.filter(isReady).sort((a,b)=>(lastDate(a)||'').localeCompare(lastDate(b)||''))[0];
    if(readyForgotten)return{eyebrow:'READY FOR A TURN',title:shortName(readyForgotten),text:lastDate(readyForgotten)?`Last worn ${readableDate(lastDate(readyForgotten))}. It may be time to bring it back.`:'You own every piece, but haven’t logged this variant yet.',href:detailHref(readyForgotten),cta:'Open this look'};
    return{eyebrow:'GOOD VARIETY',title:'No exact look is dominating',text:'Your logged outfits are evenly spread. Keep using the button and the signal will get smarter.',href:'index.html',cta:'See today’s options'};
  }

  window.removeWear=function(lookId,date){
    wear[lookId]=(wear[lookId]||[]).filter(item=>item!==date);
    if(!wear[lookId].length)delete wear[lookId];
    localStorage.setItem('fitsWearHistory',JSON.stringify(wear));
    render();
  };

  function render(){
    const records=history(),monthPrefix=dateKey(new Date()).slice(0,7),monthRecords=records.filter(record=>record.date.startsWith(monthPrefix));
    const uniqueMonth=new Set(monthRecords.map(record=>record.lookId)).size;
    const variety=monthRecords.length?Math.round(uniqueMonth/monthRecords.length*100):0;
    const days=weekData(records),maxDay=Math.max(1,...days.map(day=>day.count));
    const top=DATA.looks.map(item=>({item,count:totalFor(item,records),last:lastDate(item)})).filter(entry=>entry.count>0).sort((a,b)=>b.count-a.count||b.last.localeCompare(a.last)).slice(0,5);
    const recent=records.slice(0,8),tip=insight(records,monthRecords);
    const readyCount=DATA.looks.filter(isReady).length,savedCount=DATA.looks.filter(item=>saved[item.id]).length;
    document.getElementById('root').innerHTML=`<div class="app">
      <header class="topbar"><div class="brandrow"><div class="brand">Stats</div><div class="kicker">${monthLabel()}</div></div><div class="subtitle">See what you actually wear — and what your rotation is ignoring.</div></header>
      <main>
        <section class="scorecard">
          <div class="score-head"><span>THIS MONTH</span><b>${monthRecords.length?`${variety}% variety`:'Build your signal'}</b></div>
          <div class="score-grid"><div><strong>${monthRecords.length}</strong><span>wears logged</span></div><div><strong>${uniqueMonth}</strong><span>unique variants</span></div><div><strong>${readyCount}</strong><span>ready to wear</span></div></div>
          <div class="week"><div class="week-label"><span>LAST 7 DAYS</span><b>${days.reduce((sum,day)=>sum+day.count,0)} logged</b></div><div class="bars">${days.map(day=>`<div class="bar-day"><div class="bar-track"><i style="height:${day.count?Math.max(16,day.count/maxDay*100):4}%"></i>${day.count?`<em>${day.count}</em>`:''}</div><span>${day.label}</span></div>`).join('')}</div></div>
        </section>
        <a class="insight" href="${tip.href}"><span>${tip.eyebrow}</span><h2>${tip.title}</h2><p>${tip.text}</p><b>${tip.cta} →</b></a>
        <section class="section"><div class="section-title"><div><span>YOUR PATTERN</span><h2>Most worn</h2></div><small>${savedCount} saved</small></div>${top.length?`<div class="rank-list">${top.map((entry,index)=>`<a class="rank-row" href="${detailHref(entry.item)}"><div class="rank-photo"><img src="${entry.item.image}" alt="${entry.item.name}"></div><div class="rank-copy"><strong>${shortName(entry.item)}</strong><span>${entry.last?`Last worn ${readableDate(entry.last)}`:'No recent date'}</span></div><b>${entry.count}×</b><em>${index+1}</em></a>`).join('')}</div>`:`<div class="empty"><strong>No wear history yet</strong><span>Your most-used looks will appear here.</span></div>`}</section>
        <section class="section"><div class="section-title"><div><span>HISTORY</span><h2>Recent wears</h2></div><small>Tap undo to correct a log</small></div>${recent.length?`<div class="recent-list">${recent.map(record=>{const item=look(record.lookId);return`<div class="recent-row"><a href="${detailHref(item)}"><div class="recent-photo"><img src="${item.image}" alt="${item.name}"></div><div><strong>${shortName(item)}</strong><span>${readableDate(record.date)}</span></div></a><button onclick="removeWear('${item.id}','${record.date}')" aria-label="Undo ${item.name} on ${readableDate(record.date)}">Undo</button></div>`}).join('')}</div>`:`<div class="empty"><strong>Nothing logged yet</strong><span>Use “I’ll wear this” from any outfit detail.</span></div>`}</section>
      </main>
      <nav class="nav"><a href="index.html"><b>▦</b>Looks</a><a href="wardrobe.html"><b>◇</b>Wardrobe</a><a href="unlock.html"><b>↗</b>Unlock</a><a class="active" href="stats.html"><b>◫</b>Stats</a></nav>
    </div>`;
  }
  render();
})();
