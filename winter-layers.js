(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const safe=(key,fallback)=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch(e){return fallback}};
  const piece=id=>(D.pieces||[]).find(p=>p.id===id);
  const text=p=>`${p?.name||''} ${p?.category||''}`.toLowerCase();
  const isWinterCoat=p=>/overcoat|topcoat|wool coat|winter coat|parka|puffer|trench|gab[aá]n/.test(text(p));
  const isOuterLayer=p=>/overcoat|topcoat|coat|parka|puffer|trench|gab[aá]n|jacket|blazer|overshirt|bomber/.test(text(p));
  const isWarmBase=p=>{const C=window.FITS_CLIMATE;return C?['knit','heavy-knit','cardigan'].includes(C.classify(p).cls):/sweater|v-neck|quarter[- ]?zip|knit|cardigan|turtleneck/.test(text(p))};
  const wardrobe=()=>safe('fitsWardrobe',{});
  const owned=(p,w=wardrobe())=>w[p.id]==='owned'||(!w[p.id]&&p.status==='owned');
  const piecesFor=look=>(look?.pieces||[]).map(piece).filter(Boolean);
  const hasWinterCoat=look=>piecesFor(look).some(isWinterCoat);
  const canLayer=look=>{
    const ps=piecesFor(look);
    return !!look&&!ps.some(isOuterLayer)&&ps.some(isWarmBase)&&ps.some(p=>p.category==='Pants')&&!ps.some(p=>/shorts?/i.test(p.name));
  };
  const coats=()=>D.pieces.filter(isWinterCoat);
  const ownedCoats=()=>coats().filter(p=>owned(p));
  const selections=()=>safe('fitsWinterLayers',{});
  const selected=look=>{
    const id=selections()[look?.id],p=piece(id);
    return p&&isWinterCoat(p)&&owned(p)?p:null;
  };
  const choose=(lookId,pieceId)=>{
    const next=selections();
    if(pieceId)next[lookId]=pieceId;else delete next[lookId];
    localStorage.setItem('fitsWinterLayers',JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('fits:winter-layer-changed',{detail:{lookId,pieceId:pieceId||null}}));
  };
  window.FITS_WINTER_LAYERS={isWinterCoat,isOuterLayer,hasWinterCoat,canLayer,coats,ownedCoats,selected,choose,owned};
})();
