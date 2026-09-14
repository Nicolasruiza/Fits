(()=>{
  const D=window.FITS_DATA;if(!D)return;
  function map(){return window.PIECE_IMAGES||window.FITS_CATALOG_IMAGES||{}}
  function sync(){
    document.querySelectorAll('.piece').forEach(card=>{
      const name=card.querySelector('strong')?.textContent?.trim();
      if(!name)return;
      const p=(D.pieces||[]).find(x=>x.name===name);
      if(!p)return;
      const src=map()[p.id];
      if(!src)return;
      const box=card.querySelector('.piece-photo');
      if(!box)return;
      let img=box.querySelector('img');
      if(!img){img=document.createElement('img');img.alt=p.name;img.loading='lazy';box.replaceChildren(img)}
      if(img.src!==src)img.src=src;
    });
  }
  sync();
  new MutationObserver(sync).observe(document.getElementById('root')||document.body,{childList:true,subtree:true});
})();
