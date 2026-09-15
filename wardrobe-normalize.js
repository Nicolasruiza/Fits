(()=>{
  const D=window.FITS_DATA;
  if(!D)return;

  // Canonical wardrobe IDs. These are true semantic duplicates, not merely similar colors.
  const aliases={
    'navy-casual-jacket':'navy-bomber',
    'dark-chelsea':'black-chelsea'
  };

  Object.entries(aliases).forEach(([from,to])=>{
    D.looks.forEach(l=>{
      if(!Array.isArray(l.pieces))return;
      l.pieces=[...new Set(l.pieces.map(id=>id===from?to:id))];
    });
    const fromPiece=D.pieces.find(p=>p.id===from);
    const toPiece=D.pieces.find(p=>p.id===to);
    if(fromPiece&&toPiece){
      // Preserve an explicit owned state if the duplicate carried it.
      if(fromPiece.status==='owned')toPiece.status='owned';
      D.pieces=D.pieces.filter(p=>p.id!==from);
    }
  });

  // Make dark blues explicit by garment type so Wardrobe does not show ambiguous labels.
  const labels={
    'navy-trousers':'Navy chinos',
    'dark-denim':'Dark indigo jeans',
    'blue-denim':'Blue jeans',
    'dark-chinos':'Dark charcoal chinos',
    'charcoal-trousers':'Charcoal chinos',
    'black-chelsea':'Black leather Chelsea boots',
    'navy-bomber':'Navy casual jacket'
  };
  Object.entries(labels).forEach(([id,name])=>{const p=D.pieces.find(x=>x.id===id);if(p)p.name=name;});

  // Guard against duplicate piece IDs introduced by historical batches.
  const seen=new Set();
  D.pieces=D.pieces.filter(p=>{if(seen.has(p.id))return false;seen.add(p.id);return true;});
})();
