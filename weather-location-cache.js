(()=>{
  const COORDS_KEY='fitsWeatherCoords';
  const WEATHER_KEY='fitsWeatherHome';
  const MAX_AGE=60*60*1000;
  const read=(key,fallback=null)=>{try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch(e){return fallback}};
  const setLoading=on=>{const b=document.getElementById('weatherBtn');if(b){b.classList.toggle('loading',!!on);b.disabled=!!on}};

  async function refreshAt(lat,lon,knownLocation){
    setLoading(true);
    try{
      const start=new Date();
      const weatherPromise=fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,rain,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&forecast_days=1&temperature_unit=celsius&timezone=auto`).then(r=>r.json());
      const locationPromise=knownLocation?Promise.resolve(knownLocation):(typeof resolveLocation==='function'?resolveLocation(lat,lon):Promise.resolve('Your location'));
      const [d,location]=await Promise.all([weatherPromise,locationPromise]);
      const c=d.current,idx=d.hourly.time.findIndex(t=>new Date(t)>=start),hours=[];
      for(let i=Math.max(idx,0);i<Math.min((idx<0?0:idx)+4,d.hourly.time.length);i++)hours.push({time:d.hourly.time[i],temp:d.hourly.temperature_2m[i],rain:d.hourly.precipitation_probability[i]||0,code:d.hourly.weather_code[i]});
      const maxRain=Math.max(0,...hours.map(h=>h.rain));
      const w={temp:c.temperature_2m,code:c.weather_code,currentRain:(c.rain||c.precipitation)>0,maxRain,hours,location:location||'Your location',ts:Date.now()};
      localStorage.setItem(WEATHER_KEY,JSON.stringify(w));
      localStorage.setItem('fitsWeather',JSON.stringify({t:w.temp,rainy:w.currentRain||w.maxRain>=40,location:w.location,ts:w.ts}));
      const saved=read(COORDS_KEY,{})||{};
      localStorage.setItem(COORDS_KEY,JSON.stringify({lat,lon,location:w.location,savedAt:saved.savedAt||Date.now()}));
      if(typeof render==='function')render(w);
    }catch(e){
      const cached=read(WEATHER_KEY,null);
      if(typeof render==='function')render(cached);
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

  // Replace the original GPS-every-time behavior. Refresh now reuses the last
  // approved location; tapping the location label itself updates GPS explicitly.
  window.loadWeather=smartLoadWeather;
  window.refreshFitsLocation=requestCurrentLocation;

  function bindLocationLabel(){
    const el=document.querySelector('.weather .location');
    if(!el||el.dataset.locationBound)return;
    el.dataset.locationBound='1';
    el.title='Tap to update current location';
    el.addEventListener('click',requestCurrentLocation);
  }
  new MutationObserver(bindLocationLabel).observe(document.documentElement,{childList:true,subtree:true});
  bindLocationLabel();

  // If we already know the location, refresh stale weather silently when the
  // Home Screen app opens. No new iOS location prompt is needed.
  const saved=read(COORDS_KEY,null),cached=read(WEATHER_KEY,null);
  if(saved&&Number.isFinite(saved.lat)&&Number.isFinite(saved.lon)&&(!cached||Date.now()-cached.ts>MAX_AGE)){
    refreshAt(saved.lat,saved.lon,saved.location);
  }
})();
