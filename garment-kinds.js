/* FITS garment groups: the one place that decides which filter a piece belongs to.
   Wardrobe's category chips use every group; the Looks "Start with" chips (v5 and classic) use the tops
   and layers. Checks run in order, so a more specific name is tested before a broader one. */
(()=>{
  const KINDS=['Shirts','Tees & polos','Knitwear','Blazers','Outerwear','Pants','Shorts','Shoes','Accessories'];
  const LOOK_GARMENTS=['Shirts','Tees & polos','Knitwear','Blazers','Outerwear'];
  // Group names saved by earlier versions of the Looks filter.
  const LEGACY={Sweaters:'Knitwear','Polos & tees':'Tees & polos',Jackets:'Outerwear'};
  function kind(p){
    const t=`${p?.name||''} ${p?.category||''} ${p?.styleRole||''}`.toLowerCase();
    if(/belt|watch|accessor|\btie\b|scarf|wallet/.test(t))return'Accessories';
    if(/shoe|sneaker|loafer|boot|chelsea|derb|brogue|wingtip|footwear|espadrille|cap-toe|lace-up/.test(t))return'Shoes';
    // Before Knitwear and Shirts: "crew-neck T-shirt", "knit polo" and "polo shirt" are tees and polos.
    if(/t-shirt|\btee\b|polo|henley/.test(t))return'Tees & polos';
    // Before Outerwear: cardigans are stored in the Outerwear category but are knitwear.
    if(/sweater|crewneck|crew-neck|v-neck|quarter-zip|quarter zip|cardigan|turtleneck|knit/.test(t))return'Knitwear';
    if(/blazer/.test(t))return'Blazers';
    if(/overshirt|jacket|coat|outerwear|bomber/.test(t))return'Outerwear';
    if(/shirt|button-down|button down|button-up|button up|oxford|gingham|check/.test(t))return'Shirts';
    if(/short/.test(t))return'Shorts';
    if(/denim|jean|chino|trouser|pants/.test(t))return'Pants';
    return p?.category==='Pants'?'Pants':p?.category==='Shoes'?'Shoes':'Accessories';
  }
  const garment=p=>{const k=p?kind(p):null;return LOOK_GARMENTS.includes(k)?k:null};
  const migrate=name=>LEGACY[name]||name;
  window.FITS_KINDS={KINDS,LOOK_GARMENTS,kind,garment,migrate};
})();
