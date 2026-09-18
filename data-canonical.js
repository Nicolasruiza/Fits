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
  // Replace legacy low-resolution assets with face-consistent full-resolution renders.
  [
    ['look-35', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014636_163a0059-5436-4939-b1d4-e4f5bc5f231e.png'],
    ['look-36', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014636_46598b57-f847-4a63-ad15-f3d3790967a9.png'],
    ['look-38', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014636_35948d5c-5055-4d63-9ad4-b16eceec269c.png'],
    ['look-40', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014154_a8f5474e-1d27-498d-b103-25bf29a8c22d.png'],
    ['look-41', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014154_1402bf26-4e35-4909-9a98-f6e94f5614d0.png'],
    ['look-42', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014154_a24db616-0a60-485a-8dec-868b7f30000e.png'],
    ['look-43', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014020_dbc3d208-7286-4834-b9d1-9ec118b74ddf.png'],
    ['look-44', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014154_a7658938-ae47-40e9-a4d9-07dcc8207f8e.png'],
    ['look-45', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014216_89d49b76-181a-43b2-b0fa-428a67214703.png'],
    ['look-46', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014215_7815c766-1b8f-43f4-b0f1-5bde070c6e2b.png'],
    ['look-47', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014020_961e1d81-7ce7-4dee-9038-63efe130eb3b.png'],
    ['look-48', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014216_179a54a8-3da0-48f6-b03d-a291fd085be9.png'],
    ['look-49', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014216_14fe41ab-6348-44f2-b1ea-34ddcd6f0604.png'],
    ['look-50', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014238_ae827d73-7e8c-4877-ad1c-e033da4bd8e6.png'],
    ['look-51', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014238_a660c6cf-85dd-4d42-a3be-902d398b4be0.png'],
    ['look-52', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014238_24767755-ec53-4873-a432-a18e0bf1eced.png'],
    ['look-53', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014239_aa4c2521-6c20-40b1-b73c-b8124d13c3f9.png'],
    ['look-54', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014300_23f12e29-1b78-4b26-abcb-0f3c5d1365e8.png'],
    ['look-55', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014300_2c7e9938-64c0-47f9-8c58-1608cbb2f0a3.png'],
    ['look-56', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014300_e593448f-8f2d-4d8b-a3a4-be06d7987214.png'],
    ['look-57', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014300_0d18b4d6-9a50-4a94-9f1d-b634bccb05bf.png'],
    ['look-58', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014322_b8c71067-2867-4e8f-ac0f-c4f517e5624b.png'],
    ['look-59', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014322_212bde7c-545d-438f-85e6-840fd057b0bf.png'],
    ['look-60', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014322_537cb14c-56e4-4453-afb6-5887cdb23157.png'],
    ['look-61', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014322_3d1ecafa-d127-4815-90b3-9c3145e84dbe.png'],
    ['look-62', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014345_68640797-7c88-48a9-86dd-2fd574803a7e.png'],
    ['look-63', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014345_ef9d44fb-89a1-487b-82a0-3e5568eed881.png'],
    ['look-64', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014345_257d641d-013c-4385-a2e3-0a6570be2d0e.png'],
    ['look-65', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014345_7c6a7eb4-6d9c-43ad-b3c6-f62715dabf57.png'],
    ['look-66', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014406_44241971-9129-4d61-8e82-b098026b3e3b.png'],
    ['look-67', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014407_bbdada5f-f49c-4c25-8ca6-d300a23bfffe.png'],
    ['look-68', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014020_760b32ba-20f0-47bd-9535-2aac315516c1.png'],
    ['look-69', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014020_d4fdf621-8dac-440b-b10e-2a7824aa88ff.png'],
    ['look-70', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014020_86f04556-6506-43d9-bbae-a797be65d67f.png'],
    ['look-71', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014107_16f94ea7-f10e-47d1-8e1e-30af3d5e891d.png'],
    ['look-72', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014107_fcdb4381-ebc6-42ae-9752-6420d1e21006.png'],
    ['look-73', 'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260918_014107_bc16abfb-b8b3-43e8-84a6-b6b8e297a65b.png']
  ].forEach(([id,image])=>{const l=lookBy(id);if(l)l.image=image});

})();
