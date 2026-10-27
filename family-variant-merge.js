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


  // Navy blazer over a white tee or polo with white sneakers: the trousers (navy, black or grey
  // chinos, dark denim) and tee vs polo are versions of one smart-casual idea.
  merge('family-navy-blazer-white-tee','Navy blazer + white top',['look-92','look-50','look-27','look-153','look-68'],'look-92');

  // Navy blazer over a collared shirt (white, striped or light blue): chinos, denim or dress trousers and
  // loafers, boots or cap-toes are versions of the same tailored idea.
  merge('family-navy-blazer-white-shirt','Navy blazer + shirt',['look-12','look-navy-blazer-striped-shirt-beige-chinos','look-31','look-navy-blazer-white-shirt-charcoal-dress','look-navy-blazer-white-shirt-cream-chinos','look-151','look-163','look-18','look-165','look-166'],'look-12');

  // A sweater over a collared shirt with beige chinos; cap-toes, loafers or white sneakers. The sweater,
  // shirt and shoes are the versions. (No "chinos" in the name: Detail strips it.) Includes look-38 and
  // look-75, which used to be their own "Navy crewneck + light trousers" card.
  merge('family-sweater-shirt-beige','Sweater over shirt + beige trousers',['look-118','look-119','look-124','look-127','look-128','look-126','look-navy-crewneck-white-shirt-beige-chinos','look-38','look-75','look-71','look-74'],'look-118');

  // Dark charcoal crewneck over a light blue dress shirt with brown cap-toes; dress trousers or black chinos.
  merge('family-charcoal-crew-lightblue','Charcoal crewneck + light blue shirt',['look-122','look-125'],'look-122');

  // Cream crewneck over a light blue dress shirt with cap-toes; black or navy trousers.
  merge('family-cream-crew-lightblue','Cream crewneck + light blue shirt',['look-129','look-136','look-120','look-cream-crewneck-lightblue-navy-dress-brown'],'look-129');

  // A sweater over a collared shirt with grey trousers (dress or chinos) and leather shoes; the sweater,
  // shirt, trousers and shoes are the versions.
  merge('family-sweater-shirt-grey','Sweater over shirt + grey trousers',['look-134','look-140','look-141','look-144','look-168','look-115','look-121','look-123','look-navy-vneck-lightblue-grey-dress','look-133','look-79'],'look-134');

  // Navy quarter-zip over a shirt with light chinos; loafers or white sneakers.
  merge('family-navy-quarterzip-shirt','Navy quarter-zip + shirt',['look-169','look-170','look-162'],'look-169');

  // Grey blazer over a white shirt; denim, navy dress trousers or cream chinos.
  merge('family-grey-blazer-white-shirt','Grey blazer + white shirt',['look-26','look-grey-blazer-white-shirt-navy-dress','look-46'],'look-26');

  // A light blue shirt (micro-check, dress or Oxford) on its own with beige chinos; the shoes are the versions.
  merge('family-lightblue-shirt-beige','Light blue shirt + beige trousers',['look-62','look-lightblue-dress-shirt-beige-chinos-loafers','look-116','look-lightblue-shirt-beige-chinos-brown-captoe','look-108','look-11','look-28'],'look-62');

  // Light blue dress shirt on its own with navy dress trousers; black or brown cap-toes.
  merge('family-lightblue-shirt-navy','Light blue shirt + navy trousers',['look-113','look-130'],'look-113');

  // White shirt on its own with navy dress trousers; brown cap-toes or navy brogues.
  merge('family-white-shirt-navy','White shirt + navy trousers',['look-131','look-161'],'look-131');

  // A sweater over a white shirt with jeans; sneakers or suede Chelsea boots.
  merge('family-sweater-shirt-denim','Sweater over shirt + denim',['look-navy-crewneck-white-shirt-blue-denim-taupe','look-87','look-85','look-86'],'look-navy-crewneck-white-shirt-blue-denim-taupe');

  // The brown suede jacket is the outfit; the top, trousers and shoes under it are its versions.
  merge('family-brown-suede-jacket','Brown suede jacket',['look-41','look-156','look-76','look-57','look-66','look-145','look-147','look-148'],'look-41');
})();
