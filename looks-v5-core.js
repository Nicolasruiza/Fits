/* Fits v5 core: readiness, season, occasion and "best next buy" logic shared by
   looks.html and next-buy.html. Reads the same localStorage keys as the classic app,
   so wardrobe, favorites, hidden looks, swaps and wear history carry over. */
(()=>{
  const D=window.FITS_DATA,C=window.FITS_CLIMATE,S=window.FITS_SWAPS;
  if(!D)return;

  const read=(key,fallback)=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch(e){return fallback}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}};
  const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};

  const pieceById=new Map((D.pieces||[]).map(p=>[p.id,p]));
  const lookById=new Map((D.looks||[]).map(l=>[l.id,l]));
  const piece=id=>pieceById.get(id);
  const look=id=>lookById.get(id);

  function state(){
    return{
      wardrobe:read('fitsWardrobe',{}),
      swaps:read('fitsClosetSwaps',{}),
      saved:read('fitsSavedVariants',{}),
      hidden:new Set(read('fitsHiddenLooks',[])),
      wishlist:new Set(read('fitsWishlistPieces',[])),
      weather:read('fitsWeatherHome',null)
    };
  }
  const owned=(id,st)=>S?S.owned(id,st.wardrobe):(st.wardrobe[id]==='owned'||(!st.wardrobe[id]&&piece(id)?.status==='owned'));
  const missing=(l,st)=>S?S.missing(l,st.wardrobe,st.swaps):(l.pieces||[]).filter(id=>!owned(id,st));

  /* ---------- Season: decided by the week's weather, overridable for today only ---------- */
  const SEASONS=['Summer','Transition','Winter'];
  function seasonFromMonth(d=new Date()){const m=d.getMonth();return m>=5&&m<=7?'Summer':(m===11||m<=2)?'Winter':'Transition'}
  function autoSeason(w){
    if(!C)return seasonFromMonth();
    const week=Array.isArray(w?.week)?w.week.filter(d=>Number.isFinite(d.hi)&&Number.isFinite(d.lo)):[];
    if(week.length>=3){
      const votes={Summer:0,Transition:0,Winter:0};
      week.forEach(d=>{votes[C.weatherContext({temp:(d.hi+d.lo)/2,maxTemp:d.hi}).season]++});
      return Object.entries(votes).sort((a,b)=>b[1]-a[1]||(a[0]==='Transition'?-1:1))[0][0];
    }
    if(w&&Number.isFinite(Number(w.temp)))return C.weatherContext(w).season;
    return seasonFromMonth();
  }
  function season(st=state()){
    const o=read('fitsSeasonV5',null);
    if(o&&o.date===todayKey()&&SEASONS.includes(o.season))return{season:o.season,auto:false,autoSeason:autoSeason(st.weather)};
    const s=autoSeason(st.weather);return{season:s,auto:true,autoSeason:s};
  }
  function setSeason(value){
    if(!value)localStorage.removeItem('fitsSeasonV5');
    else write('fitsSeasonV5',{season:value,date:todayKey()});
  }
  function seasonMatch(l,s){
    const list=l.climate?.seasons||(C?C.classifyLook(l).seasons:['Transition']);
    return list.includes(s)||(s==='Winter'&&!!l.winterLayerable);
  }

  /* ---------- Occasion: weekday = Office, weekend = Weekend, overridable for today ---------- */
  const OCCASIONS=['Office','Weekend','Dinner','Travel'];
  const GARMENTS=['All','Sweaters','Shirts','Polos & tees','Jackets'];
  function autoOccasion(d=new Date()){const day=d.getDay();return day===0||day===6?'Weekend':'Office'}
  function occasion(){
    const o=read('fitsOccasionV5',null);
    if(o&&o.date===todayKey()&&(o.value==='All'||OCCASIONS.includes(o.value)))return{occasion:o.value,auto:false};
    return{occasion:autoOccasion(),auto:true};
  }
  function setOccasion(value){write('fitsOccasionV5',{value,date:todayKey()})}
  const occasionMatch=(l,o)=>o==='All'||(l.badges||[]).includes(o);
  function garmentKind(p){const name=(p?.name||'').toLowerCase();if(p?.category==='Outerwear')return'Jackets';if(p?.category!=='Top')return null;if(/sweater|crew[- ]?neck|v-neck|quarter[- ]?zip|turtleneck|cardigan/.test(name))return'Sweaters';if(/shirt|oxford|button/.test(name))return'Shirts';if(/polo|t-shirt|tee|henley/.test(name))return'Polos & tees';return null}
  const garmentMatch=(l,g)=>!g||g==='All'||(l.pieces||[]).some(id=>garmentKind(piece(id))===g);

  /* ---------- Warmth label and sort ---------- */
  function feel(l){
    const t=l.climate?.thermal||['Mild'];
    if(t.length===1)return t[0];
    return t.includes('Mild')?'Mild':t[0];
  }
  const warmth=l=>Number(l.climate?.warmth)||0;

  /* ---------- Families: one card per family, showing its closest variant ---------- */
  function familyCards(opts={}){
    const st=opts.state||state(),s=opts.season,o=opts.occasion||'All',g=opts.garment||'All',includeHidden=!!opts.hiddenOnly;
    const out=[];
    (D.families||[]).forEach(f=>{
      const variants=(f.looks||[]).map(look).filter(Boolean)
        .filter(l=>includeHidden?st.hidden.has(l.id):!st.hidden.has(l.id))
        .filter(l=>!s||seasonMatch(l,s))
        .filter(l=>occasionMatch(l,o))
        .filter(l=>garmentMatch(l,g));
      if(!variants.length)return;
      const ranked=variants.map(l=>({look:l,missing:missing(l,st)}))
        .sort((a,b)=>a.missing.length-b.missing.length||(st.saved[b.look.id]?1:0)-(st.saved[a.look.id]?1:0)||(a.look.id===f.hero?-1:b.look.id===f.hero?1:0));
      const best=ranked[0];
      out.push({family:f,look:best.look,missing:best.missing,saved:variants.some(l=>st.saved[l.id])});
    });
    return out;
  }
  function sortByWarmth(cards,dir){
    const k=dir==='colder'?-1:1;
    return[...cards].sort((a,b)=>k*(warmth(a.look)-warmth(b.look)));
  }

  /* ---------- Best next buy ----------
     Rank each missing piece by the looks where it is the LAST missing piece (wearable the
     day it arrives). Ties go to the piece that appears in more looks. Hidden looks never count. */
  function nextBuys(st=state()){
    const looks=(D.looks||[]).filter(l=>!st.hidden.has(l.id));
    const stats=new Map();
    const get=id=>{if(!stats.has(id))stats.set(id,{id,piece:piece(id),completes:[],appears:[],closer:{1:[],2:[]}});return stats.get(id)};
    looks.forEach(l=>{
      const m=missing(l,st);
      m.forEach(id=>{
        const s=get(id);s.appears.push(l);
        if(m.length===1)s.completes.push(l);
        else if(m.length===2)s.closer[1].push(l);
        else if(m.length===3)s.closer[2].push(l);
      });
    });
    return[...stats.values()].filter(s=>s.piece&&s.completes.length)
      .sort((a,b)=>b.completes.length-a.completes.length||b.appears.length-a.appears.length);
  }
  // Best second piece to buy together with `id`: maximises looks that become complete.
  function betterTogether(id,st=state()){
    const looks=(D.looks||[]).filter(l=>!st.hidden.has(l.id));
    const partners=new Map();
    looks.forEach(l=>{
      const m=missing(l,st);
      if(m.length===2&&m.includes(id)){const other=m.find(x=>x!==id);partners.set(other,(partners.get(other)||[]).concat(l))}
    });
    const solo=looks.filter(l=>{const m=missing(l,st);return m.length===1&&m[0]===id});
    const best=[...partners.entries()].sort((a,b)=>b[1].length-a[1].length)[0];
    if(!best)return null;
    const partnerSolo=looks.filter(l=>{const m=missing(l,st);return m.length===1&&m[0]===best[0]});
    return{partner:piece(best[0]),pairLooks:best[1],total:solo.length+best[1].length+partnerSolo.length};
  }
  function pairsWithOwned(id,st=state()){
    const counts=new Map();
    (D.looks||[]).filter(l=>!st.hidden.has(l.id)&&(l.pieces||[]).includes(id)).forEach(l=>{
      (l.pieces||[]).forEach(p=>{if(p!==id&&owned(p,st)&&piece(p)?.category!=='Accessory')counts.set(p,(counts.get(p)||0)+1)});
    });
    return[...counts.entries()].sort((a,b)=>b[1]-a[1]).map(([p,n])=>({piece:piece(p),count:n})).filter(x=>x.piece);
  }
  const pieceImage=id=>(window.PIECE_IMAGES&&window.PIECE_IMAGES[id])||(window.FITS_CATALOG_IMAGES&&window.FITS_CATALOG_IMAGES[id])||'';
  const detailHref=l=>`detail.html?family=${encodeURIComponent(l.family||'')}&look=${encodeURIComponent(l.id)}`;

  const escHtml=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  /* The "Best next buy" card shown on Looks and on Wardrobe; both lead to next-buy.html. */
  function bestBuyCard(st=state()){
    const top=nextBuys(st)[0];
    if(!top)return'';
    const img=pieceImage(top.id),thumbs=top.completes.slice(0,5),more=top.completes.length-thumbs.length;
    return `<a class="v5-buy" href="next-buy.html?piece=${encodeURIComponent(top.id)}" data-action="open-buy">
      <div class="v5-buy-head">${img?`<img class="v5-buy-piece" src="${escHtml(img)}" alt="" onerror="this.classList.add('is-broken')">`:''}
        <div><span class="v5-kicker">Best next buy</span><strong>${escHtml(top.piece.name)}</strong><span>Makes ${top.completes.length} ${top.completes.length===1?'look':'looks'} fully wearable</span></div></div>
      <div class="v5-buy-thumbs">${thumbs.map(l=>`<img src="${escHtml(l.image)}" alt="" loading="lazy" onerror="this.classList.add('is-broken')">`).join('')}${more>0?`<span>+${more}</span>`:''}</div></a>`;
  }

  /* ---------- Light usage log for the A/B comparison (local only) ---------- */
  function track(event){
    const log=read('fitsV5Events',{}),day=todayKey(),ui=read('fitsUI','v5');
    log[day]=log[day]||{};log[day][ui]=log[day][ui]||{};
    log[day][ui][event]=(log[day][ui][event]||0)+1;
    const days=Object.keys(log).sort();while(days.length>120)delete log[days.shift()];
    write('fitsV5Events',log);
  }

  window.FITS_V5={bestBuyCard,read,write,todayKey,piece,look,state,owned,missing,SEASONS,OCCASIONS,GARMENTS,season,setSeason,autoSeason,seasonMatch,occasion,setOccasion,occasionMatch,garmentMatch,feel,warmth,familyCards,sortByWarmth,nextBuys,betterTogether,pairsWithOwned,pieceImage,detailHref,track};
})();
