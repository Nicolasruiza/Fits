/* Look detail: tap the look photo to see it full screen; tap again to go back.
   Uses event delegation because the detail screen re-renders the hero. */
(()=>{
  const css=`
  .hero img{cursor:zoom-in}
  .photo-zoom{position:fixed;inset:0;z-index:9999;background:#000;display:flex;align-items:center;justify-content:center;
    padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    opacity:0;transition:opacity .18s ease;cursor:zoom-out;touch-action:none;-webkit-tap-highlight-color:transparent}
  .photo-zoom.open{opacity:1}
  .photo-zoom img{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;display:block;
    transform:scale(.96);transition:transform .18s ease;user-select:none;-webkit-user-drag:none}
  .photo-zoom.open img{transform:scale(1)}`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  let layer=null, prevOverflow='';
  function open(img){
    if(layer)return;
    layer=document.createElement('div');
    layer.className='photo-zoom';
    layer.setAttribute('role','dialog');
    layer.setAttribute('aria-label','Photo, full screen. Tap to close.');
    const big=document.createElement('img');
    big.src=img.currentSrc||img.src; big.alt=img.alt||'';
    layer.appendChild(big);
    layer.addEventListener('click',close);
    document.body.appendChild(layer);
    prevOverflow=document.documentElement.style.overflow;
    document.documentElement.style.overflow='hidden';
    requestAnimationFrame(()=>layer&&layer.classList.add('open'));
  }
  function close(){
    if(!layer)return;
    const l=layer; layer=null;
    document.documentElement.style.overflow=prevOverflow;
    l.classList.remove('open');
    setTimeout(()=>l.remove(),180);
  }
  /* click only fires on a tap, not after the hero's swipe-to-next-look gesture */
  document.addEventListener('click',e=>{
    const img=e.target.closest&&e.target.closest('.hero img');
    if(img&&img.naturalWidth)open(img);
  });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape')close(); });
  window.addEventListener('popstate',close);
})();
