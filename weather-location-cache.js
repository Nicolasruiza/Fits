(()=>{
  const W=window.FitsWeather;
  const setLoading=on=>{const b=document.getElementById('weatherBtn');if(b){b.classList.toggle('loading',!!on);b.disabled=!!on}};
  const resetHorizontalDrift=()=>{try{document.documentElement.scrollLeft=0;document.body.scrollLeft=0}catch(e){}};

  async function refreshAt(lat,lon,knownLocation){
    setLoading(true);
    try{
      const w=await W.fetchAt(lat,lon,knownLocation);
      if(typeof render==='function')render(w);
    }catch(e){
      if(typeof render==='function')render(W.cached());
    }finally{
      resetHorizontalDrift();
      bindControls();
      setLoading(false);
    }
  }

  async function requestCurrentLocation(){
    setLoading(true);
    try{const p=await W.locate();refreshAt(p.lat,p.lon,p.location)}
    catch(e){setLoading(false)}
  }

  function smartLoadWeather(){
    const saved=W.coords();
    if(saved)refreshAt(saved.lat,saved.lon,saved.location);
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

  const saved=W.coords();
  if(saved&&W.isStale(W.cached()))refreshAt(saved.lat,saved.lon,saved.location);
})();
