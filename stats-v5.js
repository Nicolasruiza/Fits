/* Fits v5 Stats: is the rotation working? Month card, Looks / Pieces tabs, Wear next,
   forgotten favorites, closet usage, and the full history (with undo) behind a link. */
(()=>{
  const V=window.FITS_V5,D=window.FITS_DATA,C=window.FITS_CLIMATE,root=document.getElementById('root');
  if(!V||!D||!root)return;
  const esc=V.esc,params=new URLSearchParams(location.search);
  const thisMonth=V.todayKey().slice(0,7);
  const ui={
    tab:sessionStorage.getItem('fitsV5StatsTab')||'looks',
    month:sessionStorage.getItem('fitsV5StatsMonth')||thisMonth,
    view:params.get('view')==='history'?'history':'main',
    sheet:false,rowAll:false
  };
  const I={
    cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    star:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg>',
    clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2"/></svg>',
    chevron:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>'
  };
  const monthName=m=>new Date(`${m}-15T12:00:00`).toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const plural=(n,w)=>`${n} ${w}${n===1?'':'s'}`;

  function lastWorn(records){const m=new Map();records.forEach(r=>{if(!m.has(r.lookId))m.set(r.lookId,r.date)});return m}
  function model(){
    const st=V.state(),all=V.wearRecords(),recs=all.filter(r=>r.date.startsWith(ui.month));
    const last=lastWorn(all),hiddenPieces=new Set(V.read('fitsHiddenPieces',[]));
    const ownedPieces=(D.pieces||[]).filter(p=>!hiddenPieces.has(p.id)&&V.owned(p.id,st));
    const pieceCounts=V.pieceWearCounts(recs);
    return{st,all,recs,last,ownedPieces,pieceCounts,current:ui.month===thisMonth};
  }

  /* ---------- Month card ---------- */
  function week(m){
    const days=[];
    for(let off=6;off>=0;off--){
      const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-off);
      const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const rec=m.all.find(r=>r.date===key),l=rec&&V.look(rec.lookId);
      days.push({key,label:d.toLocaleDateString('en-US',{weekday:'narrow'}),look:l,today:off===0});
    }
    return days;
  }
  function monthCard(m){
    const change=`<button class="v5-change" type="button" data-action="month-sheet" aria-label="Change month">${I.cal}Change</button>`;
    if(ui.tab==='pieces'){
      const worn=m.ownedPieces.filter(p=>(m.pieceCounts.get(p.id)||0)>0).length,total=m.ownedPieces.length,pct=total?Math.round(worn/total*100):0;
      return`<section class="s5-month" aria-label="${esc(monthName(ui.month))}"><div class="s5-month-top"><span>${esc(monthName(ui.month).toUpperCase())}</span>${change}</div>
        <div class="s5-big"><div><b>${worn}</b><small>of ${total} owned pieces worn</small></div><div><span><strong>${pct}% of your closet</strong></span><span>${plural(total-worn,'piece')} sat out</span></div></div>
        <div class="s5-bar" role="img" aria-label="${worn} of ${total} pieces worn"><i style="width:${pct}%"></i></div></section>`;
    }
    const wears=m.recs.length,unique=new Set(m.recs.map(r=>r.lookId)).size,variety=wears?Math.round(unique/wears*100):0;
    const days=week(m),wornDays=days.filter(d=>d.look).length;
    const strip=m.current?`<div class="s5-week">${days.map(d=>`<div class="s5-day">${d.look?`<a href="${esc(V.detailHref(d.look))}" aria-label="${esc(d.look.name)}"><img src="${esc(d.look.image)}" alt="${esc(d.look.name)}" loading="lazy" onerror="this.classList.add('is-broken')"></a>`:`<i class="${d.today?'today':''}" aria-hidden="true"></i>`}<span class="${d.today?'today':''}">${d.label}</span></div>`).join('')}</div>`:'';
    return`<section class="s5-month" aria-label="${esc(monthName(ui.month))}"><div class="s5-month-top"><span>${esc(monthName(ui.month).toUpperCase())}</span>${change}</div>
      <div class="s5-big"><div><b>${wears}</b><small>${wears===1?'wear':'wears'} logged</small></div><div><span><strong>${plural(unique,'different look')}</strong>${wears?` · ${variety}% variety`:''}</span>${m.current?`<span>Worn ${wornDays} of the last 7 days</span>`:''}</div></div>
      ${strip}</section>`;
  }

  /* ---------- Looks tab ---------- */
  function wearNext(m){
    if(!m.current)return'';
    const s=V.season(m.st).season,o=V.occasion().occasion,w=m.st.weather;
    const ctx=C&&w?C.weatherContext(w):null;
    const today=V.todayKey(),loggedToday=m.all.find(r=>r.date===today);
    const cards=V.familyCards({state:m.st,season:s,occasion:o}).filter(c=>!c.missing.length);
    const ranked=cards.map(c=>{
      const days=V.daysSince(m.last.get(c.look.id));
      let score=Math.min(days,60)+(m.st.saved[c.look.id]?15:0);
      if(ctx&&ctx.feelsC!=null)score-=C.fitScore(c.look,ctx.feelsC,{layerable:!!c.look.winterLayerable})*3;
      return{c,days,score};
    }).filter(x=>x.days>=7).sort((a,b)=>b.score-a.score);
    const pick=loggedToday?{c:{look:V.look(loggedToday.lookId)},days:0}:ranked[0];
    if(!pick||!pick.c.look)return'';
    const l=pick.c.look;
    const why=loggedToday?'Logged for today. Tap undo if that was a mistake.'
      :[`Ready`,ctx&&ctx.feelsC!=null?`suits today’s ${Math.round(w.temp)}°`:'',pick.days===Infinity?'never worn yet':`last worn ${pick.days} days ago`].filter(Boolean).join(', ')+'.';
    return`<div class="s5-next"><a href="${esc(V.detailHref(l))}" aria-label="${esc(l.name)}"><img src="${esc(l.image)}" alt="${esc(l.name)}" onerror="this.classList.add('is-broken')"></a>
      <div><span class="v5-kicker">${loggedToday?'Wearing today':'Wear next'}</span><strong>${esc(l.name)}</strong><p>${esc(why)}</p>
      ${loggedToday?`<button class="is-done" type="button" data-action="unwear" data-look="${esc(l.id)}">✓ Logged · Undo</button>`:`<button type="button" data-action="wear" data-look="${esc(l.id)}">Wear today</button>`}</div></div>`;
  }
  function looksTab(m){
    const counts=new Map();m.recs.forEach(r=>counts.set(r.lookId,(counts.get(r.lookId)||0)+1));
    const sort=V.read('fitsStatsSortLooks','most');
    const worn=[...counts.entries()].map(([id,n])=>({l:V.look(id),n,last:m.last.get(id)})).filter(x=>x.l)
      .sort((a,b)=>sort==='oldest'?a.last.localeCompare(b.last)||b.n-a.n:b.n-a.n||b.last.localeCompare(a.last));
    const forgotten=(D.looks||[]).filter(l=>m.st.saved[l.id]&&!m.st.hidden.has(l.id)&&!V.missing(l,m.st).length&&V.daysSince(m.last.get(l.id))>=30)
      .sort((a,b)=>V.daysSince(m.last.get(b.id))-V.daysSince(m.last.get(a.id)));
    const fTile=l=>`<a class="s5-look${ui.rowAll?'':' s5-rail-look'}" href="${esc(V.detailHref(l))}" aria-label="${esc(l.name)}"><img src="${esc(l.image)}" alt="${esc(l.name)}" loading="lazy" onerror="this.classList.add('is-broken')"><span class="s5-when">${esc(V.relativeDay(m.last.get(l.id)))}</span></a>`;
    if(ui.rowAll)return`<div class="v5-row-head v5-pad"><h2 class="v5-h2"><span class="v5-star">${I.star}</span>Forgotten favorites</h2><button class="v5-link" type="button" data-action="row-back">Back</button></div><div class="v5-grid">${forgotten.map(fTile).join('')}</div>`;
    const start=!m.all.length?`<div class="s5-start"><strong>Your rotation starts with one tap</strong><p>Open any ready look and tap “I’ll wear this”, or use Wear today above. Stats fill in from there.</p><a href="looks.html">Choose a look</a></div>`:'';
    return`${wearNext(m)}${start}
      ${forgotten.length?`<section class="v5-favs"><div class="v5-row-head"><h2 class="v5-h2"><span class="v5-star">${I.star}</span>Forgotten favorites</h2><button class="v5-link" type="button" data-action="row-all">See all${forgotten.length>3?` ${forgotten.length}`:''}</button></div><div class="v5-rail">${forgotten.slice(0,12).map(fTile).join('')}</div></section>`:''}
      ${worn.length?`<div class="v5-row-head v5-pad"><h2 class="v5-h2">All worn</h2><div class="v5-sort" role="radiogroup" aria-label="Sort worn looks">
          <button type="button" role="radio" aria-checked="${sort==='most'}" class="v5-sort-btn${sort==='most'?' is-active':''}" data-action="sort" data-value="most">Most worn</button>
          <button type="button" role="radio" aria-checked="${sort==='oldest'}" class="v5-sort-btn${sort==='oldest'?' is-active':''}" data-action="sort" data-value="oldest">Longest ago</button></div></div>
        <div class="v5-grid">${worn.map(x=>`<a class="s5-look" href="${esc(V.detailHref(x.l))}" aria-label="${esc(x.l.name)}"><img src="${esc(x.l.image)}" alt="${esc(x.l.name)}" loading="lazy" onerror="this.classList.add('is-broken')"><span class="s5-count">${x.n}×</span><span class="s5-when">${esc(V.relativeDay(x.last))}</span></a>`).join('')}</div>`
        :m.all.length?`<p class="v5-empty">Nothing logged in ${esc(monthName(ui.month))}.</p>`:''}`;
  }

  /* ---------- Pieces tab ---------- */
  function piecesTab(m){
    const st=m.st,looks=(D.looks||[]).filter(l=>!st.hidden.has(l.id));
    const inLooks=id=>looks.filter(l=>(l.pieces||[]).includes(id)).length;
    const rows=m.ownedPieces.map(p=>({p,n:m.pieceCounts.get(p.id)||0,looks:inLooks(p.id)}));
    const unworn=rows.filter(x=>!x.n).sort((a,b)=>b.looks-a.looks||a.p.name.localeCompare(b.p.name));
    const sort=V.read('fitsStatsSortPieces','most');
    const used=rows.filter(x=>x.n).sort((a,b)=>sort==='least'?a.n-b.n:b.n-a.n);
    const tile=(x,label,cls,rail)=>{const src=V.pieceImage(x.p.id);return`<a class="w5-tile${rail?' w5-rail-tile':''}" href="${esc(V.pieceHref(x.p.id))}" aria-label="${esc(x.p.name)}">${src?`<img src="${esc(src)}" alt="${esc(x.p.name)}" loading="lazy" onerror="this.classList.add('is-broken')">`:`<span class="w5-noimg">${esc(x.p.name)}</span>`}<span class="${cls}">${esc(label)}</span></a>`};
    if(ui.rowAll)return`<div class="v5-row-head v5-pad"><h2 class="v5-h2">Owned, not worn yet</h2><button class="v5-link" type="button" data-action="row-back">Back</button></div><div class="w5-grid">${unworn.map(x=>tile(x,`In ${plural(x.looks,'look')}`,'w5-tag plain')).join('')}</div>`;
    let insight='';
    if(m.recs.length&&used.length){
      const top=[...used].sort((a,b)=>b.n-a.n)[0],idle=unworn.find(x=>x.looks>=3&&x.p.id!==top.p.id),src=V.pieceImage(top.p.id);
      insight=`<div class="s5-insight">${src?`<span><img src="${esc(src)}" alt=""></span>`:''}<p><strong>${esc(top.p.name)} ${top.n===m.recs.length?'was in every wear':`carried ${top.n} of ${m.recs.length} wears`}.</strong>${idle?` Your ${esc(idle.p.name.toLowerCase())} ${/s$/i.test(idle.p.name.trim())?'are':'is'} in ${plural(idle.looks,'look')} and sat out ${m.current?'this month':'that month'}.`:''}</p></div>`;
    }
    return`${insight}
      ${unworn.length?`<section class="v5-favs"><div class="v5-row-head"><h2 class="v5-h2">Owned, not worn yet</h2><button class="v5-link" type="button" data-action="row-all">See all ${unworn.length}</button></div><div class="v5-rail">${unworn.slice(0,12).map(x=>tile(x,`In ${plural(x.looks,'look')}`,'w5-tag plain',true)).join('')}</div></section>`:''}
      ${used.length?`<div class="v5-row-head v5-pad"><h2 class="v5-h2">Working hardest</h2><div class="v5-sort" role="radiogroup" aria-label="Sort pieces">
          <button type="button" role="radio" aria-checked="${sort==='most'}" class="v5-sort-btn${sort==='most'?' is-active':''}" data-action="sort" data-value="most">Most worn</button>
          <button type="button" role="radio" aria-checked="${sort==='least'}" class="v5-sort-btn${sort==='least'?' is-active':''}" data-action="sort" data-value="least">Least worn</button></div></div>
        <div class="w5-grid">${used.map(x=>tile(x,`${x.n}×`,'s5-count')).join('')}</div>`
        :`<p class="v5-empty">No wears logged in ${esc(monthName(ui.month))} yet.</p>`}`;
  }

  /* ---------- History ---------- */
  function historyView(){
    const recs=V.wearRecords();
    const byDay=[];recs.forEach(r=>{let g=byDay[byDay.length-1];if(!g||g.date!==r.date){g={date:r.date,items:[]};byDay.push(g)}g.items.push(r)});
    return`<div class="v5-back-row"><a class="v5-back" href="stats.html">${I.back}Stats</a></div>
      <header class="v5-header"><h1>Wear history</h1><span>${recs.length} ${recs.length===1?'WEAR':'WEARS'}</span></header>
      <div class="s5-history">${byDay.length?byDay.map(g=>`<div class="s5-hday">${esc(new Date(`${g.date}T12:00:00`).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}))}</div>${g.items.map(r=>{const l=V.look(r.lookId);return`<div class="s5-hrow"><a href="${esc(V.detailHref(l))}"><img src="${esc(l.image)}" alt="" loading="lazy" onerror="this.classList.add('is-broken')"><span>${esc(l.name)}</span></a><button type="button" data-action="undo" data-look="${esc(r.lookId)}" data-date="${esc(r.date)}">Undo</button></div>`}).join('')}`).join(''):'<p class="v5-empty">No wears logged yet.</p>'}</div>`;
  }
  function monthSheet(m){
    if(!ui.sheet)return'';
    const months=[...new Set([thisMonth,...m.all.map(r=>r.date.slice(0,7))])].sort().reverse();
    return`<div class="v5-scrim" data-action="close-sheet"></div><div class="v5-sheet" role="dialog" aria-modal="true" aria-label="Change month"><span class="v5-grab"></span><h2>Pick a month</h2>
      <div class="v5-sheet-opts">${months.map(mo=>{const n=m.all.filter(r=>r.date.startsWith(mo)).length;return`<button class="v5-sheet-opt s5-sheet-month${mo===ui.month?' is-active':''}" type="button" data-action="set-month" data-value="${mo}">${esc(monthName(mo))}<small>${plural(n,'wear')}</small></button>`}).join('')}</div>
      <button class="v5-sheet-close" type="button" data-action="close-sheet">Done</button></div>`;
  }

  function render(){
    const y=window.scrollY;
    if(ui.view==='history'){root.innerHTML=`<div class="v5">${historyView()}</div>${V.nav('stats')}`;window.scrollTo(0,y);return}
    const m=model();
    const uniqueLooks=new Set(m.recs.map(r=>r.lookId)).size;
    const usedPieces=m.ownedPieces.filter(p=>(m.pieceCounts.get(p.id)||0)>0).length;
    const tab=(id,label)=>`<button class="v5-tab${ui.tab===id?' is-active':''}" role="tab" aria-selected="${ui.tab===id}" data-action="tab" data-tab="${id}">${label}</button>`;
    root.innerHTML=`<div class="v5"><header class="v5-header"><h1>Stats</h1><span>${m.recs.length} ${m.recs.length===1?'WEAR':'WEARS'}</span></header>
      ${monthCard(m)}
      <div class="v5-tabs" role="tablist" aria-label="Stats">${tab('looks',`Looks · ${uniqueLooks} worn`)}${tab('pieces',`Pieces · ${usedPieces} used`)}</div>
      ${ui.tab==='looks'?looksTab(m):piecesTab(m)}
      ${m.all.length?`<a class="v5-hidden-link" href="stats.html?view=history"><span>${I.clock}All wear history · undo a log</span>${I.chevron}</a>`:''}
      ${monthSheet(m)}</div>${V.nav('stats')}`;
    window.scrollTo(0,y);
  }
  root.addEventListener('click',e=>{
    const el=e.target.closest('[data-action]');if(!el)return;
    const a=el.dataset.action;
    if(a==='close-sheet'){ui.sheet=false;render();return}
    e.preventDefault();
    if(a==='tab'){ui.tab=el.dataset.tab;ui.rowAll=false;sessionStorage.setItem('fitsV5StatsTab',ui.tab)}
    else if(a==='sort'){V.write(ui.tab==='looks'?'fitsStatsSortLooks':'fitsStatsSortPieces',el.dataset.value)}
    else if(a==='row-all'){ui.rowAll=true;window.scrollTo(0,0)}
    else if(a==='row-back'){ui.rowAll=false}
    else if(a==='month-sheet'){ui.sheet=true}
    else if(a==='set-month'){ui.month=el.dataset.value;ui.sheet=false;sessionStorage.setItem('fitsV5StatsMonth',ui.month)}
    else if(a==='wear'){V.logWear(el.dataset.look);V.track('wearNext')}
    else if(a==='unwear'){V.unlogWear(el.dataset.look,V.todayKey())}
    else if(a==='undo'){V.unlogWear(el.dataset.look,el.dataset.date)}
    render();
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ui.sheet){ui.sheet=false;render()}});
  window.addEventListener('storage',e=>{if(/^fits/.test(e.key||''))render()});
  window.addEventListener('pageshow',e=>{if(e.persisted)render()});
  V.track('statsOpen');
  render();
})();
