(()=>{
  const D=window.FITS_DATA;if(!D?.looks)return;
  const bad={
    'look-43':{title:'White tee + beige chinos',subtitle:'Photo being replaced'},
    'look-47':{title:'White polo + olive trousers',subtitle:'Photo being replaced'}
  };
  function placeholder(title,subtitle){
    const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e8ece9"/><stop offset="1" stop-color="#cfd6d2"/></linearGradient>
      </defs>
      <rect width="800" height="1100" fill="url(#g)"/>
      <circle cx="400" cy="360" r="92" fill="#b9c2bd"/>
      <path d="M255 665c15-150 90-220 145-220s130 70 145 220v130H255z" fill="#aeb9b3"/>
      <text x="400" y="900" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="36" font-weight="700" fill="#26313a">${esc(title)}</text>
      <text x="400" y="950" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="22" fill="#65716a">${esc(subtitle)}</text>
    </svg>`;
    return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
  }
  D.looks.forEach(l=>{
    const x=bad[l.id];if(!x)return;
    l.image=placeholder(x.title,x.subtitle);
    l.imageStatus='needs-replacement';
  });
})();
