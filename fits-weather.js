/* Shared weather: one fetch/build/cache path for the classic home and the v5 Looks page.
   Storage keys are unchanged (fitsWeatherHome, fitsWeather, fitsWeatherCoords), so either UI
   can read what the other wrote. UI code stays in its own file and only calls into this. */
(()=>{
  const COORDS_KEY='fitsWeatherCoords',WEATHER_KEY='fitsWeatherHome',SUMMARY_KEY='fitsWeather',MAX_AGE=60*60*1000;
  const read=(key,fallback=null)=>{try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch(e){return fallback}};
  const write=(key,val)=>{try{localStorage.setItem(key,JSON.stringify(val))}catch(e){}};

  async function resolveLocation(lat,lon){
    try{const r=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`),d=await r.json();return d.locality||d.city||d.principalSubdivision||'Your location'}
    catch(e){return'Your location'}
  }

  function build(d,location){
    const c=d.current,today=(d.daily?.time||[])[0];
    const todayIdx=(d.hourly?.time||[]).map((t,i)=>i).filter(i=>!today||d.hourly.time[i].startsWith(today));
    const first=todayIdx.findIndex(i=>new Date(d.hourly.time[i])>=new Date());
    const rest=todayIdx.slice(Math.max(first,0));
    const step=rest.length>8?Math.ceil(rest.length/8):1,hours=[];
    const pick=i=>({time:d.hourly.time[i],temp:d.hourly.temperature_2m[i],rain:d.hourly.precipitation_probability[i]||0,code:d.hourly.weather_code[i]});
    for(let k=0;k<rest.length;k+=step)hours.push(pick(rest[k]));
    const last=rest[rest.length-1];
    if(last!==undefined&&!hours.some(h=>h.time===d.hourly.time[last]))hours.push(pick(last));
    return {
      temp:c.temperature_2m,apparent:c.apparent_temperature,humidity:c.relative_humidity_2m,wind:c.wind_speed_10m,code:c.weather_code,
      currentRain:(c.rain||c.precipitation)>0,maxRain:Math.max(0,...todayIdx.map(i=>d.hourly.precipitation_probability[i]||0)),
      maxTemp:d.daily?.temperature_2m_max?.[0],minTemp:d.daily?.temperature_2m_min?.[0],
      hours,location:location||'Your location',ts:Date.now(),
      week:(d.daily?.time||[]).map((t,i)=>({date:t,hi:d.daily.temperature_2m_max[i],lo:d.daily.temperature_2m_min[i],code:d.daily.weather_code[i]}))
    };
  }

  /* Fetch at coordinates, store everything the two UIs read, and return the weather. Throws on failure. */
  async function fetchAt(lat,lon,knownLocation){
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,rain,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&forecast_days=7&temperature_unit=celsius&timezone=auto`;
    const [d,location]=await Promise.all([fetch(url).then(r=>{if(!r.ok)throw new Error('weather '+r.status);return r.json()}),knownLocation?Promise.resolve(knownLocation):resolveLocation(lat,lon)]);
    const w=build(d,location);
    write(WEATHER_KEY,w);
    write(SUMMARY_KEY,{t:w.temp,rainy:w.currentRain||w.maxRain>=40,location:w.location,ts:w.ts});
    const saved=read(COORDS_KEY,{})||{};
    write(COORDS_KEY,{lat,lon,location:w.location,savedAt:saved.savedAt||Date.now()});
    return w;
  }

  /* Ask the browser for a position and remember it. Resolves {lat,lon,location}; rejects if unavailable or denied. */
  function locate(){
    return new Promise((resolve,reject)=>{
      if(!navigator.geolocation){reject(new Error('no geolocation'));return}
      navigator.geolocation.getCurrentPosition(async pos=>{
        const {latitude:lat,longitude:lon}=pos.coords,location=await resolveLocation(lat,lon);
        write(COORDS_KEY,{lat,lon,location,savedAt:Date.now()});
        resolve({lat,lon,location});
      },reject,{enableHighAccuracy:false,timeout:10000,maximumAge:24*60*60*1000});
    });
  }

  const coords=()=>{const c=read(COORDS_KEY,null);return c&&Number.isFinite(c.lat)&&Number.isFinite(c.lon)?c:null};
  const cached=()=>read(WEATHER_KEY,null);
  const isStale=c=>!c||Date.now()-(c.ts||0)>MAX_AGE||!Number.isFinite(c.maxTemp)||!Array.isArray(c.hours)||!Array.isArray(c.week);

  window.FitsWeather={COORDS_KEY,WEATHER_KEY,MAX_AGE,resolveLocation,build,fetchAt,locate,coords,cached,isStale};
})();
