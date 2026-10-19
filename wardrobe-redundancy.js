(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const aliases={'beige-buttondown':'owned-cream-buttondown','stone-shirt':'owned-cream-buttondown','green-buttonup':'olive-buttondown'};

  Object.entries(aliases).forEach(([from,to])=>{
    D.looks.forEach(look=>{
      if(!Array.isArray(look.pieces))return;
      look.pieces=[...new Set(look.pieces.map(id=>id===from?to:id))];
      if(from==='beige-buttondown'||from==='stone-shirt')look.name=look.name.replace(/Beige shirt|Stone shirt/i,'Cream shirt');
      if(from==='green-buttonup')look.name=look.name.replace(/Green button-up/i,'Olive button-down');
    });
    const oldPiece=D.pieces.find(p=>p.id===from),kept=D.pieces.find(p=>p.id===to);
    if(oldPiece&&kept&&oldPiece.status==='owned')kept.status='owned';
    D.pieces=D.pieces.filter(p=>p.id!==from);
  });

  const dressLookIds=new Set(['look-20','look-62']);
  D.looks.forEach(look=>{
    if(!dressLookIds.has(look.id)||!look.pieces?.includes('light-blue-oxford'))return;
    look.pieces=look.pieces.map(id=>id==='light-blue-oxford'?'owned-lightblue-microcheck-shirt':id);
    look.name=look.name.replace(/Light blue Oxford|Light blue shirt/i,'Light blue micro-check shirt');
  });

  const roles={
    'owned-lightblue-microcheck-shirt':{label:'Dress shirt · tailored office',note:'The sharper light-blue option for blazers, dress trousers and more formal office looks.'},
    'light-blue-oxford':{label:'Oxford · smart casual',note:'A sturdier, more relaxed shirt for chinos, denim, knitwear and unstructured layers.'},
    'striped-blue-linen-shirt':{label:'Linen · warm weather',note:'The breathable summer option for shorts, travel and casual hot-weather looks.'},
    'owned-cream-buttondown':{label:'Neutral shirt · versatile layer',note:'One cream shirt now covers the former beige and stone suggestions across casual and dressed-up looks.'},
    'olive-buttondown':{label:'Casual shirt · earthy neutral',note:'One olive shirt now covers both green suggestions without duplicating the same wardrobe role.'}
  };
  Object.entries(roles).forEach(([id,meta])=>{const p=D.pieces.find(x=>x.id===id);if(p)Object.assign(p,{styleRole:meta.label,styleNote:meta.note})});

  try{
    const wardrobe=JSON.parse(localStorage.getItem('fitsWardrobe')||'{}');let changed=false;
    Object.entries(aliases).forEach(([from,to])=>{if(!Object.hasOwn(wardrobe,from))return;if(wardrobe[from]==='owned')wardrobe[to]='owned';delete wardrobe[from];changed=true});
    if(changed)localStorage.setItem('fitsWardrobe',JSON.stringify(wardrobe));
    ['fitsWishlistPieces','fitsHiddenPieces'].forEach(key=>{const values=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(values))return;const migrated=[...new Set(values.map(id=>aliases[id]||id))];if(migrated.join('|')!==values.join('|'))localStorage.setItem(key,JSON.stringify(migrated))});
    const swaps=JSON.parse(localStorage.getItem('fitsClosetSwaps')||'{}');let swapsChanged=false;
    Object.values(swaps).forEach(map=>Object.entries(map||{}).forEach(([original,replacement])=>{const nextOriginal=aliases[original]||original,nextReplacement=aliases[replacement]||replacement;if(nextOriginal!==original){delete map[original];map[nextOriginal]=nextReplacement;swapsChanged=true}else if(nextReplacement!==replacement){map[original]=nextReplacement;swapsChanged=true}}));
    if(swapsChanged)localStorage.setItem('fitsClosetSwaps',JSON.stringify(swaps));
  }catch(_){/* The catalog still works when storage is unavailable. */}
})();
