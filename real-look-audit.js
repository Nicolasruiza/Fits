(()=>{
  const D=window.FITS_DATA;if(!D)return;
  // Keep the original records for history, but do not publish the legacy
  // personal-face set. Public Looks starts with the approved FITS model.
  const approvedLegacy=new Set(['look-01','look-03','look-04']);
  const blocked=new Set([
    ...Array.from({length:34},(_,index)=>`look-${String(index+1).padStart(2,'0')}`).filter(id=>!approvedLegacy.has(id)),
    'look-07' // broken legacy asset: assets/source-04.jpg
  ]);
  const page=document.body?.dataset?.page||'';
  const requiresLookImage=page!=='wardrobe'&&page!=='unlock';
  const keep=l=>l&&!blocked.has(l.id)&&!l.inspiration&&!String(l.image||'').includes('inspiration-')&&(!requiresLookImage||!!String(l.image||'').trim());
  D.looks=(D.looks||[]).filter(keep);
  const ids=new Set(D.looks.map(l=>l.id));
  D.families=(D.families||[]).map(f=>{
    f.looks=(f.looks||[]).filter(id=>ids.has(id));
    if(!ids.has(f.hero))f.hero=f.looks[0]||'';
    return f;
  }).filter(f=>f.looks.length);
})();
