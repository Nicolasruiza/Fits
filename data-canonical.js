(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const pieceBy=id=>D.pieces.find(x=>x.id===id);
  const familyBy=id=>D.families.find(x=>x.id===id);
  const lookBy=id=>D.looks.find(x=>x.id===id);
  const upsertPiece=p=>{const x=pieceBy(p.id);if(x){x.name=p.name||x.name;x.category=p.category||x.category;if(!x.status)x.status=p.status||'missing';return x}D.pieces.push({...p,status:p.status||'missing'});return p};
  const upsertFamily=f=>{const x=familyBy(f.id);if(x){x.name=f.name||x.name;x.hero=f.hero||x.hero;x.looks=[...new Set([...(x.looks||[]),...(f.looks||[])])];return x}D.families.push({...f,looks:[...new Set(f.looks||[])]});return f};
  const upsertLook=l=>{const x=lookBy(l.id);if(x){Object.assign(x,l);return x}D.looks.push(l);return l};
  const addVariant=(familyId,lookId)=>{const f=familyBy(familyId);if(f&&!f.looks.includes(lookId))f.looks.push(lookId)};

  // Canonical pieces for the new generation pipeline.
  [
    {id:'olive-overshirt',name:'Olive overshirt',category:'Outerwear'},
    {id:'black-polo',name:'Black polo',category:'Top'},
    {id:'cream-knit-sweater',name:'Cream knit sweater',category:'Top'},
    {id:'olive-tee',name:'Olive crew-neck T-shirt',category:'Top'},
    {id:'tan-knit-sweater',name:'Tan knit sweater',category:'Top'},
    {id:'black-overcoat',name:'Black overcoat',category:'Outerwear'},
    {id:'brown-overcoat',name:'Brown overcoat',category:'Outerwear'}
  ].forEach(upsertPiece);

  // Batch 16 moved here so this becomes the only data extension point going forward.
  upsertFamily({id:'family-olive-overshirt-denim',name:'Olive overshirt + white tee',hero:'look-51',looks:['look-51']});
  upsertLook({id:'look-51',family:'family-olive-overshirt-denim',name:'Olive overshirt + white tee + dark denim + white sneakers',image:'assets/look-51-olive-overshirt-denim.webp?v=2',formal:1,badges:['Weekend','Travel'],pieces:['olive-overshirt','white-tee','dark-denim','white-leather-sneakers']});

  upsertFamily({id:'family-black-polo-denim',name:'Black polo + denim',hero:'look-52',looks:['look-52']});
  upsertLook({id:'look-52',family:'family-black-polo-denim',name:'Black polo + dark denim + white sneakers',image:'assets/look-52-black-polo-denim.webp?v=2',formal:1,badges:['Weekend','Dinner','Travel'],pieces:['black-polo','dark-denim','white-leather-sneakers']});

  upsertFamily({id:'family-lightblue-cream-knit',name:'Light blue shirt + cream trousers',hero:'look-53',looks:['look-53']});
  upsertLook({id:'look-53',family:'family-lightblue-cream-knit',name:'Light blue shirt + cream knit + cream trousers + brown loafers',image:'assets/look-53-lightblue-cream-cafe.webp?v=2',formal:3,badges:['Office','Dinner','Weekend'],pieces:['light-blue-oxford','cream-knit-sweater','cream-chinos','brown-loafers','brown-belt']});
  const look40=lookBy('look-40');if(look40)look40.image='assets/look-40-navy-polo-cream-v2.webp?v=2';

  // Exact duplicate outfit formulas keep one look ID; only the photo is refreshed.
  const replacements={
    'look-47':'assets/look-47-white-polo-olive-v2.webp?v=1',
    'look-48':'assets/look-48-grey-sweater-denim-v2.webp?v=1',
    'look-49':'assets/look-49-stone-shirt-denim-v2.webp?v=1'
  };
  Object.entries(replacements).forEach(([id,image])=>{const l=lookBy(id);if(l)l.image=image});

  // New variants and families from the boost sprint.
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
})();
