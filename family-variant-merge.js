(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const merge=(id,name,lookIds,hero)=>{
    const ids=new Set(lookIds),looks=D.looks.filter(l=>ids.has(l.id));
    if(looks.length<2)return;
    D.families.forEach(f=>{f.looks=(f.looks||[]).filter(lookId=>!ids.has(lookId))});
    D.families=D.families.filter(f=>f.looks.length&&f.id!==id);
    looks.forEach(l=>{l.family=id});
    D.families.push({id,name,hero:looks.some(l=>l.id===hero)?hero:looks[0].id,looks:looks.map(l=>l.id)});
  };

  // Same sweater, light trousers and sneakers; the visible shirt is the useful variant.
  merge('family-navy-crewneck-light-trousers','Navy crewneck + light trousers',['look-38','look-75'],'look-75');

  // Same blazer, tee and sneakers. Denim makes it more casual; navy chinos make
  // it cleaner, but they are two versions of the same styling idea.
  merge('family-navy-blazer-white-tee','Navy blazer + white tee',['look-50','look-92'],'look-92');
})();
