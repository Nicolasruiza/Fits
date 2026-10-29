/* FITS climate rules: the single source for seasons (Summer / Transition / Winter)
   and thermal feel (Colder / Mild / Warmer). Seasons and thermal feel are different axes:
   a look is classified from the warmth of the garments it is made of, and a recommendation
   compares that against the real feels-like temperature, wind, rain and indoor/outdoor use.

   Tune everything in FITS_CLIMATE_CONFIG; no other file should hold climate thresholds. */
(()=>{
  const config={
    version:2,
    // Feels-like (°C) bands. A look belongs to a band when its comfort range overlaps it
    // by at least `minOverlapC`.
    thermal:{Colder:{max:10},Mild:{min:10,max:20},Warmer:{min:20}},
    seasons:{Winter:{max:10},Transition:{min:6,max:22},Summer:{min:21}},
    minOverlapC:3.2,
    // Comfort model: centre = baseC - perWarmthC * outfit warmth; range = centre ± halfRangeC.
    comfort:{baseC:30,perWarmthC:8,halfRangeC:4.5},
    // Weather adjustments to the feels-like value used for recommendations.
    weather:{windPerKphC:0.08,windMinKph:15,rainC:2,indoorOffsetC:-6,indoorMinC:5},
    // Added warmth for each extra layer beyond the first top (a shirt under a sweater still insulates).
    layerBonus:0.15,
    // Garment warmth by class, first matching rule wins. Unit: roughly "how many T-shirts of warmth".
    garments:[
      {cls:'shorts',slot:'bottom',warmth:0.2,test:/\bshorts\b|bermuda/},
      // Linen is materially lighter than the generic shirt/trouser rules below.
      {cls:'linen-shirt',slot:'top',warmth:0.35,test:/linen.*(?:shirt|button)|(?:shirt|button).*linen/},
      {cls:'linen-trousers',slot:'bottom',warmth:0.25,test:/linen.*(?:trousers?|pants)|(?:trousers?|pants).*linen/},
      {cls:'overcoat',slot:'outer',warmth:1.8,heavy:true,test:/overcoat|topcoat|wool coat|winter coat|parka|puffer|trench|gab[aá]n/},
      {cls:'leather-jacket',slot:'outer',warmth:0.9,test:/leather jacket|biker|suede jacket|racer/},
      {cls:'casual-jacket',slot:'outer',warmth:0.8,test:/bomber|casual jacket|jacket/},
      {cls:'blazer',slot:'outer',warmth:0.6,test:/blazer/},
      {cls:'overshirt',slot:'outer',warmth:0.6,test:/overshirt/},
      {cls:'cardigan',slot:'mid',warmth:0.9,test:/cardigan/},
      {cls:'heavy-knit',slot:'top',warmth:1.4,knit:true,test:/turtleneck|cable|ribbed|chunky|heavy sweater/},
      {cls:'knit',slot:'top',warmth:1.0,knit:true,test:/sweater|knit(?! polo)|quarter[- ]?zip|v-neck|crew[- ]?neck(?! t)(?!.*t-?shirt)/},
      {cls:'knit-polo',slot:'top',warmth:0.6,test:/knit polo/},
      {cls:'long-sleeve-light',slot:'top',warmth:0.6,test:/long[- ]sleeve|^(?!.*short).*henley/},
      {cls:'tee',slot:'top',warmth:0.3,test:/t-?shirt|tee\b|polo|short[- ]sleeve henley|short[- ]sleeve.*henley/},
      {cls:'shirt',slot:'top',warmth:0.6,test:/button|oxford|shirt|microcheck|micro-check|gingham|check|linen/},
      {cls:'trousers',slot:'bottom',warmth:0.5,test:/chinos?|trousers?|pants|jeans?|denim/},
      {cls:'boots',slot:'shoes',warmth:0.2,test:/boots?/},
      {cls:'open-shoes',slot:'shoes',warmth:-0.1,test:/espadrille|sandal/},
      {cls:'shoes',slot:'shoes',warmth:0,test:/shoes?|sneakers?|loafers?|boots?|derbies|brogues?|oxfords?|cap-?toe|lace-?up/},
      {cls:'accessory',slot:'accessory',warmth:0,test:/belt|scarf|tie\b/}
    ],
    // Per-piece corrections by canonical ID when the name alone is ambiguous.
    pieceOverrides:{}
  };

  const D=()=>window.FITS_DATA;
  const pieceById=id=>(D()?.pieces||[]).find(p=>p.id===id);
  const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
  const overlap=(lo,hi,band)=>Math.max(0,Math.min(hi,band.max??Infinity)-Math.max(lo,band.min??-Infinity));

  function classify(piece){
    const text=`${piece?.name||''}`.toLowerCase();
    const over=config.pieceOverrides[piece?.id];
    const found=over?config.garments.find(g=>g.cls===over):config.garments.find(g=>g.test.test(text)&&(g.slot!=='top'||piece?.category!=='Pants'));
    if(found)return found;
    return {cls:'unknown',slot:piece?.category==='Pants'?'bottom':'top',warmth:0.4};
  }
  const pieceWarmth=piece=>classify(piece).warmth;

  function lookPieces(look){return(look?.pieces||[]).map(pieceById).filter(Boolean)}
  function lookWarmth(look){
    const parts=lookPieces(look).map(classify);
    const layers=parts.filter(g=>g.slot==='top'||g.slot==='mid'||g.slot==='outer').length;
    const total=parts.reduce((sum,g)=>sum+g.warmth,0);
    return total+Math.max(0,layers-1)*config.layerBonus;
  }
  function comfortRange(warmth){
    const c=config.comfort,centre=c.baseC-c.perWarmthC*warmth;
    return[Math.round((centre-c.halfRangeC)*10)/10,Math.round((centre+c.halfRangeC)*10)/10];
  }
  function bandsFor(range,bands){
    return Object.entries(bands).filter(([,band])=>overlap(range[0],range[1],band)>=config.minOverlapC).map(([name])=>name);
  }
  // Closest band by centre when nothing overlaps enough (very thin or very heavy outfits).
  function nearest(range,bands){
    const mid=(range[0]+range[1])/2;
    return Object.entries(bands).map(([name,b])=>{
      const lo=b.min??-60,hi=b.max??60;
      return[name,mid<lo?lo-mid:mid>hi?mid-hi:0];
    }).sort((a,b)=>a[1]-b[1])[0][0];
  }
  // Hot weather / light outfits first, cold weather / layers last.
  const order={seasons:['Summer','Transition','Winter'],thermal:['Warmer','Mild','Colder']};
  const sortBy=(list,key)=>[...list].sort((a,b)=>order[key].indexOf(a)-order[key].indexOf(b));

  function classifyLook(look){
    const parts=lookPieces(look).map(classify),warmth=lookWarmth(look),range=comfortRange(warmth);
    let seasons=bandsFor(range,config.seasons),thermal=bandsFor(range,config.thermal);
    // Shorts with only light tops are unambiguously summer outfits, including an
    // open linen shirt over a tee; layer overlap must not relabel them Transition.
    const lightweightSummer=parts.some(g=>g.cls==='shorts')&&!parts.some(g=>g.heavy||g.slot==='mid'||g.slot==='outer'||g.knit);
    if(lightweightSummer){seasons=['Summer'];thermal=['Warmer']}
    if(!seasons.length)seasons=[nearest(range,config.seasons)];
    if(!thermal.length)thermal=[nearest(range,config.thermal)];
    return{warmth:Math.round(warmth*100)/100,comfortC:range,seasons:sortBy(seasons,'seasons'),thermal:sortBy(thermal,'thermal')};
  }
  // Names the legacy UI uses for the same three seasons.
  const legacySeason={Summer:'Summer',Transition:'Transitional',Winter:'Cold'};

  function feelsLike(w){
    const w_=config.weather,apparent=Number(w?.apparent);
    const raw=Number(w?.temp);
    // Apparent temperature from the weather API already folds in wind and humidity.
    let value=Number.isFinite(apparent)?apparent:raw;if(!Number.isFinite(value))return null;
    if(!Number.isFinite(apparent)){const wind=Number(w?.wind);if(Number.isFinite(wind)&&wind>w_.windMinKph)value-=(wind-w_.windMinKph)*w_.windPerKphC}
    if(w?.currentRain||w?.precip||w?.rain)value-=w_.rainC;
    return value;
  }
  // Season and thermal feel for the current weather. Indoor use shifts the effective temperature up.
  function weatherContext(w,opts={}){
    let t=feelsLike(w);
    if(t==null)return{season:'Transition',thermal:'Mild',feelsC:null,hasWeather:false};
    if(opts.indoor)t=Math.max(t-config.weather.indoorOffsetC,config.weather.indoorMinC);
    const high=Number(w?.maxTemp);
    const peak=Number.isFinite(high)?high:t;
    const season=peak>=25&&t>=18?'Summer':(peak<=7||(t<=4&&peak<=13))?'Winter':'Transition';
    const thermal=t<=config.thermal.Colder.max?'Colder':t>=config.thermal.Warmer.min?'Warmer':'Mild';
    return{season,thermal,feelsC:Math.round(t*10)/10,hasWeather:true};
  }
  // Smaller is better: distance between the look's comfort range and the effective temperature.
  function fitScore(look,effectiveC,opts={}){
    let [lo,hi]=(look.climate||classifyLook(look)).comfortC;
    if(opts.layerable)lo-=config.comfort.perWarmthC*config.garments.find(g=>g.cls==='overcoat').warmth;
    return effectiveC<lo?lo-effectiveC:effectiveC>hi?effectiveC-hi:0;
  }
  // Looks further than this from the effective temperature are not recommended at all.
  const eligibleWithinC=8;
  function eligible(look,w,opts={}){
    const ctx=weatherContext(w,opts);if(!ctx.hasWeather)return true;
    return fitScore(look,ctx.feelsC,{layerable:!!look.winterLayerable})<=eligibleWithinC;
  }
  function levelsForSeason(season){
    const bands=config.seasons[season]||config.seasons.Transition;
    const lo=bands.min??bands.max-12,hi=bands.max??lo+12;
    // Index 0 is the warmest weather (lightest outfit), index 4 the coldest.
    return[0,1,2,3,4].map(i=>config.comfort.baseC-(hi-(hi-lo)*(i/4)))
      .map(w=>w/config.comfort.perWarmthC);
  }
  function applyToDataset(){
    (D()?.looks||[]).forEach(look=>{look.climate=classifyLook(look)});
  }

  window.FITS_CLIMATE_CONFIG=config;
  window.FITS_CLIMATE={config,classify,pieceWarmth,lookWarmth,comfortRange,classifyLook,legacySeason,feelsLike,weatherContext,fitScore,eligible,levelsForSeason,applyToDataset};
})();
