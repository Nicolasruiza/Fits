(()=>{const D=window.FITS_DATA;const C=window.FITS_CLIMATE;if(!D||!C)return;
// Seasons come from the central climate rules (climate-rules.js). `seasons` keeps the legacy
// labels (Summer / Transitional / Cold) that the filters and cards already use.
(D.looks||[]).forEach(l=>{
  l.climate=C.classifyLook(l);
  l.seasons=l.climate.seasons.map(s=>C.legacySeason[s]);
  l.winterLayerable=!!window.FITS_WINTER_LAYERS?.canLayer(l);
  if(l.winterLayerable&&!l.seasons.includes('Cold'))l.seasons=[...l.seasons,'Cold'];
});
})();
