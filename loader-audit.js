(()=>{const D=window.FITS_DATA;if(!D)return;
const approved=new Set(['look-12','look-38','look-40','look-41','look-42','look-43','look-44','look-45','look-46']);
(D.looks||[]).forEach(l=>{if(approved.has(l.id))l.inspiration=false});
D.looks=(D.looks||[]).filter(l=>approved.has(l.id)||(!l.inspiration&&!String(l.image||'').includes('inspiration-')));
const ids=new Set(D.looks.map(x=>x.id));
D.families=(D.families||[]).filter(f=>(f.looks||[]).some(id=>ids.has(id)));
D.families.forEach(f=>{f.looks=(f.looks||[]).filter(id=>ids.has(id));if(!ids.has(f.hero))f.hero=f.looks[0]||'';});
})();