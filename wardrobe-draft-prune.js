(()=>{
  const D=window.FITS_DATA;if(!D)return;
  // These came from reference/inspiration boards and do not yet have approved individual wardrobe photos.
  // Keep them in D.inspirations, but do not present them as finished Wardrobe inventory.
  const draft=new Set([
    'light-blue-linen-shirt','white-linen-shirt','pink-linen-shirt','beige-linen-shirt',
    'beige-shorts','denim-shorts','olive-shorts','grey-shorts',
    'cream-linen-trousers','taupe-linen-trousers','beige-espadrilles','brown-sandals','navy-slip-ons',
    'black-leather-jacket','brown-suede-jacket','blue-denim-jacket'
  ]);
  D.pieces=(D.pieces||[]).filter(p=>!draft.has(p.id));
})();
