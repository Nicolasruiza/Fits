(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const merge=(id,name,lookIds,hero)=>{
    // Variants keep the order given here; Detail compares each one with the first.
    const ids=new Set(lookIds),looks=lookIds.map(id=>D.looks.find(l=>l.id===id)).filter(Boolean);
    if(looks.length<2)return;
    D.families.forEach(f=>{f.looks=(f.looks||[]).filter(lookId=>!ids.has(lookId))});
    D.families=D.families.filter(f=>f.looks.length&&f.id!==id);
    looks.forEach(l=>{l.family=id});
    D.families.push({id,name,hero:looks.some(l=>l.id===hero)?hero:looks[0].id,looks:looks.map(l=>l.id)});
  };

  // Same sweater, light trousers and sneakers; the visible shirt is the useful variant.
  merge('family-navy-crewneck-light-trousers','Navy crewneck + light trousers',['look-38','look-75'],'look-75');

  // Navy blazer over a white tee or polo with white sneakers: the trousers (navy, black or grey
  // chinos, dark denim) and tee vs polo are versions of one smart-casual idea.
  merge('family-navy-blazer-white-tee','Navy blazer + white top',['look-92','look-50','look-27','look-153','look-68'],'look-92');

  // Navy blazer over a white button-up shirt: chinos, denim or dress trousers and loafers or cap-toes
  // are versions of the same tailored idea.
  merge('family-navy-blazer-white-shirt','Navy blazer + white shirt',['look-12','look-31','look-navy-blazer-white-shirt-charcoal-dress','look-navy-blazer-white-shirt-cream-chinos','look-151','look-163'],'look-12');

  // The brown suede jacket is the outfit; the top, trousers and shoes under it are its versions.
  merge('family-brown-suede-jacket','Brown suede jacket',['look-41','look-156','look-76','look-57','look-66','look-145','look-147','look-148'],'look-41');
})();
