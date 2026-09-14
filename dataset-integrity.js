(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const uniq=(arr,key='id')=>{const seen=new Set();return (arr||[]).filter(x=>x&&x[key]&&!seen.has(x[key])&&seen.add(x[key]))};
  D.pieces=uniq(D.pieces);
  D.looks=uniq(D.looks).filter(l=>Array.isArray(l.pieces)&&l.pieces.length&&typeof l.image==='string'&&l.image.trim());
  const pieceIds=new Set(D.pieces.map(p=>p.id));
  const removedForMissingPieces=[];
  D.looks=D.looks.filter(l=>{const ok=l.pieces.every(id=>pieceIds.has(id));if(!ok)removedForMissingPieces.push(l.id);return ok});
  const lookIds=new Set(D.looks.map(l=>l.id));
  D.families=uniq(D.families).map(f=>{
    f.looks=[...new Set((f.looks||[]).filter(id=>lookIds.has(id)))];
    if(!lookIds.has(f.hero))f.hero=f.looks[0]||'';
    return f;
  }).filter(f=>f.looks.length&&f.hero);
  const familyIds=new Set(D.families.map(f=>f.id));
  D.looks=D.looks.filter(l=>familyIds.has(l.family));
  window.FITS_HEALTH={pieces:D.pieces.length,looks:D.looks.length,families:D.families.length,removedForMissingPieces};
})();
