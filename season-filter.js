(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const validOcc=['All','Office','Weekend','Dinner','Travel'],validStatus=['All','Favorites','Hidden','Complete','Almost','Missing'],validSeason=['All','Summer','Transitional','Cold'],validGarment=['All',...window.FITS_KINDS.LOOK_GARMENTS];
  const icon=name=>({
    All:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>',
    Favorites:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/></svg>',
    Hidden:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 4.3A10.8 10.8 0 0 1 12 4c5.4 0 9 5 9 5s-1.2 1.7-3.2 3.1M6.2 6.2C4.2 7.4 3 9 3 9s3.6 5 9 5c.8 0 1.5-.1 2.2-.3"/></svg>',
    Office:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M3 12h18M10 12v2h4v-2"/></svg>',
    Weekend:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>',
    Dinner:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3v7M9 3v7M4 3v5a3 3 0 0 0 6 0V3M7 10v11M16 3v18M16 3c3 2 4 5 4 8h-4"/></svg>',
    Travel:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 14 7-2 4-8 2 1-2 7 6 2c1 .3 1 1.7 0 2l-6 1-3 4-1-1 1-4-5 1-3-3Z"/></svg>'
  })[name]||'';
  let occasion=localStorage.getItem('fitsOccasionFilter')||'All',status=localStorage.getItem('fitsLookStatusFilter')||'All',season=localStorage.getItem('fitsSeasonFilter')||'All',garment=window.FITS_KINDS.migrate(localStorage.getItem('fitsGarmentFilter')||'All');
  // Favorites and Hidden used to live in the occasion row; they are a separate "status" filter now.
  if(['Favorites','Hidden'].includes(occasion)){status=occasion;occasion='All';localStorage.setItem('fitsOccasionFilter',occasion);localStorage.setItem('fitsLookStatusFilter',status)}
  if(!validOcc.includes(occasion))occasion='All';
  if(!validStatus.includes(status))status='All';
  if(!validSeason.includes(season))season='All';
  if(!validGarment.includes(garment))garment='All';
  const look=id=>D.looks.find(l=>l.id===id);
  const piece=id=>D.pieces.find(p=>p.id===id);
  const seasonsForFamily=f=>[...new Set((f.looks||[]).map(look).filter(Boolean).flatMap(l=>l.seasons||['Summer']))];
  const read=(k,f=null)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(e){return f}};
  function allCards(){return[...document.querySelectorAll('a.card')]}
  const garmentKind=window.FITS_KINDS.garment;
  function cardFamily(card){try{const id=new URL(card.getAttribute('href'),location.href).searchParams.get('family')||card.dataset.family;return D.families.find(f=>f.id===id)}catch(_){return null}}
  function familyHasGarment(card,choice=garment){if(choice==='All')return true;const f=cardFamily(card);return(f?.looks||[]).map(look).filter(Boolean).some(l=>(l.pieces||[]).some(id=>garmentKind(piece(id))===choice))}
  function matches(card,occ=occasion,sea=season,st=status){
    const tags=(card.dataset.tags||'').split(',').filter(Boolean),ss=(card.dataset.seasons||'').split(',').filter(Boolean),done=card.dataset.completeness;
    const occasionMatch=occ==='All'||tags.includes(occ);
    const statusMatch=st==='All'||st==='Favorites'&&card.dataset.saved==='yes'||st==='Hidden'&&card.dataset.hidden==='yes'||st==='Complete'&&['complete','adapted'].includes(done)||st==='Almost'&&done==='one'||st==='Missing'&&['some','all'].includes(done);
    return occasionMatch&&statusMatch&&(sea==='All'||ss.includes(sea))&&familyHasGarment(card);
  }
  function weatherSeason(){
    const w=read('fitsWeatherHome',null);if(!w)return null;
    const t=Number(w.temp),high=Number.isFinite(w.maxTemp)?Number(w.maxTemp):t,low=Number.isFinite(w.minTemp)?Number(w.minTemp):t;
    if(!Number.isFinite(high))return null;
    let recommended='Transitional';
    if(high<=12||(Number.isFinite(t)&&t<=8&&high<16))recommended='Cold';
    else if(high>=24&&(!Number.isFinite(t)||t>=18||high>=27))recommended='Summer';
    return{recommended,temp:Number.isFinite(t)?Math.round(t):null,high:Math.round(high),low:Number.isFinite(low)?Math.round(low):null};
  }
  window.getFitsWeatherSeason=()=>weatherSeason()?.recommended||null;
  function current(){return{occasion,status,season,garment,recommendedSeason:weatherSeason()?.recommended||null}}
  window.getFitsActiveFilters=current;
  function announce(){window.dispatchEvent(new CustomEvent('fits:filters-changed',{detail:current()}))}
  function updateChipCounts(){
    const cards=allCards();
    document.querySelectorAll('[data-season-choice]').forEach(btn=>{const s=btn.dataset.seasonChoice,n=cards.filter(c=>matches(c,occasion,s,status)).length;btn.querySelector('em')?.replaceChildren(document.createTextNode(String(n)))});
  }
  function updateWeatherHint(wrap){
    let hint=wrap.querySelector('.weather-season-hint');if(!hint){hint=document.createElement('div');hint.className='weather-season-hint';wrap.appendChild(hint)}
    const wx=weatherSeason();
    if(!wx){hint.textContent='Recommended uses wardrobe readiness until weather is enabled.';hint.dataset.season='';return}
    const range=wx.low!=null?`${wx.high}° / ${wx.low}°`:`${wx.high}°`;
    hint.textContent=`Recommended for ${wx.recommended} · ${range}`;
    hint.dataset.season=wx.recommended;
  }
  function ensureStyle(){
    if(document.getElementById('weather-season-hint-style'))return;
    const s=document.createElement('style');s.id='weather-season-hint-style';s.textContent='.weather-season-hint{margin:10px 0 0;padding:9px 11px;border-radius:11px;background:#e6ecef;color:#526570;font-size:10px;font-weight:700;line-height:1.35}.weather-season-hint[data-season]{color:#526570}';document.head.appendChild(s);
  }
  function apply(shouldAnnounce=true){
    let visible=0;
    allCards().forEach(card=>{const show=matches(card);card.classList.toggle('hidden',!show);if(show)visible++});
    const empty=document.querySelector('.empty');
    if(empty){empty.style.display=visible?'none':'block';empty.textContent=status==='Favorites'?'No favorite looks yet.':status==='Hidden'?'No hidden looks.':`No ${season==='All'?'':season.toLowerCase()+' '}${occasion==='All'?'':occasion.toLowerCase()+' '}looks${status==='Complete'?' you can wear now':status==='Almost'?' that are one piece away':status==='Missing'?' with several pieces missing':''} yet.`}
    const count=document.querySelector('.filter-result-count');if(count)count.textContent=`${visible} ${visible===1?'family':'families'}`;
    updateChipCounts();
    const wrap=document.querySelector('.season-filter-wrap');if(wrap)updateWeatherHint(wrap);
    if(shouldAnnounce)announce();
  }
  function enhance(){
    ensureStyle();
    const chips=document.querySelector('.chips');if(!chips)return;
    chips.classList.add('occasion-chips','occasion-row');
    const OCC=['Office','Weekend','Dinner','Travel'],STATUS=[['Favorites','Favs','Favorites'],['Hidden','Hidden','Hidden'],['Complete','Complete','Complete'],['Almost','Almost','Almost complete (one piece missing)'],['Missing','Missing','Missing some']];
    const statusIcon={Complete:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',Almost:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4v16a8 8 0 0 1 0-16Z"/></svg>',Missing:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v5M12 16h.01"/></svg>'};
    const chipHTML=(group,key,label,aria,active,svg)=>`<button class="chip" data-${group}="${key}" aria-label="${aria}" aria-pressed="${active}"><span class="filter-symbol">${svg}</span><span class="filter-name">${label}</span></button>`;
    // Row 1: occasions (tap the active one again to clear it). Row 2: favourites, hidden and how complete a look is.
    chips.innerHTML=OCC.map(o=>chipHTML('occasion-choice',o,o,o,o===occasion,icon(o))).join('');
    let statusRow=document.querySelector('.status-chips');
    if(!statusRow){statusRow=document.createElement('div');statusRow.className='chips occasion-chips status-chips';chips.after(statusRow)}
    statusRow.innerHTML=STATUS.map(([key,label,aria])=>chipHTML('status-choice',key,label,aria,key===status,key==='Favorites'?icon('Favorites'):key==='Hidden'?icon('Hidden'):statusIcon[key])).join('');
    let showAll=document.querySelector('.show-all-btn');
    if(!showAll){showAll=document.createElement('button');showAll.type='button';showAll.className='show-all-btn';showAll.textContent='Show all';statusRow.after(showAll)}
    const paint=()=>{
      const none=occasion==='All'&&status==='All'&&garment==='All';showAll.classList.toggle('active',none);showAll.setAttribute('aria-pressed',String(none));
      chips.querySelectorAll('[data-occasion-choice]').forEach(x=>{const on=x.dataset.occasionChoice===occasion;x.classList.toggle('active',on);x.setAttribute('aria-pressed',String(on))});
      statusRow.querySelectorAll('[data-status-choice]').forEach(x=>{const on=x.dataset.statusChoice===status;x.classList.toggle('active',on);x.setAttribute('aria-pressed',String(on))});
    };
    chips.querySelectorAll('[data-occasion-choice]').forEach(btn=>btn.onclick=e=>{e.preventDefault();const pick=btn.dataset.occasionChoice;occasion=occasion===pick?'All':pick;localStorage.setItem('fitsOccasionFilter',occasion);paint();apply()});
    statusRow.querySelectorAll('[data-status-choice]').forEach(btn=>btn.onclick=e=>{e.preventDefault();const pick=btn.dataset.statusChoice;status=status===pick?'All':pick;localStorage.setItem('fitsLookStatusFilter',status);paint();apply()});
    showAll.onclick=()=>{occasion='All';status='All';garment='All';localStorage.setItem('fitsOccasionFilter',occasion);localStorage.setItem('fitsLookStatusFilter',status);localStorage.setItem('fitsGarmentFilter',garment);document.querySelectorAll('[data-garment-choice]').forEach(x=>x.classList.toggle('active',x.dataset.garmentChoice===garment));paint();apply()};
    paint();
    D.families.forEach(f=>{
      const card=allCards().find(c=>{try{return new URL(c.getAttribute('href'),location.href).searchParams.get('family')===f.id}catch(e){return false}});
      if(card){
        const ss=seasonsForFamily(f);card.dataset.seasons=ss.join(',');
        const body=card.querySelector('.body');
        if(body&&!body.querySelector('.season-note')){const n=document.createElement('div'),layerable=(f.looks||[]).map(look).filter(Boolean).some(l=>l.winterLayerable);n.className='season-note';n.textContent=ss.join(' · ')+(layerable?' · add coat':'');body.appendChild(n)}
      }
    });
    let occLabel=document.querySelector('.occasion-filter-label');
    if(!occLabel){occLabel=document.createElement('div');occLabel.className='filter-label-row occasion-filter-label';occLabel.innerHTML='<span>Show</span><b>filter looks</b>';chips.before(occLabel)}
    let garmentWrap=document.querySelector('.garment-filter-wrap');
    if(!garmentWrap){
      garmentWrap=document.createElement('div');garmentWrap.className='garment-filter-wrap';
      garmentWrap.innerHTML=`<div class="filter-label-row"><span>Start with</span><b>find by garment</b></div><div class="season-chips garment-chips">${validGarment.map(x=>`<button class="chip garment-choice ${x===garment?'active':''}" data-garment-choice="${x}">${x==='All'?'Anything':x}</button>`).join('')}</div>`;
      occLabel.before(garmentWrap);
      garmentWrap.querySelectorAll('[data-garment-choice]').forEach(btn=>btn.onclick=()=>{garment=btn.dataset.garmentChoice;localStorage.setItem('fitsGarmentFilter',garment);garmentWrap.querySelectorAll('[data-garment-choice]').forEach(x=>x.classList.toggle('active',x.dataset.garmentChoice===garment));apply()});
    }else garmentWrap.querySelectorAll('[data-garment-choice]').forEach(x=>x.classList.toggle('active',x.dataset.garmentChoice===garment));
    let wrap=document.querySelector('.season-filter-wrap');
    if(!wrap){
      wrap=document.createElement('div');wrap.className='season-filter-wrap';
      wrap.innerHTML=`<div class="filter-label-row"><span>Season</span><b class="filter-result-count"></b></div><div class="season-chips">${validSeason.map(x=>`<button class="chip season-choice ${x===season?'active':''}" data-season-choice="${x}"><span>${x==='All'?'Recommended':x}</span><em></em></button>`).join('')}</div>`;
      occLabel.before(wrap);
      wrap.querySelectorAll('[data-season-choice]').forEach(btn=>btn.onclick=()=>{season=btn.dataset.seasonChoice;localStorage.setItem('fitsSeasonFilter',season);wrap.querySelectorAll('[data-season-choice]').forEach(x=>x.classList.toggle('active',x.dataset.seasonChoice===season));apply()});
    }else wrap.querySelectorAll('[data-season-choice]').forEach(x=>x.classList.toggle('active',x.dataset.seasonChoice===season));
    updateWeatherHint(wrap);
    apply(false);
  }
  const original=window.render;
  if(typeof original==='function')window.render=function(...args){const out=original.apply(this,args);enhance();announce();return out};
  window.addEventListener('fits:home-enhanced',()=>apply(false));
  window.addEventListener('fits:completeness-updated',()=>apply(false));
  enhance();announce();
})();
