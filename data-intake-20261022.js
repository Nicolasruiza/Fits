(()=>{
  const D=window.FITS_DATA;if(!D)return;
  // Intake 2026-10-22: approved FITS-model looks (117-123) and the garment cut-outs that came with them.
  // New pieces are Missing until ownership is confirmed; nothing here is inferred as Owned.
  const pieces=[
    {id:'navy-vneck-sweater',name:'Navy V-neck sweater',category:'Top'},
    {id:'light-blue-crewneck',name:'Light blue crewneck sweater',category:'Top'},
    {id:'cream-crewneck-sweater',name:'Cream crewneck sweater',category:'Top'},
    {id:'charcoal-quarterzip',name:'Charcoal quarter-zip sweater',category:'Top'},
    {id:'sky-blue-striped-dress-shirt',name:'Sky blue striped dress shirt',category:'Top'},
    {id:'camel-ribbed-crewneck',name:'Camel ribbed crewneck sweater',category:'Top'},
    {id:'black-chinos',name:'Black chinos',category:'Pants'},
    {id:'darkbrown-suede-loafers',name:'Dark brown suede loafers',category:'Shoes'}
  ];
  pieces.forEach(p=>{if(!D.pieces.some(x=>x.id===p.id))D.pieces.push({...p,status:'missing'})});
  const looks=[
    ['look-109','Grey T-shirt + navy chinos + black cap-toe shoes','assets/look-109-grey-tee-navy-black.jpg',1,['Weekend','Travel'],['grey-tee','navy-trousers','owned-black-leather-captoe']],
    ['look-110','Olive corduroy shirt + khaki chinos + brown cap-toe shoes','assets/look-110-olive-cord-khaki-brown.jpg',2,['Weekend','Dinner'],['olive-buttondown','khaki-chinos','brown-belt','owned-brown-leather-captoe']],
    ['look-111','Navy V-neck + white shirt + olive trousers + brown cap-toe shoes','assets/look-111-navy-vneck-olive-brown.jpg',3,['Office','Dinner'],['navy-vneck-sweater','white-shirt','olive-trousers','brown-belt','owned-brown-leather-captoe']],
    ['look-112','Black T-shirt + black chinos + black cap-toe shoes','assets/look-112-black-tee-black-black.jpg',2,['Dinner','Weekend'],['black-tee','black-chinos','owned-black-leather-captoe']],
    ['look-113','Light blue shirt + navy chinos + black cap-toe shoes','assets/look-113-lightblue-navy-black.jpg',3,['Office','Dinner'],['light-blue-oxford','navy-trousers','dark-belt','owned-black-leather-captoe']],
    ['look-114','Light blue crewneck + white shirt + navy chinos + black cap-toe shoes','assets/look-114-lightblue-crew-navy-black.jpg',3,['Office'],['light-blue-crewneck','white-shirt','navy-trousers','owned-black-leather-captoe']],
    ['look-115','Navy V-neck + white shirt + grey chinos + black cap-toe shoes','assets/look-115-navy-vneck-grey-black.jpg',3,['Office','Dinner'],['navy-vneck-sweater','white-shirt','grey-trousers','dark-belt','owned-black-leather-captoe']],
    ['look-116','Light blue shirt + khaki chinos + dark brown suede loafers','assets/look-116-lightblue-khaki-suede-loafers.jpg',3,['Office','Weekend'],['light-blue-oxford','khaki-chinos','brown-belt','darkbrown-suede-loafers']],
    ['look-117','Camel ribbed crewneck + light blue shirt + navy chinos + black cap-toe shoes','assets/look-117-camel-ribbed-navy-black.jpg',3,['Office','Dinner'],['camel-ribbed-crewneck','light-blue-oxford','navy-trousers','dark-belt','owned-black-leather-captoe']],
    ['look-118','Navy crewneck + light blue shirt + beige chinos + brown cap-toe shoes','assets/look-118-navy-crew-lightblue-beige-brown.jpg',2,['Office','Weekend'],['navy-crewneck','light-blue-oxford','beige-chinos','owned-brown-leather-captoe']],
    ['look-119','Black V-neck + white shirt + beige chinos + brown cap-toe shoes','assets/look-119-black-vneck-white-beige-brown.jpg',3,['Office','Dinner'],['owned-black-vneck','white-shirt','beige-chinos','owned-brown-leather-captoe']],
    ['look-120','Tan knit sweater + light blue shirt + black chinos + black cap-toe shoes','assets/look-120-tan-knit-lightblue-black-black.jpg',3,['Office','Dinner'],['tan-knit-sweater','light-blue-oxford','black-chinos','owned-black-leather-captoe']],
    ['look-121','Tan knit sweater + white shirt + grey chinos + black cap-toe shoes','assets/look-121-tan-knit-white-grey-black.jpg',3,['Office','Dinner'],['tan-knit-sweater','white-shirt','grey-trousers','owned-black-leather-captoe']],
    ['look-122','Black V-neck + light blue shirt + black chinos + brown cap-toe shoes','assets/look-122-dark-crew-lightblue-black-brown.jpg',3,['Office','Dinner'],['owned-black-vneck','light-blue-oxford','black-chinos','owned-brown-leather-captoe']],
    ['look-123','Charcoal quarter-zip + white shirt + grey chinos + black cap-toe shoes','assets/look-123-charcoal-qz-white-grey-black.jpg',3,['Office','Weekend'],['charcoal-quarterzip','white-shirt','grey-trousers','owned-black-leather-captoe']]
  ];
  looks.forEach(([id,name,image,formal,badges,ids])=>{
    const family='family-'+id;
    if(!D.families.some(f=>f.id===family))D.families.push({id:family,name,hero:id,looks:[id]});
    if(!D.looks.some(l=>l.id===id))D.looks.push({id,family,name,image:image+'?v=1',formal,badges,pieces:ids});
  });
  // The three olive-shirt looks are variants of one outfit idea (same shirt, belt and loafers/oxfords,
  // different trousers or shoes), so they share a family instead of showing as near-duplicate cards.
  const merged=D.families.find(f=>f.id==='family-olive-buttondown-cream');
  if(merged){
    merged.name='Olive shirt + chinos';
    ['look-63','look-110'].forEach(id=>{
      const look=D.looks.find(l=>l.id===id);
      if(!look)return;
      const old=D.families.find(f=>f.id===look.family);
      look.family=merged.id;
      if(!merged.looks.includes(id))merged.looks.push(id);
      if(old&&old!==merged){old.looks=old.looks.filter(x=>x!==id);if(!old.looks.length)D.families=D.families.filter(f=>f!==old)}
    });
  }
  // The old "Dark crewneck" item was removed at the user's request; its looks point at the black V-neck.
  D.pieces=D.pieces.filter(p=>p.id!=='dark-crewneck');
})();
