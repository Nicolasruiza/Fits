(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const pieceBy=id=>D.pieces.find(x=>x.id===id);
  const familyBy=id=>D.families.find(x=>x.id===id);
  const lookBy=id=>D.looks.find(x=>x.id===id);
  const upsertPiece=p=>{const x=pieceBy(p.id);if(x){x.name=p.name||x.name;x.category=p.category||x.category;if(!x.status)x.status=p.status||'missing';return x}D.pieces.push({...p,status:p.status||'missing'});return p};
  const upsertFamily=f=>{const x=familyBy(f.id);if(x){x.name=f.name||x.name;x.hero=f.hero||x.hero;x.looks=[...new Set([...(x.looks||[]),...(f.looks||[])])];return x}D.families.push({...f,looks:[...new Set(f.looks||[])]});return f};
  const upsertLook=l=>{const x=lookBy(l.id);if(x){Object.assign(x,l);return x}D.looks.push(l);return l};
  const addVariant=(familyId,lookId)=>{const f=familyBy(familyId);if(f&&!f.looks.includes(lookId))f.looks.push(lookId)};

  [
    {id:'olive-overshirt',name:'Olive overshirt',category:'Outerwear'},
    {id:'black-polo',name:'Black polo',category:'Top'},
    {id:'cream-knit-sweater',name:'Cream knit sweater',category:'Top'},
    {id:'olive-tee',name:'Olive crew-neck T-shirt',category:'Top'},
    {id:'tan-knit-sweater',name:'Tan knit sweater',category:'Top'},
    {id:'black-overcoat',name:'Black overcoat',category:'Outerwear'},
    {id:'brown-overcoat',name:'Brown overcoat',category:'Outerwear'},
    {id:'brown-suede-jacket',name:'Brown suede jacket',category:'Outerwear'}
  ].forEach(upsertPiece);

  // Batch 16 migrated here. This is the only data extension point going forward.
  upsertFamily({id:'family-olive-overshirt-denim',name:'Olive overshirt + white tee',hero:'look-51',looks:['look-51']});
  upsertLook({id:'look-51',family:'family-olive-overshirt-denim',name:'Olive overshirt + white tee + dark denim + white sneakers',image:'assets/look-51-olive-overshirt-denim.webp?v=2',formal:1,badges:['Weekend','Travel'],pieces:['olive-overshirt','white-tee','dark-denim','white-leather-sneakers']});

  upsertFamily({id:'family-black-polo-denim',name:'Black polo + denim',hero:'look-52',looks:['look-52']});
  upsertLook({id:'look-52',family:'family-black-polo-denim',name:'Black polo + dark denim + white sneakers',image:'assets/look-52-black-polo-denim.webp?v=2',formal:1,badges:['Weekend','Dinner','Travel'],pieces:['black-polo','dark-denim','white-leather-sneakers']});

  upsertFamily({id:'family-lightblue-cream-knit',name:'Light blue shirt + cream trousers',hero:'look-53',looks:['look-53']});
  upsertLook({id:'look-53',family:'family-lightblue-cream-knit',name:'Light blue shirt + cream knit + cream trousers + brown loafers',image:'assets/look-53-lightblue-cream-cafe.webp?v=2',formal:3,badges:['Office','Dinner','Weekend'],pieces:['light-blue-oxford','cream-knit-sweater','cream-chinos','brown-loafers','brown-belt']});
  const look40=lookBy('look-40');if(look40)look40.image='assets/look-40-navy-polo-cream-v2.webp?v=2';

  // Boost sprint: add only genuinely new outfit formulas.
  upsertLook({id:'look-54',family:'family-olive-overshirt-denim',name:'Olive overshirt + white tee + cream trousers + white sneakers',image:'assets/look-54-olive-overshirt-cream.webp?v=1',formal:2,badges:['Weekend','Office','Travel'],pieces:['olive-overshirt','white-tee','cream-chinos','white-leather-sneakers']});
  addVariant('family-olive-overshirt-denim','look-54');

  upsertFamily({id:'family-black-charcoal',name:'Black + charcoal',hero:'look-55',looks:['look-55','look-56']});
  upsertLook({id:'look-55',family:'family-black-charcoal',name:'Black polo + charcoal trousers + black Chelsea boots',image:'assets/look-55-black-polo-charcoal.webp?v=1',formal:3,badges:['Office','Dinner'],pieces:['black-polo','charcoal-trousers','black-chelsea']});
  upsertLook({id:'look-56',family:'family-black-charcoal',name:'Black turtleneck + charcoal trousers + black overcoat',image:'assets/look-56-black-turtleneck-overcoat.webp?v=1',formal:4,badges:['Office','Dinner'],pieces:['black-turtleneck','charcoal-trousers','black-overcoat','black-chelsea']});

  upsertFamily({id:'family-earth-suede',name:'Brown suede + olive + beige',hero:'look-57',looks:['look-57']});
  upsertLook({id:'look-57',family:'family-earth-suede',name:'Brown suede jacket + olive tee + beige chinos + brown boots',image:'assets/look-57-brown-suede-olive-beige.webp?v=1',formal:2,badges:['Weekend','Dinner','Travel'],pieces:['brown-suede-jacket','olive-tee','beige-chinos','brown-chelsea']});

  upsertFamily({id:'family-earth-overcoat',name:'Brown overcoat + tan knit + olive',hero:'look-58',looks:['look-58']});
  upsertLook({id:'look-58',family:'family-earth-overcoat',name:'Brown overcoat + tan knit + olive trousers + brown boots',image:'assets/look-58-brown-overcoat-tan-olive.webp?v=1',formal:4,badges:['Office','Dinner','Travel'],pieces:['brown-overcoat','tan-knit-sweater','olive-trousers','brown-chelsea']});

  upsertFamily({id:'family-cream-knit-olive',name:'Cream knit + olive trousers',hero:'look-59',looks:['look-59']});
  upsertLook({id:'look-59',family:'family-cream-knit-olive',name:'Cream knit sweater + olive trousers + white sneakers',image:'assets/look-59-cream-knit-olive.webp?v=1',formal:2,badges:['Weekend','Office','Travel'],pieces:['cream-knit-sweater','olive-trousers','white-leather-sneakers']});
  // Inspiration intake 2026-09-16: app-ready generated looks.
  [
    {id:'black-tee',name:'Black crew-neck T-shirt',category:'Top'},
    {id:'green-buttonup',name:'Green button-up shirt',category:'Top'},
    {id:'burgundy-knit-polo',name:'Burgundy knit polo',category:'Top'},
    {id:'striped-blue-linen-shirt',name:'Blue striped linen shirt',category:'Top'},
    {id:'white-linen-shorts',name:'White linen shorts',category:'Pants'},
    {id:'tan-espadrilles',name:'Tan summer espadrilles',category:'Shoes'}
  ].forEach(upsertPiece);

  upsertFamily({id:'family-white-shirt-denim',name:'White shirt + denim',hero:'look-60',looks:['look-60']});
  upsertLook({id:'look-60',family:'family-white-shirt-denim',name:'White shirt + dark denim + white sneakers',image:'assets/look-60-white-shirt-denim.webp?v=1',formal:2,badges:['Weekend','Office','Dinner'],pieces:['white-shirt','dark-denim','white-leather-sneakers']});

  upsertFamily({id:'family-black-tee-denim',name:'Black tee + denim',hero:'look-61',looks:['look-61']});
  upsertLook({id:'look-61',family:'family-black-tee-denim',name:'Black tee + dark denim + white sneakers',image:'assets/look-61-black-tee-denim.webp?v=1',formal:1,badges:['Weekend','Travel','Dinner'],pieces:['black-tee','dark-denim','white-leather-sneakers']});

  upsertLook({id:'look-62',family:'family-lightblue-beige',name:'Light blue shirt + beige chinos + brown loafers',image:'assets/look-62-blue-shirt-beige.webp?v=1',formal:3,badges:['Office','Dinner','Weekend'],pieces:['light-blue-oxford','beige-chinos','brown-loafers','brown-belt']});
  addVariant('family-lightblue-beige','look-62');

  upsertFamily({id:'family-green-shirt-tan',name:'Green shirt + tan chinos',hero:'look-63',looks:['look-63']});
  upsertLook({id:'look-63',family:'family-green-shirt-tan',name:'Green button-up + tan chinos + brown loafers',image:'assets/look-63-green-shirt-tan.webp?v=1',formal:2,badges:['Weekend','Office','Dinner'],pieces:['green-buttonup','khaki-chinos','brown-loafers','brown-belt']});

  upsertFamily({id:'family-burgundy-knit-grey',name:'Burgundy knit + grey trousers',hero:'look-64',looks:['look-64']});
  upsertLook({id:'look-64',family:'family-burgundy-knit-grey',name:'Burgundy knit polo + grey trousers + dark loafers',image:'assets/look-64-burgundy-knit-grey.webp?v=1',formal:3,badges:['Office','Dinner','Travel'],pieces:['burgundy-knit-polo','grey-trousers','dark-loafers']});

  upsertFamily({id:'family-striped-linen-summer',name:'Striped linen summer',hero:'look-65',looks:['look-65']});
  upsertLook({id:'look-65',family:'family-striped-linen-summer',name:'Blue striped linen shirt + white linen shorts',image:'assets/look-65-striped-linen-shorts.webp?v=1',formal:1,badges:['Weekend','Travel'],pieces:['striped-blue-linen-shirt','white-linen-shorts','tan-espadrilles']});

  upsertLook({id:'look-66',family:'family-earth-suede',name:'Brown suede jacket + black polo + cream trousers + brown loafers',image:'assets/look-66-brown-suede-black-cream.webp?v=1',formal:3,badges:['Office','Dinner','Weekend'],pieces:['brown-suede-jacket','black-polo','cream-chinos','brown-loafers']});
  addVariant('family-earth-suede','look-66');

  upsertLook({id:'look-67',family:'family-green-khaki',name:'Green polo + cream trousers + white sneakers',image:'assets/look-67-green-polo-cream.webp?v=1',formal:2,badges:['Weekend','Office','Travel'],pieces:['green-polo','cream-chinos','white-leather-sneakers']});
  addVariant('family-green-khaki','look-67');


  // Recovered generated batch 68-73 from the original staged filenames.
  upsertPiece({id:'olive-crewneck',name:'Olive crewneck sweater',category:'Top'});

  upsertLook({id:'look-68',family:'family-blazer-polo-navy',name:'Navy jacket + white polo + grey trousers + white sneakers',image:'assets/look-68.webp?v=1',formal:3,badges:['Office','Dinner','Weekend'],pieces:['navy-blazer','white-polo','grey-trousers','white-leather-sneakers']});
  addVariant('family-blazer-polo-navy','look-68');

  upsertFamily({id:'family-navy-crewneck-shirt',name:'Navy crewneck + shirt',hero:'look-69',looks:['look-69','look-70','look-73']});
  upsertLook({id:'look-69',family:'family-navy-crewneck-shirt',name:'Navy crewneck + light blue shirt + beige chinos + white sneakers',image:'assets/look-69.webp?v=1',formal:3,badges:['Office','Weekend','Travel'],pieces:['navy-crewneck','light-blue-oxford','beige-chinos','white-leather-sneakers']});
  upsertLook({id:'look-70',family:'family-navy-crewneck-shirt',name:'Navy crewneck + light blue shirt + navy trousers + white sneakers',image:'assets/look-70.webp?v=1',formal:3,badges:['Office','Dinner','Travel'],pieces:['navy-crewneck','light-blue-oxford','navy-trousers','white-leather-sneakers']});
  upsertLook({id:'look-73',family:'family-navy-crewneck-shirt',name:'Navy crewneck + white shirt + navy trousers + white sneakers',image:'assets/look-73.webp?v=1',formal:3,badges:['Office','Dinner','Travel'],pieces:['navy-crewneck','white-shirt','navy-trousers','white-leather-sneakers']});

  upsertFamily({id:'family-olive-crewneck-shirt',name:'Olive crewneck + shirt',hero:'look-71',looks:['look-71','look-72']});
  upsertLook({id:'look-71',family:'family-olive-crewneck-shirt',name:'Olive crewneck + light blue shirt + beige chinos + white sneakers',image:'assets/look-71.webp?v=1',formal:2,badges:['Office','Weekend','Travel'],pieces:['olive-crewneck','light-blue-oxford','beige-chinos','white-leather-sneakers']});
  upsertLook({id:'look-72',family:'family-olive-crewneck-shirt',name:'Olive crewneck + light blue shirt + navy trousers + white sneakers',image:'assets/look-72.webp?v=1',formal:2,badges:['Office','Weekend','Travel'],pieces:['olive-crewneck','light-blue-oxford','navy-trousers','white-leather-sneakers']});

  // High-quality face/look replacements (2026-09-17 housekeeping).
  // These override low-resolution legacy assets that were as small as 240x300.
  [
    ['look-43','https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014020_dbc3d208-7286-4834-b9d1-9ec118b74ddf.png'],
    ['look-47','https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014020_961e1d81-7ce7-4dee-9038-63efe130eb3b.png'],
    ['look-68','https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014020_760b32ba-20f0-47bd-9535-2aac315516c1.png'],
    ['look-69','https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014020_d4fdf621-8dac-440b-b10e-2a7824aa88ff.png'],
    ['look-70','https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014020_86f04556-6506-43d9-bbae-a797be65d67f.png'],
    ['look-71','https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014107_16f94ea7-f10e-47d1-8e1e-30af3d5e891d.png'],
    ['look-72','https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014107_fcdb4381-ebc6-42ae-9752-6420d1e21006.png'],
    ['look-73','https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014107_bc16abfb-b8b3-43e8-84a6-b6b8e297a65b.png']
  ].forEach(([id,image])=>{const l=lookBy(id);if(l)l.image=image});

})();
