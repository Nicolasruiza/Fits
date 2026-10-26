/* Fits v5 Looks page (Design 4): weather card with auto season, Ready / Inspiration tabs,
   occasion chips, favorites row, warmer/colder sort, image-only grid, inspiration by distance,
   best next buy, hidden looks view. */
(()=>{
  const V=window.FITS_V5,D=window.FITS_DATA;
  const root=document.getElementById('root');
  if(!V||!D||!root)return;

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const params=new URLSearchParams(location.search);
  const ui={
    tab:sessionStorage.getItem('fitsV5Tab')||'ready',
    favoritesOnly:false,
    expanded:{},
    garment:(g=>V.GARMENTS.includes(g)?g:'All')(window.FITS_KINDS.migrate(V.read('fitsGarmentV5','All'))),
    sheet:false,
    view:params.get('view')==='hidden'?'hidden':'main',
    loadingWeather:false
  };
  const sortDir=()=>V.read('fitsWarmthSortV5','warmer')==='colder'?'colder':'warmer';

  /* ---------- Icons ---------- */
  const I={
    pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/></svg>',
    leaf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/></svg>',
    swap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4L3 8l4 4M3 8h13a4 4 0 0 1 0 8h-1M17 20l4-4-4-4M21 16H8"/></svg>',
    star:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg>',
    eyeOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10 10 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-3 3.8M6.1 6.1C3.6 7.8 2.5 12 2.5 12s3.5 7 9.5 7a9.7 9.7 0 0 0 4.2-1"/></svg>',
    chevron:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    office:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>',
    weekend:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    dinner:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M7 3v8a2 2 0 0 0 2 2M5 3v6M9 3v6M7 13v8M17 3c-2 2-2 6 0 9v9"/></svg>',
    travel:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
    hanger:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7a2 2 0 1 0-2-2M12 7v2L3 16h18l-9-7"/></svg>',
    wardrobe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18"/></svg>',
    stats:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 20h16M7 20V11M12 20V5M17 20v-6"/></svg>'
  };
  function weatherIcon(code){
    const sun='<circle cx="22" cy="22" r="10" fill="#f2b33d"/><g stroke="#f2b33d" stroke-width="3" stroke-linecap="round"><path d="M22 4v4M22 36v4M4 22h4M36 22h4M9.3 9.3l2.8 2.8M31.9 31.9l2.8 2.8M9.3 34.7l2.8-2.8M31.9 12.1l2.8-2.8"/></g>';
    const cloud='<path d="M20 46h24a8 8 0 0 0 0-16 11 11 0 0 0-21 3 6.5 6.5 0 0 0-3 13z" fill="#ffffff" stroke="#b9bfc3" stroke-width="1.5"/>';
    const bigCloud='<path d="M14 42h28a10 10 0 0 0 0-20 13 13 0 0 0-25 4 8 8 0 0 0-3 16z" fill="#ffffff" stroke="#b9bfc3" stroke-width="1.5"/>';
    let body;
    if(code===0)body='<circle cx="28" cy="28" r="11" fill="#f2b33d"/><g stroke="#f2b33d" stroke-width="3" stroke-linecap="round"><path d="M28 6v5M28 45v5M6 28h5M45 28h5M12.4 12.4l3.5 3.5M40.1 40.1l3.5 3.5M12.4 43.6l3.5-3.5M40.1 15.9l3.5-3.5"/></g>';
    else if(code<=2)body=sun+cloud;
    else if((code>=51&&code<=67)||(code>=80&&code<=82)||code>=95)body=bigCloud+'<g stroke="#5b8db8" stroke-width="3" stroke-linecap="round"><path d="M20 47l-2 5M30 47l-2 5M40 47l-2 5"/></g>';
    else if(code>=71&&code<=86)body=bigCloud+'<g fill="#8fb3d1"><circle cx="20" cy="50" r="2.4"/><circle cx="30" cy="51" r="2.4"/><circle cx="40" cy="50" r="2.4"/></g>';
    else body=bigCloud;
    return `<svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">${body}</svg>`;
  }
  function weatherLabel(c){if(c===0)return'Clear';if(c<=2)return'Partly cloudy';if(c===3)return'Cloudy';if(c===45||c===48)return'Foggy';if((c>=51&&c<=67)||(c>=80&&c<=82))return'Rain';if(c>=71&&c<=86)return'Snow';if(c>=95)return'Storm';return'Cloudy'}

  /* ---------- Weather: shared with the classic app via fits-weather.js ---------- */
  const FW=window.FitsWeather;
  async function fetchWeather(lat,lon,location){
    ui.loadingWeather=true;render();
    try{await FW.fetchAt(lat,lon,location)}catch(e){/* keep the cached weather */}
    ui.loadingWeather=false;render();
  }
  async function requestLocation(){
    ui.loadingWeather=true;render();
    try{const p=await FW.locate();fetchWeather(p.lat,p.lon,p.location)}
    catch(e){ui.loadingWeather=false;render()}
  }
  function refreshWeather(force){
    const c=FW.coords();
    if(c){if(force||FW.isStale(FW.cached()))fetchWeather(c.lat,c.lon,c.location)}
    else if(force)requestLocation();
  }

  /* ---------- Pieces of the page ---------- */
  function weatherCard(st,s){
    const w=st.weather;
    const seasonLine=`<div class="v5-season">
        <span class="v5-season-icon">${I.leaf}</span>
        <span class="v5-season-text"><strong>${esc(s.season)}</strong> season · ${s.auto?'by weather':'set by you today'}</span>
        <button class="v5-change" type="button" data-action="season-sheet" aria-label="Change season">${I.swap}Change</button>
      </div>`;
    if(!w||!Number.isFinite(Number(w.temp))){
      return `<section class="v5-weather" aria-label="Today's weather">
        <div class="v5-weather-top"><span class="v5-loc">${I.pin}TODAY</span>
          <button class="v5-icon-btn${ui.loadingWeather?' is-loading':''}" type="button" data-action="locate" aria-label="Use my location">${I.refresh}</button></div>
        <button class="v5-enable" type="button" data-action="locate"><strong>Local weather</strong><span>Tap to enable · season uses the calendar until then</span></button>
        ${seasonLine}</section>`;
    }
    const day=new Date().toLocaleDateString('en-US',{weekday:'long'}).toUpperCase();
    const feels=Number.isFinite(Number(w.apparent))?`Feels ${Math.round(w.apparent)}° · `:'';
    const hi=Number.isFinite(w.maxTemp)?`High ${Math.round(w.maxTemp)}°`:'',lo=Number.isFinite(w.minTemp)?`Low ${Math.round(w.minTemp)}°`:'';
    return `<section class="v5-weather" aria-label="Today's weather">
      <div class="v5-weather-top"><span class="v5-loc">${I.pin}${esc(day)} · ${esc((w.location||'Your location').toUpperCase())}</span>
        <button class="v5-icon-btn${ui.loadingWeather?' is-loading':''}" type="button" data-action="refresh" aria-label="Refresh weather">${I.refresh}</button></div>
      <div class="v5-weather-now">${weatherIcon(w.code)}
        <span class="v5-temp">${Math.round(w.temp)}°</span>
        <div class="v5-cond"><strong>${feels}${esc(weatherLabel(w.code))}</strong><span>${[hi,lo].filter(Boolean).join(' · ')}</span><span>Rain ${Math.round(w.maxRain||0)}%</span></div>
      </div>
      ${seasonLine}</section>`;
  }
  function tabs(readyCount,ideaCount){
    const t=(id,label)=>`<button class="v5-tab${ui.tab===id?' is-active':''}" role="tab" aria-selected="${ui.tab===id}" data-action="tab" data-tab="${id}">${label}</button>`;
    return `<div class="v5-tabs" role="tablist" aria-label="Looks">${t('ready',`Ready to wear · ${readyCount}`)}${t('ideas',`Inspiration · ${ideaCount}`)}</div>`;
  }
  function occasionChips(o){
    const chip=x=>`<button class="v5-chip${o.occasion===x?' is-active':''}" type="button" role="radio" aria-checked="${o.occasion===x}" data-action="occasion" data-value="${x}">${o.occasion===x?I[x.toLowerCase()]:''}${x}</button>`;
    const note=o.occasion==='All'?'Showing every occasion · tap one to filter':o.auto?`Auto: ${o.occasion==='Weekend'?'weekend':'weekday'} · tap ${o.occasion} again to see every occasion`:`Set by you today · tap ${o.occasion} again to see every occasion`;
    return `<div class="v5-chips" role="radiogroup" aria-label="Occasion">${V.OCCASIONS.map(chip).join('')}</div><p class="v5-note">${esc(note)}</p>`;
  }
  function garmentChips(){
    const chip=x=>`<button class="v5-garment-chip${ui.garment===x?' is-active':''}" type="button" data-action="garment" data-value="${esc(x)}">${x==='All'?'Anything':esc(x)}</button>`;
    return `<section class="v5-garment-filter"><div class="v5-filter-head"><strong>Start with</strong><span>find looks by garment</span></div><div class="v5-garment-chips">${V.GARMENTS.map(chip).join('')}</div></section>`;
  }
  function sortToggle(){
    const d=sortDir();
    return `<div class="v5-sort" role="radiogroup" aria-label="Sort by warmth">
      <button type="button" role="radio" aria-checked="${d==='warmer'}" class="v5-sort-btn warm${d==='warmer'?' is-active':''}" data-action="sort" data-value="warmer">↑ Warmer</button>
      <button type="button" role="radio" aria-checked="${d==='colder'}" class="v5-sort-btn cold${d==='colder'?' is-active':''}" data-action="sort" data-value="colder">↓ Colder</button></div>`;
  }
  function needsText(card){
    const m=card.missing;
    if(!m.length)return'';
    if(m.length===1)return`Needs ${(V.piece(m[0])?.name||m[0]).toLowerCase()}`;
    if(m.length===2)return`Needs ${m.map(id=>(V.piece(id)?.name||id).toLowerCase()).join(' + ')}`;
    return`Needs ${m.length} pieces`;
  }
  function card(c,opts={}){
    const l=c.look,f=V.feel(l),cls=f==='Warmer'?'warm':f==='Colder'?'cold':'mild';
    const needs=opts.needs?`<span class="v5-needs">${esc(needsText(c))}</span>`:'';
    const extra=opts.unhide?`<button class="v5-unhide" type="button" data-action="unhide" data-look="${esc(l.id)}">Unhide</button>`:'';
    return `<div class="v5-card-wrap"><a class="v5-card" href="${esc(V.detailHref(l))}" data-action="open-look" aria-label="${esc(l.name)}">
      <img src="${esc(l.image)}" alt="${esc(l.name)}" loading="lazy" onerror="this.classList.add('is-broken')">
      <span class="v5-feel ${cls}">${f.toUpperCase()}</span>${needs}</a>${extra}</div>`;
  }
  function favRow(cards){
    if(!cards.length)return'';
    return `<section class="v5-favs"><div class="v5-row-head"><h2 class="v5-h2"><span class="v5-star">${I.star}</span>Your favorites</h2>
      <button class="v5-link" type="button" data-action="fav-all">See all</button></div>
      <div class="v5-rail">${cards.map(c=>`<a class="v5-rail-card" href="${esc(V.detailHref(c.look))}" data-action="open-look" aria-label="${esc(c.look.name)}"><img src="${esc(c.look.image)}" alt="${esc(c.look.name)}" loading="lazy" onerror="this.classList.add('is-broken')"></a>`).join('')}</div></section>`;
  }
  function hiddenLink(){
    return `<a class="v5-hidden-link" href="looks.html?view=hidden"><span>${I.eyeOff}Looks you hid</span>${I.chevron}</a>`;
  }
  const nav=()=>V.nav('looks');
  function seasonSheet(s){
    if(!ui.sheet)return'';
    const opt=x=>`<button class="v5-sheet-opt${s.season===x?' is-active':''}" type="button" data-action="set-season" data-value="${x}">${x}${x===s.autoSeason?'<small>Weather says this week</small>':''}</button>`;
    return `<div class="v5-scrim" data-action="close-sheet"></div>
      <div class="v5-sheet" role="dialog" aria-modal="true" aria-label="Change season">
        <span class="v5-grab"></span>
        <h2>Change season for today</h2>
        <p>Use this for exceptions, like a trip somewhere warmer. It goes back to the weather tomorrow.</p>
        <div class="v5-sheet-opts">${V.SEASONS.map(opt).join('')}</div>
        ${s.auto?'':'<button class="v5-sheet-reset" type="button" data-action="set-season" data-value="">Back to auto</button>'}
        <button class="v5-sheet-close" type="button" data-action="close-sheet">Done</button>
      </div>`;
  }

  /* ---------- Views ---------- */
  function mainView(){
    const st=V.state(),s=V.season(st),o=V.occasion();
    const cards=V.familyCards({state:st,season:s.season,occasion:o.occasion,garment:ui.garment});
    const ready=V.sortByWarmth(cards.filter(c=>!c.missing.length),sortDir());
    const ideas=V.sortByWarmth(cards.filter(c=>c.missing.length),sortDir());
    let body='';
    if(ui.tab==='ready'){
      const favs=ready.filter(c=>c.saved);
      if(ui.favoritesOnly){
        body=`<div class="v5-row-head v5-pad"><h2 class="v5-h2"><span class="v5-star">${I.star}</span>Favorites ready</h2><button class="v5-link" type="button" data-action="fav-back">Back</button></div>
          <div class="v5-grid">${favs.map(c=>card(c)).join('')}</div>`;
      }else{
        body=`${favRow(favs)}
          <div class="v5-row-head v5-pad"><h2 class="v5-h2">All ready</h2>${sortToggle()}</div>
          ${ready.length?`<div class="v5-grid">${ready.map(c=>card(c)).join('')}</div>`:`<p class="v5-empty">Nothing ready for ${esc(o.occasion==='All'?'this season':o.occasion.toLowerCase())} yet. Check Inspiration for the closest looks.</p>`}`;
      }
    }else{
      const groups=[['1 piece away',ideas.filter(c=>c.missing.length===1),'one'],['2 pieces away',ideas.filter(c=>c.missing.length===2),'two'],['3+ pieces away',ideas.filter(c=>c.missing.length>=3),'more']];
      body=`${V.bestBuyCard(st)}<div class="v5-row-head v5-pad"><h2 class="v5-h2">Ideas</h2>${sortToggle()}</div>
        ${groups.filter(g=>g[1].length).map(([title,list,key])=>{
          const open=ui.expanded[key],shown=open?list:list.slice(0,6);
          return `<section class="v5-section"><div class="v5-row-head"><h3 class="v5-h3">${title}</h3><span class="v5-count">${list.length} ${list.length===1?'look':'looks'}</span></div>
            <div class="v5-grid">${shown.map(c=>card(c,{needs:true})).join('')}</div>
            ${list.length>6?`<button class="v5-more" type="button" data-action="expand" data-key="${key}">${open?'Show less':`Show all ${list.length}`}</button>`:''}</section>`;
        }).join('')||'<p class="v5-empty">No ideas match this season and occasion.</p>'}`;
    }
    return `<header class="v5-header"><h1>Looks</h1><span>${(D.looks||[]).length} LOOKS</span></header>
      ${weatherCard(st,s)}
      ${tabs(ready.length,ideas.length)}
      ${occasionChips(o)}
      ${garmentChips()}
      ${body}
      ${hiddenLink()}
      <p class="v5-classic"><a href="index.html?ui=classic">Switch to the classic view</a></p>
      ${seasonSheet(s)}`;
  }
  function hiddenView(){
    const st=V.state();
    const cards=V.familyCards({state:st,hiddenOnly:true});
    return `<div class="v5-back-row"><a class="v5-back" href="looks.html">${I.back}Looks</a></div>
      <header class="v5-header"><h1>Looks you hid</h1><span>${cards.length}</span></header>
      <p class="v5-note">These never show in Ready or Inspiration. Unhide one to bring it back.</p>
      ${cards.length?`<div class="v5-grid">${cards.map(c=>card(c,{unhide:true})).join('')}</div>`:'<p class="v5-empty">You haven’t hidden any looks.</p>'}`;
  }
  function render(){
    const y=window.scrollY;
    root.innerHTML=`<div class="v5">${ui.view==='hidden'?hiddenView():mainView()}</div>${nav()}`;
    window.scrollTo(0,y);
  }

  /* ---------- Events ---------- */
  root.addEventListener('click',e=>{
    const el=e.target.closest('[data-action]');if(!el)return;
    const a=el.dataset.action;
    if(a==='open-look'){V.track('lookTap');return}
    if(a==='open-buy'){V.track('nextBuyTap');return}
    if(a==='close-sheet'){ui.sheet=false;render();return}
    e.preventDefault();
    if(a==='tab'){ui.tab=el.dataset.tab;ui.favoritesOnly=false;sessionStorage.setItem('fitsV5Tab',ui.tab);V.track(ui.tab==='ideas'?'ideasOpen':'readyOpen')}
    else if(a==='occasion'){const cur=V.occasion().occasion,v=el.dataset.value;V.setOccasion(cur===v?'All':v)}
    else if(a==='garment'){const v=el.dataset.value;ui.garment=ui.garment===v?'All':v;V.write('fitsGarmentV5',ui.garment);ui.expanded={}}
    else if(a==='sort'){V.write('fitsWarmthSortV5',el.dataset.value)}
    else if(a==='fav-all'){ui.favoritesOnly=true;window.scrollTo(0,0)}
    else if(a==='fav-back'){ui.favoritesOnly=false}
    else if(a==='expand'){ui.expanded[el.dataset.key]=!ui.expanded[el.dataset.key]}
    else if(a==='season-sheet'){ui.sheet=true}
    else if(a==='set-season'){V.setSeason(el.dataset.value||null);ui.sheet=false}
    else if(a==='refresh'){refreshWeather(true);return}
    else if(a==='locate'){requestLocation();return}
    else if(a==='unhide'){const h=new Set(V.read('fitsHiddenLooks',[]));h.delete(el.dataset.look);V.write('fitsHiddenLooks',[...h])}
    render();
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ui.sheet){ui.sheet=false;render()}});
  window.addEventListener('storage',e=>{if(/^fits/.test(e.key||''))render()});
  window.addEventListener('pageshow',e=>{if(e.persisted)render()});

  V.track('open');
  render();
  refreshWeather(false);
})();
