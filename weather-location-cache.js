(()=>{
  const COORDS_KEY='fitsWeatherCoords';
  const WEATHER_KEY='fitsWeatherHome';
  const MAX_AGE=60*60*1000;
  const read=(key,fallback=null)=>{try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch(e){return fallback}};
  const setLoading=on=>{const b=document.getElementById('weatherBtn');if(b){b.classList.toggle('loading',!!on);b.disabled=!!on}};
  const resetHorizontalDrift=()=>{try{document.documentElement.scrollLeft=0;document.body.scrollLeft=0}catch(e){}};

  function buildWeather(d,location){
    const c=d.current,start=new Date(),idx=d.hourly.time.findIndex(t=>new Date(t)>=start),hours=[];
    const startIdx=Math.max(idx,0),remaining=d.hourly.time.length-startIdx,step=remaining>8?Math.ceil(remaining/8):1;
    for(let i=startIdx;i<d.hourly.time.length;i+=step)hours.push({time:d.hourly.time[i],temp:d.hourly.temperature_2m[i],rain:d.hourly.precipitation_probability[i]||0,code:d.hourly.weather_code[i]});
    const last=d.hourly.time.length-1;
    if(last>=startIdx&&!hours.some(h=>h.time===d.hourly.time[last]))hours.push({time:d.hourly.time[last],temp:d.hourly.temperature_2m[last],rain:d.hourly.precipitation_probability[last]||0,code:d.hourly.weather_code[last]});
    return {temp:c.temperature_2m,code:c.weather_code,currentRain:(c.rain||c.precipitation)>0,maxRain:Math.max(0,...d.hourly.precipitation_probability.map(v=>v||0)),maxTemp:d.daily?.temperature_2m_max?.[0],minTemp:d.daily?.temperature_2m_min?.[0],hours,location:location||'Your location',ts:Date.now()};
  }

  async function refreshAt(lat,lon,knownLocation){
    setLoading(true);
    try{
      const weatherPromise=fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,rain,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&forecast_days=1&temperature_unit=celsius&timezone=auto`).then(r=>r.json());
      const locationPromise=knownLocation?Promise.resolve(knownLocation):(typeof resolveLocation==='function'?resolveLocation(lat,lon):Promise.resolve('Your location'));
      const [d,location]=await Promise.all([weatherPromise,locationPromise]);
      const w=buildWeather(d,location);
      localStorage.setItem(WEATHER_KEY,JSON.stringify(w));
      localStorage.setItem('fitsWeather',JSON.stringify({t:w.temp,rainy:w.currentRain||w.maxRain>=40,location:w.location,ts:w.ts}));
      const saved=read(COORDS_KEY,{})||{};
      localStorage.setItem(COORDS_KEY,JSON.stringify({lat,lon,location:w.location,savedAt:saved.savedAt||Date.now()}));
      if(typeof render==='function')render(w);
      resetHorizontalDrift();
      bindControls();
    }catch(e){
      const cached=read(WEATHER_KEY,null);
      if(typeof render==='function')render(cached);
      resetHorizontalDrift();
      bindControls();
    }finally{setLoading(false)}
  }

  function requestCurrentLocation(){
    setLoading(true);
    if(!navigator.geolocation){setLoading(false);return}
    navigator.geolocation.getCurrentPosition(async pos=>{
      const {latitude:lat,longitude:lon}=pos.coords;
      let location='Your location';
      try{if(typeof resolveLocation==='function')location=await resolveLocation(lat,lon)}catch(e){}
      localStorage.setItem(COORDS_KEY,JSON.stringify({lat,lon,location,savedAt:Date.now()}));
      refreshAt(lat,lon,location);
    },()=>setLoading(false),{enableHighAccuracy:false,timeout:10000,maximumAge:24*60*60*1000});
  }

  function smartLoadWeather(){
    const saved=read(COORDS_KEY,null);
    if(saved&&Number.isFinite(saved.lat)&&Number.isFinite(saved.lon))refreshAt(saved.lat,saved.lon,saved.location);
    else requestCurrentLocation();
  }

  window.loadWeather=smartLoadWeather;
  window.refreshFitsLocation=requestCurrentLocation;

  function bindControls(){
    const loc=document.querySelector('.weather .location');
    if(loc&&!loc.dataset.locationBound){loc.dataset.locationBound='1';loc.title='Tap to update current location';loc.addEventListener('click',requestCurrentLocation)}
    const btn=document.getElementById('weatherBtn');
    if(btn&&!btn.dataset.smartWeatherBound){btn.dataset.smartWeatherBound='1';btn.onclick=smartLoadWeather}
  }
  new MutationObserver(bindControls).observe(document.documentElement,{childList:true,subtree:true});
  bindControls();
  resetHorizontalDrift();

  const saved=read(COORDS_KEY,null),cached=read(WEATHER_KEY,null);
  const cacheMissingDaily=cached&&(!Number.isFinite(cached.maxTemp)||!Array.isArray(cached.hours)||cached.hours.length<5);
  if(saved&&Number.isFinite(saved.lat)&&Number.isFinite(saved.lon)&&(!cached||Date.now()-cached.ts>MAX_AGE||cacheMissingDaily)){
    refreshAt(saved.lat,saved.lon,saved.location);
  }
})();
