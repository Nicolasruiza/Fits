(()=>{
  if(typeof piecePhoto!=='function')return;
  const previous=piecePhoto;
  const catalog=window.FITS_CATALOG_IMAGES||{};
  const focused={
    'black-polo':{src:'assets/look-52-black-polo-denim.webp?v=2',x:50,y:29,s:2.15},
    'black-tee':{src:'assets/look-61-black-tee-denim.webp?v=1',x:50,y:29,s:2.15},
    'olive-trousers':{src:'assets/look-59-cream-knit-olive.webp?v=1',x:50,y:65,s:2.05},
    'light-grey-trousers':{src:'assets/look-charcoal-lightgrey-v1.webp?v=1',x:50,y:65,s:2.05}
  };
  piecePhoto=function(p){
    if(p.id==='black-turtleneck'&&catalog['black-turtleneck']){
      return `<img src="${catalog['black-turtleneck']}" alt="${p.name}" loading="lazy">`;
    }
    const f=focused[p.id];
    if(f){
      return `<img class="piece-focus-img" src="${f.src}" alt="${p.name}" loading="lazy" style="--pf-x:${f.x}%;--pf-y:${f.y}%;--pf-s:${f.s}">`;
    }
    return previous(p);
  };
})();
