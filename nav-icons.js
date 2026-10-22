(()=>{
  const icons={
    Looks:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.5a3 3 0 1 1 5.7 1.3c-.35.75-1.05 1.15-1.8 1.55l-.9.48v1.1"/><path d="M12 10.9 4.8 15a1.8 1.8 0 0 0 .9 3.35h12.6a1.8 1.8 0 0 0 .9-3.35L12 10.9Z"/></svg>`,
    Wardrobe:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2.2"/><path d="M12 3v18"/><path d="M9.2 12h.1M14.7 12h.1"/></svg>`,
    Unlock:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2.2"/><path d="M8.5 10V7.5A3.5 3.5 0 0 1 15 5.7"/><circle cx="12" cy="15" r="1.15"/><path d="M12 16.1v1.4"/></svg>`,
    Stats:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V11"/><path d="M12 20V4"/><path d="M19 20v-7"/><path d="M3 20h18"/></svg>`
  };
  function apply(){
    document.querySelectorAll('.nav').forEach(nav=>{
      let stats=[...nav.querySelectorAll('a')].find(a=>(a.textContent||'').trim().endsWith('Stats'));
      if(!stats){
        stats=document.createElement('a');
        stats.href='stats.html';
        stats.innerHTML='<b>◫</b>Stats';
        nav.appendChild(stats);
      }
      nav.querySelectorAll('a').forEach(a=>{
        const label=(a.textContent||'').trim();
        const key=Object.keys(icons).find(name=>label.endsWith(name));
        if(!key)return;
        let b=a.querySelector('b');
        if(!b){b=document.createElement('b');a.prepend(b)}
        if(!b.classList.contains('nav-icon')){b.className='nav-icon';b.innerHTML=icons[key]}
      });
    });
  }
  const style=document.createElement('style');
  style.textContent=`html body .nav.nav{position:fixed!important;left:50%!important;right:auto!important;bottom:calc(12px + env(safe-area-inset-bottom))!important;transform:translateX(-50%)!important;width:auto!important;max-width:calc(100vw - 24px)!important;height:auto!important;padding:6px!important;gap:4px!important;background:#20262a!important;border:0!important;border-radius:999px!important;display:flex!important;justify-content:center!important;align-items:center!important;z-index:9999!important;pointer-events:auto!important}html body .nav.nav a{flex:none!important;min-width:48px!important;min-height:48px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;padding:0 14px!important;border-radius:999px!important;color:#bfc7ca!important;font-size:0!important;font-weight:700!important;touch-action:manipulation;-webkit-tap-highlight-color:transparent;position:relative;z-index:10000;transition:background .18s ease,color .18s ease}html body .nav.nav a.active{background:#fff!important;color:#20262a!important;font-size:13px!important}html body .nav.nav a:active{transform:scale(.96)}html body .nav.nav .nav-icon{display:flex!important;align-items:center;justify-content:center;width:24px;height:24px;margin:0!important}html body .nav.nav .nav-icon svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}html body .nav.nav a.active .nav-icon svg{stroke-width:2.1}body{padding-bottom:calc(84px + env(safe-area-inset-bottom))}`;
  document.head.appendChild(style);
  new MutationObserver(()=>requestAnimationFrame(apply)).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',apply);
  apply();
})();
