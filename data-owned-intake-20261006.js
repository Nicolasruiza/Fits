(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const items=[
    {id:'owned-grey-quarterzip',name:'Light grey quarter-zip knit sweater',category:'Top'},
    {id:'owned-brown-buckle-chelsea',name:'Dark brown leather Chelsea boots with buckle detail',category:'Shoes'},
    {id:'owned-lightblue-microcheck-shirt',name:'Light blue micro-check button-down shirt',category:'Top'},
    {id:'owned-black-vneck',name:'Black V-neck sweater',category:'Top'},
    {id:'owned-green-crewneck',name:'Green crew-neck sweater',category:'Top'},
    {id:'black-polo',name:'Black polo',category:'Top'},
    {id:'navy-polo',name:'Navy blue polo',category:'Top'},
    {id:'owned-france-blue-henley',name:'Bright France blue short-sleeve henley',category:'Top'},
    {id:'navy-henley',name:'Navy blue short-sleeve henley',category:'Top'},
    {id:'owned-white-henley',name:'White short-sleeve henley',category:'Top'},
    {id:'owned-cream-buttondown',name:'Cream / light beige button-down shirt',category:'Top'},
    {id:'owned-blue-gingham-shirt',name:'Blue gingham button-down shirt',category:'Top'},
    {id:'owned-rwb-check-shirt',name:'Red, white and blue check button-down shirt',category:'Top'},
    {id:'beige-chinos',name:'Beige chinos',category:'Pants'},
    {id:'owned-dark-green-chinos',name:'Dark green chinos',category:'Pants'},
    {id:'owned-darkbrown-suede-captoe-shoe',name:'Dark brown suede cap-toe dress shoes',category:'Shoes'},
    {id:'owned-darkbrown-suede-italian-laceup',name:'Dark brown suede Italian lace-up shoes',category:'Shoes'},
    {id:'owned-navy-suede-chelsea',name:'Navy blue suede Chelsea boots',category:'Shoes'},
    {id:'owned-black-leather-captoe',name:'Black leather cap-toe dress shoes',category:'Shoes'},
    {id:'owned-navy-suede-brogue',name:'Navy blue suede brogue shoes',category:'Shoes'},
    {id:'brown-loafers',name:'Cognac brown leather loafers',category:'Shoes'},
    {id:'owned-brown-leather-captoe',name:'Brown leather cap-toe dress shoes',category:'Shoes'},
    {id:'owned-darkbrown-suede-chelsea',name:'Dark brown suede Chelsea boots',category:'Shoes'},
    {id:'brown-chelsea',name:'Dark brown leather Chelsea boots',category:'Shoes'},
    {id:'navy-leather-sneakers',name:'Navy blue sneakers',category:'Shoes'},
    {id:'white-leather-sneakers',name:'Banana Republic white leather sneakers',category:'Shoes'},
    {id:'owned-br-cognac-sneakers',name:'Banana Republic cognac brown leather sneakers',category:'Shoes'}
  ];
  // This item was initially stored under a taupe/leather id even though the
  // actual pair is dark brown suede. Migrate the old key so the Wardrobe does
  // not display the same pair twice for returning users.
  const legacyChelsea=D.pieces.findIndex(p=>p.id==='owned-taupe-leather-chelsea');
  if(legacyChelsea!==-1)D.pieces.splice(legacyChelsea,1);
  const legacyLaceupBoot=D.pieces.findIndex(p=>p.id==='owned-darkbrown-suede-laceup-boot');
  if(legacyLaceupBoot!==-1)D.pieces.splice(legacyLaceupBoot,1);

  items.forEach(p=>{
    const x=D.pieces.find(v=>v.id===p.id);
    if(x){x.name=p.name;x.category=p.category;x.status='owned';}
    else D.pieces.push({...p,status:'owned'});
  });
})();
