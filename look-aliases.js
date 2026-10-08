(()=>{
  const aliases=window.FITS_DATA?.lookAliases||{};
  // Merge saved state before any page reads it. Removing the migrated keys
  // makes repeated visits idempotent without restoring dates the user undoes.
  try{
    const read=key=>JSON.parse(localStorage.getItem(key)||'{}');
    const wear=read('fitsWearHistory'),saved=read('fitsSavedVariants');
    let wearChanged=false,savedChanged=false;
    Object.entries(aliases).forEach(([from,to])=>{
      if(Array.isArray(wear[from])){
        wear[to]=[...new Set([...(wear[to]||[]),...wear[from]])].sort();
        delete wear[from];wearChanged=true;
      }
      if(Object.hasOwn(saved,from)){
        saved[to]=Boolean(saved[to]||saved[from]);
        delete saved[from];savedChanged=true;
      }
    });
    if(wearChanged)localStorage.setItem('fitsWearHistory',JSON.stringify(wear));
    if(savedChanged)localStorage.setItem('fitsSavedVariants',JSON.stringify(saved));
    const pick=JSON.parse(localStorage.getItem('fitsDailyPick')||'null');
    if(pick&&aliases[pick.lookId]){
      pick.lookId=aliases[pick.lookId];
      localStorage.setItem('fitsDailyPick',JSON.stringify(pick));
    }
  }catch(_){/* Storage may be disabled; the catalog and links still work. */}
})();
