(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const blocked=new Set(['look-07']); // broken legacy asset: assets/source-04.jpg
  const keep=l=>l&&!blocked.has(l.id)&&!l.inspiration&&!!String(l.image||'').trim()&&!String(l.image||'').includes('inspiration-');
  D.looks=(D.looks||[]).filter(keep);
  const ids=new Set(D.looks.map(l=>l.id));
  D.families=(D.families||[]).map(f=>{
    f.looks=(f.looks||[]).filter(id=>ids.has(id));
    if(!ids.has(f.hero))f.hero=f.looks[0]||'';
    return f;
  }).filter(f=>f.looks.length);
})();
