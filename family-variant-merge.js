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
  // Gives each look its own card, for automatic groupings that break the rule below.
  const split=lookIds=>lookIds.forEach(id=>{
    const l=D.looks.find(x=>x.id===id);if(!l)return;
    D.families.forEach(f=>{f.looks=(f.looks||[]).filter(lookId=>lookId!==id)});
    D.families=D.families.filter(f=>f.looks.length);
    l.family=`family-${id}`;D.families.push({id:l.family,name:l.name,hero:id,looks:[id]});
  });

  /* A card is one outfit: the same sweater or blazer (same piece: colour and neck count) over the same
     trouser colour (beige, cream and khaki count as one). Only these change between its versions:
     - the shirt under it, among similar light shirts (white, cream, light blue);
     - under a blazer, a white tee or a white polo (a white shirt is a different card);
     - on its own, the same shirt or polo (light blue Oxford, dress and weekend shirts count as one);
     - the shoes, always.
     Navy, charcoal and black trousers are different colours; so are pale green and olive sweaters. */
  merge('family-v-t-green-polo-beige','Green polo + beige trousers',['look-01','look-67'],'look-01');
  merge('family-v-t-white-polo-navy','White polo + navy trousers',['look-03','look-07'],'look-03');
  merge('family-v-t-navy-polo-beige','Navy polo + beige trousers',['look-05','look-40','look-navy-polo-beige-chinos-white-sneakers','look-82','look-175'],'look-05');
  merge('family-v-t-navy-polo-dark-denim','Navy polo + dark denim',['look-10','look-100'],'look-10');
  merge('family-v-t-lightblue-shirt-beige','Light blue shirt + beige trousers',['look-62','look-striped-linen-shirt-beige-chinos-loafers','look-lightblue-dress-shirt-beige-chinos-loafers','look-11','look-28','look-lightblue-shirt-beige-chinos-brown-captoe','look-108','look-116'],'look-62');
  merge('family-v-b-navy-blazer-light-shirt-beige','Navy blazer + light shirt + beige trousers',['look-12','look-navy-blazer-white-shirt-cream-chinos'],'look-12');
  merge('family-v-b-navy-blazer-light-shirt-charcoal','Navy blazer + light shirt + charcoal trousers',['look-navy-blazer-white-shirt-charcoal-dress','look-18'],'look-navy-blazer-white-shirt-charcoal-dress');
  merge('family-v-t-lightblue-shirt-dark-denim','Light blue shirt + dark denim',['look-21','look-172'],'look-21');
  merge('family-v-b-navy-blazer-white-tee-or-polo-navy','Navy blazer + white tee or polo + navy trousers',['look-92','look-27'],'look-92');
  merge('family-v-k-navy-quarterzip-light-shirt-beige','Navy quarter-zip + light shirt + beige trousers',['look-169','look-170','look-162','look-33'],'look-169');
  merge('family-v-k-navy-crewneck-light-shirt-beige','Navy crewneck + light shirt + beige trousers',['look-118','look-127','look-128','look-38','look-75','look-navy-crewneck-white-shirt-beige-chinos'],'look-118');
  merge('family-v-t-white-shirt-beige','White shirt + beige trousers',['look-42','look-white-shirt-beige-chinos-white-sneakers','look-154'],'look-42');
  merge('family-v-t-white-tee-beige','White tee + beige trousers',['look-43','look-99'],'look-43');
  merge('family-v-t-black-tee-beige','Black tee + beige trousers',['look-black-tee-beige-chinos-white-sneakers','look-132'],'look-black-tee-beige-chinos-white-sneakers');
  merge('family-v-t-grey-polo-beige','Grey polo + beige trousers',['look-grey-polo-beige-chinos-white-sneakers','look-158'],'look-grey-polo-beige-chinos-white-sneakers');
  merge('family-v-t-olive-buttondown-beige','Olive shirt + beige trousers',['look-94','look-63','look-110','look-olive-shirt-beige-chinos-white-sneakers','look-142'],'look-94');
  merge('family-v-k-cream-crewneck-light-shirt-navy','Cream crewneck + light shirt + navy trousers',['look-136','look-cream-crewneck-lightblue-navy-dress-brown'],'look-136');
  merge('family-v-k-navy-crewneck-light-shirt-blue-denim','Navy crewneck + light shirt + blue denim',['look-navy-crewneck-white-shirt-blue-denim-taupe','look-87'],'look-navy-crewneck-white-shirt-blue-denim-taupe');
  merge('family-v-k-navy-vneck-light-shirt-grey','Navy V-neck + light shirt + grey trousers',['look-navy-vneck-lightblue-grey-dress','look-115'],'look-navy-vneck-lightblue-grey-dress');
  merge('family-v-t-black-polo-dark-denim','Black polo + dark denim',['look-52','look-173'],'look-52');
  merge('family-v-k-navy-crewneck-light-shirt-navy','Navy crewneck + light shirt + navy trousers',['look-70','look-73'],'look-70');
  merge('family-v-k-pale-green-crewneck-light-shirt-beige','Pale green crewneck + light shirt + beige trousers',['look-71','look-74'],'look-71');
  merge('family-v-o-tan-overshirt-white-tee-blue-denim','Tan overshirt + white tee + blue denim',['look-77','look-146'],'look-77');
  merge('family-v-t-lightblue-shirt-navy','Light blue shirt + navy trousers',['look-113','look-130'],'look-113');
  merge('family-v-k-cream-crewneck-light-shirt-black','Cream crewneck + light shirt + black trousers',['look-129','look-120'],'look-129');
  merge('family-v-k-cream-crewneck-light-shirt-grey','Cream crewneck + light shirt + grey trousers',['look-121','look-133'],'look-121');
  merge('family-v-t-white-shirt-navy','White shirt + navy trousers',['look-131','look-161'],'look-131');
  merge('family-v-k-navy-crewneck-light-shirt-grey','Navy crewneck + light shirt + grey trousers',['look-141','look-144','look-168','look-134'],'look-141');
  merge('family-v-b-navy-blazer-light-shirt-navy','Navy blazer + light shirt + navy trousers',['look-163','look-166'],'look-163');

  // Automatic groupings from the source data that mix a look with a blazer and one without.
  split(['look-04','look-08','look-13','look-30']);

  // Asked for by hand: every look with the brown suede jacket is one card.
  merge('family-brown-suede-jacket','Brown suede jacket',['look-41','look-156','look-76','look-57','look-66','look-145','look-147','look-148'],'look-41');
})();
