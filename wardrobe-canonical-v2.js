(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const aliases={'brown-chelsea':'owned-brown-buckle-chelsea','owned-darkbrown-suede-captoe-shoe':'owned-darkbrown-suede-italian-laceup','charcoal-trousers':'dark-chinos','khaki-chinos':'beige-chinos','light-grey-trousers':'grey-trousers'};
  Object.entries(aliases).forEach(([from,to])=>{
    D.looks.forEach(look=>{if(Array.isArray(look.pieces))look.pieces=[...new Set(look.pieces.map(id=>id===from?to:id))]});
    const oldPiece=D.pieces.find(p=>p.id===from),kept=D.pieces.find(p=>p.id===to);
    if(oldPiece&&kept&&oldPiece.status==='owned')kept.status='owned';
    D.pieces=D.pieces.filter(p=>p.id!==from);
  });
  const blackLoafers=D.pieces.find(p=>p.id==='dark-loafers');if(blackLoafers)blackLoafers.name='Black loafers';
  try{
    const wardrobe=JSON.parse(localStorage.getItem('fitsWardrobe')||'{}');let changed=false;
    Object.entries(aliases).forEach(([from,to])=>{if(wardrobe[from]){if(wardrobe[from]==='owned')wardrobe[to]='owned';delete wardrobe[from];changed=true}});
    if(changed)localStorage.setItem('fitsWardrobe',JSON.stringify(wardrobe));
    const swaps=JSON.parse(localStorage.getItem('fitsClosetSwaps')||'{}');changed=false;
    Object.values(swaps).forEach(map=>Object.entries(map||{}).forEach(([original,replacement])=>{const nextOriginal=aliases[original]||original,nextReplacement=aliases[replacement]||replacement;if(nextOriginal!==original){delete map[original];map[nextOriginal]=nextReplacement;changed=true}else if(nextReplacement!==replacement){map[original]=nextReplacement;changed=true}}));
    if(changed)localStorage.setItem('fitsClosetSwaps',JSON.stringify(swaps));
  }catch(e){}
})();
