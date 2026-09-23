(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const validOcc=['All','Office','Weekend','Dinner','Travel'],validSeason=['All','Summer','Transitional','Cold'];
  let occasion=localStorage.getItem('fitsOccasionFilter')||'All',season=localStorage.getItem('fitsSeasonFilter')||'All';
  if(!validOcc.includes(occasion))occasion='All';
  if(!validSeason.includes(season))season='All';
  const look=id=>D.looks.find(l=>l.id===id);
  const seasonsForFamily=f=>[...new Set((f.looks||[]).map(look).filter(Boolean).flatMap(l=>l.seasons||['Summer']))];
  const read=(k,f=null)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(e){return f}};
  function allCards(){return[...document.querySelectorAll('a.card')]}
  function matches(card,occ=occasion,sea=season){
    const tags=(card.dataset.tags||'').split(',').filter(Boolean),ss=(card.dataset.seasons||'').split(',').filter(Boolean);
    return(occ==='All'||tags.includes(occ))&&(sea==='All'||ss.includes(sea));
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
  function current(){return{occasion,season,recommendedSeason:weatherSeason()?.recommended||null}}
  window.getFitsActiveFilters=current;
  function announce(){window.dispatchEvent(new CustomEvent('fits:filters-changed',{detail:current()}))}
  function updateChipCounts(){
    const cards=allCards();
    document.querySelectorAll('[data-season-choice]').forEach(btn=>{const s=btn.dataset.seasonChoice,n=cards.filter(c=>matches(c,occasion,s)).length;btn.querySelector('em')?.replaceChildren(document.createTextNode(String(n)))});
    document.querySelectorAll('[data-filter]').forEach(btn=>{const o=btn.dataset.filter,n=cards.filter(c=>matches(c,o,season)).length;btn.querySelector('em')?.replaceChildren(document.createTextNode(String(n)))});
  }
  function updateWeatherHint(wrap){
    let hint=wrap.querySelector('.weather-season-hint');if(!hint){hint=document.createElement('div');hint.className='weather-season-hint';wrap.appendChild(hint)}
    const wx=weatherSeason();
    if(!wx){hint.textContent='Weather season unavailable';hint.dataset.season='';return}
    const range=wx.low!=null?`${wx.high}° / ${wx.low}°`:`${wx.high}°`;
    hint.textContent=`Weather suggests ${wx.recommended} · ${range}`;
    hint.dataset.season=wx.recommended;
  }
  function ensureStyle(){
    if(document.getElementById('weather-season-hint-style'))return;
    const s=document.createElement('style');s.id='weather-season-hint-style';s.textContent='.weather-season-hint{margin:7px 2px 0;font-size:11px;font-weight:750;letter-spacing:.01em;color:#66716b}.weather-season-hint[data-season="Summer"]{color:#8b6a2e}.weather-season-hint[data-season="Transitional"]{color:#536d5f}.weather-season-hint[data-season="Cold"]{color:#536b7a}';document.head.appendChild(s);
  }
  function apply(shouldAnnounce=true){
    let visible=0;
    allCards().forEach(card=>{const show=matches(card);card.classList.toggle('hidden',!show);if(show)visible++});
    const empty=document.querySelector('.empty');
    if(empty){empty.style.display=visible?'none':'block';empty.textContent=`No ${season==='All'?'':season.toLowerCase()+' '}${occasion==='All'?'looks':occasion.toLowerCase()+' looks'} yet.`}
    const count=document.querySelector('.filter-result-count');if(count)count.textContent=`${visible} ${visible===1?'family':'families'}`;
    updateChipCounts();
    const wrap=document.querySelector('.season-filter-wrap');if(wrap)updateWeatherHint(wrap);
    if(shouldAnnounce)announce();
  }
  function enhance(){
    ensureStyle();
    const chips=document.querySelector('.chips');if(!chips)return;
    chips.classList.add('occasion-chips');
    D.families.forEach(f=>{
      const card=allCards().find(c=>{try{return new URL(c.getAttribute('href'),location.href).searchParams.get('family')===f.id}catch(e){return false}});
      if(card){
        const ss=seasonsForFamily(f);card.dataset.seasons=ss.join(',');
        const body=card.querySelector('.body');
        if(body&&!body.querySelector('.season-note')){const n=document.createElement('div');n.className='season-note';n.textContent=ss.join(' · ');body.appendChild(n)}
      }
    });
    chips.querySelectorAll('[data-filter]').forEach(btn=>{
      const name=btn.dataset.filter;
      if(!btn.querySelector('em'))btn.innerHTML=`<span>${name}</span><em></em>`;
      btn.classList.toggle('active',name===occasion);
      btn.onclick=e=>{e.preventDefault();occasion=name;localStorage.setItem('fitsOccasionFilter',occasion);chips.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x.dataset.filter===occasion));apply()};
    });
    let occLabel=document.querySelector('.occasion-filter-label');
    if(!occLabel){occLabel=document.createElement('div');occLabel.className='filter-label-row occasion-filter-label';occLabel.innerHTML='<span>Occasion</span><b>combine with season</b>';chips.before(occLabel)}
    let wrap=document.querySelector('.season-filter-wrap');
    if(!wrap){
      wrap=document.createElement('div');wrap.className='season-filter-wrap';
      wrap.innerHTML=`<div class="filter-label-row"><span>Season</span><b class="filter-result-count"></b></div><div class="season-chips">${validSeason.map(x=>`<button class="chip season-choice ${x===season?'active':''}" data-season-choice="${x}"><span>${x==='All'?'All seasons':x}</span><em></em></button>`).join('')}</div>`;
      occLabel.before(wrap);
      wrap.querySelectorAll('[data-season-choice]').forEach(btn=>btn.onclick=()=>{season=btn.dataset.seasonChoice;localStorage.setItem('fitsSeasonFilter',season);wrap.querySelectorAll('[data-season-choice]').forEach(x=>x.classList.toggle('active',x.dataset.seasonChoice===season));apply()});
    }else wrap.querySelectorAll('[data-season-choice]').forEach(x=>x.classList.toggle('active',x.dataset.seasonChoice===season));
    updateWeatherHint(wrap);
    apply(false);
  }
  const original=window.render;
  if(typeof original==='function')window.render=function(...args){const out=original.apply(this,args);enhance();announce();return out};
  enhance();announce();
})();