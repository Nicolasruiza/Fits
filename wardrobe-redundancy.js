(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const aliases={'beige-buttondown':'owned-cream-buttondown','stone-shirt':'owned-cream-buttondown','green-buttonup':'olive-buttondown','cognac-suede-jacket':'brown-suede-jacket','striped-blue-linen-shirt':'owned-lightblue-weekend-shirt','owned-lightblue-microcheck-shirt':'owned-lightblue-weekend-shirt'};

  // The striped linen and micro-check shirts are one real shirt: a light blue Massimo Dutti weekend shirt.
  const weekendShirtName=/Blue striped linen shirt|Striped linen shirt|Blue striped shirt|Light blue micro-check shirt/i;

  Object.entries(aliases).forEach(([from,to])=>{
    D.looks.forEach(look=>{
      if(!Array.isArray(look.pieces))return;
      look.pieces=[...new Set(look.pieces.map(id=>id===from?to:id))];
      if(from==='beige-buttondown'||from==='stone-shirt')look.name=look.name.replace(/Beige shirt|Stone shirt/i,'Cream shirt');
      if(from==='green-buttonup')look.name=look.name.replace(/Green button-up/i,'Olive button-down');
      if(from==='cognac-suede-jacket')look.name=look.name.replace(/Cognac suede jacket/i,'Brown suede jacket');
      if(to==='owned-lightblue-weekend-shirt')look.name=look.name.replace(weekendShirtName,'Light blue weekend shirt');
    });
    const oldPiece=D.pieces.find(p=>p.id===from),kept=D.pieces.find(p=>p.id===to);
    if(oldPiece&&kept&&oldPiece.status==='owned')kept.status='owned';
    D.pieces=D.pieces.filter(p=>p.id!==from);
  });

  D.families.forEach(f=>{f.name=f.name.replace(/Cognac suede/i,'Brown suede').replace(weekendShirtName,'Light blue weekend shirt')});

  const dressLookIds=new Set(['look-20','look-62']);
  D.looks.forEach(look=>{
    if(!dressLookIds.has(look.id)||!look.pieces?.includes('light-blue-oxford'))return;
    look.pieces=look.pieces.map(id=>id==='light-blue-oxford'?'owned-lightblue-weekend-shirt':id);
    look.name=look.name.replace(/Light blue Oxford|Light blue shirt/i,'Light blue weekend shirt');
  });

  const roles={
    'owned-lightblue-weekend-shirt':{label:'Casual shirt · light blue',note:'A Massimo Dutti shirt, neither a dress shirt nor an Oxford, for the office and the weekend, from spring to autumn, with chinos, denim and knitwear.'},
    'light-blue-dress-shirt':{label:'Dress shirt · solid light blue',note:'A smooth solid dress shirt for tailored trousers and sharper office combinations.'},
    'light-blue-oxford':{label:'Oxford · smart casual',note:'A sturdier, more relaxed shirt for chinos, denim, knitwear and unstructured layers.'},
    'black-dress-trousers':{label:'Dress trousers · black',note:'Tailored black trousers for the most formal dark combinations.'},
    'dark-charcoal-dress-trousers':{label:'Dress trousers · dark charcoal',note:'Near-black tailored trousers that remain visibly grey beside black pieces.'},
    'grey-dress-trousers':{label:'Dress trousers · grey',note:'Medium-grey tailored trousers with a pressed crease.'},
    'navy-dress-trousers':{label:'Dress trousers · navy',note:'Tailored navy trousers for dress-shirt and cap-toe combinations.'},
    'owned-cream-buttondown':{label:'Neutral shirt · versatile layer',note:'One cream shirt now covers the former beige and stone suggestions across casual and dressed-up looks.'},
    'olive-buttondown':{label:'Casual shirt · earthy neutral',note:'One olive shirt now covers both green suggestions without duplicating the same wardrobe role.'},
    'brown-suede-jacket':{label:'Suede jacket · warm brown',note:'One brown suede jacket covers the dark-brown and cognac references across all associated looks.'}
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
