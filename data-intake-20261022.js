(()=>{
  const D=window.FITS_DATA;if(!D)return;
  // Intake 2026-10-22: approved FITS-model looks (118-123) and the garment cut-outs that came with them.
  // New pieces are Missing until ownership is confirmed; nothing here is inferred as Owned.
  const pieces=[
    {id:'navy-vneck-sweater',name:'Navy V-neck sweater',category:'Top'},
    {id:'light-blue-crewneck',name:'Light blue crewneck sweater',category:'Top'},
    {id:'cream-crewneck-sweater',name:'Cream crewneck sweater',category:'Top'},
    {id:'dark-crewneck',name:'Very dark charcoal crewneck sweater',category:'Top'},
    {id:'charcoal-quarterzip',name:'Charcoal quarter-zip sweater',category:'Top'},
    {id:'sky-blue-striped-dress-shirt',name:'Sky blue striped dress shirt',category:'Top'},
    {id:'light-blue-dress-shirt',name:'Light blue dress shirt',category:'Top'},
    {id:'black-chinos',name:'Black chinos',category:'Pants'},
    {id:'black-dress-trousers',name:'Black dress trousers',category:'Pants'},
    {id:'dark-charcoal-dress-trousers',name:'Dark charcoal dress trousers',category:'Pants'},
    {id:'grey-dress-trousers',name:'Grey dress trousers',category:'Pants'},
    {id:'navy-dress-trousers',name:'Navy dress trousers',category:'Pants'},
    {id:'darkbrown-suede-loafers',name:'Dark brown suede loafers',category:'Shoes'}
  ];
  pieces.forEach(p=>{const existing=D.pieces.find(x=>x.id===p.id);if(existing){existing.name=p.name;existing.category=p.category}else D.pieces.push({...p,status:'missing'})});
  const looks=[
    ['look-109','Grey T-shirt + navy chinos + black cap-toe shoes','assets/look-109-grey-tee-navy-black.jpg',1,['Weekend','Travel'],['grey-tee','navy-trousers','owned-black-leather-captoe']],
    ['look-110','Olive corduroy shirt + khaki chinos + brown cap-toe shoes','assets/look-110-olive-cord-khaki-brown.jpg',2,['Weekend','Dinner'],['olive-buttondown','khaki-chinos','brown-belt','owned-brown-leather-captoe']],
    ['look-111','Navy V-neck + white shirt + olive trousers + brown cap-toe shoes','assets/look-111-navy-vneck-olive-brown.jpg',3,['Office','Dinner'],['navy-vneck-sweater','white-shirt','olive-trousers','brown-belt','owned-brown-leather-captoe']],
    ['look-112','Black T-shirt + black chinos + black cap-toe shoes','assets/look-112-black-tee-black-black.jpg',2,['Dinner','Weekend'],['black-tee','black-chinos','owned-black-leather-captoe']],
    ['look-113','Light blue dress shirt + navy dress trousers + black cap-toe shoes','assets/look-113-lightblue-navy-black.jpg',4,['Office','Dinner'],['light-blue-dress-shirt','navy-dress-trousers','dark-belt','owned-black-leather-captoe']],
    ['look-114','Light blue crewneck + white shirt + navy dress trousers + black cap-toe shoes','assets/look-114-lightblue-crew-navy-black.jpg',4,['Office'],['light-blue-crewneck','white-shirt','navy-dress-trousers','owned-black-leather-captoe']],
    ['look-115','Navy V-neck + white shirt + grey dress trousers + black cap-toe shoes','assets/look-115-navy-vneck-grey-black.jpg',4,['Office','Dinner'],['navy-vneck-sweater','white-shirt','grey-dress-trousers','dark-belt','owned-black-leather-captoe']],
    ['look-116','Light blue dress shirt + khaki chinos + dark brown suede loafers','assets/look-116-lightblue-khaki-suede-loafers.jpg',3,['Office','Weekend'],['light-blue-dress-shirt','khaki-chinos','brown-belt','darkbrown-suede-loafers']],
    ['look-118','Navy crewneck + light blue dress shirt + beige chinos + brown cap-toe shoes','assets/look-118-navy-crew-lightblue-beige-brown.jpg',2,['Office','Weekend'],['navy-crewneck','light-blue-dress-shirt','beige-chinos','owned-brown-leather-captoe']],
    ['look-119','Black V-neck + white shirt + beige chinos + brown cap-toe shoes','assets/look-119-black-vneck-white-beige-brown.jpg',3,['Office','Dinner'],['owned-black-vneck','white-shirt','beige-chinos','owned-brown-leather-captoe']],
    ['look-120','Cream crewneck sweater + light blue dress shirt + black dress trousers + black cap-toe shoes','assets/look-120-tan-knit-lightblue-black-black.jpg',4,['Office','Dinner'],['cream-crewneck-sweater','light-blue-dress-shirt','black-dress-trousers','owned-black-leather-captoe']],
    ['look-121','Cream crewneck sweater + white shirt + grey dress trousers + black cap-toe shoes','assets/look-121-tan-knit-white-grey-black.jpg',4,['Office','Dinner'],['cream-crewneck-sweater','white-shirt','grey-dress-trousers','owned-black-leather-captoe']],
    ['look-122','Dark charcoal crewneck + light blue dress shirt + dark charcoal dress trousers + brown cap-toe shoes','assets/look-122-dark-crew-lightblue-black-brown.jpg',4,['Office','Dinner'],['dark-crewneck','light-blue-dress-shirt','dark-charcoal-dress-trousers','owned-brown-leather-captoe']],
    ['look-123','Charcoal quarter-zip + white shirt + grey dress trousers + black cap-toe shoes','assets/look-123-charcoal-qz-white-grey-black.jpg',4,['Office','Weekend'],['charcoal-quarterzip','white-shirt','grey-dress-trousers','owned-black-leather-captoe']],
    ['look-124','Dark charcoal crewneck + white shirt + beige chinos + brown cap-toe shoes','assets/look-124-dark-crew-white-beige-brown.jpg',3,['Office','Dinner'],['dark-crewneck','white-shirt','beige-chinos','owned-brown-leather-captoe']]
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
  // The dark charcoal crewneck and black V-neck are separate garments and separate outfit families.
  // Cognac leather biker jacket and its only look (look-93) were removed at the user's request.
  D.pieces=D.pieces.filter(p=>p.id!=='cognac-leather-biker-jacket');
  D.looks=D.looks.filter(l=>l.id!=='look-93');
  D.families.forEach(f=>{f.looks=(f.looks||[]).filter(id=>id!=='look-93');if(f.hero==='look-93')f.hero=f.looks[0]});
  D.families=D.families.filter(f=>f.looks.length);
  // Charcoal polo (no looks) was removed at the user's request.
  D.pieces=D.pieces.filter(p=>p.id!=='charcoal-polo');
  // Camel ribbed crewneck and its only look (look-117) were removed at the user's request.
  D.pieces=D.pieces.filter(p=>p.id!=='camel-ribbed-crewneck');
  D.looks=D.looks.filter(l=>l.id!=='look-117');
  D.families=D.families.filter(f=>f.id!=='family-look-117');
  // Cream leather belt was removed at the user's request; looks that used it simply have no belt.
  D.looks.forEach(l=>{if((l.pieces||[]).includes('cream-belt'))l.pieces=l.pieces.filter(id=>id!=='cream-belt')});
  D.pieces=D.pieces.filter(p=>p.id!=='cream-belt');
  // Two tan suede derby-style shoes with no looks were removed at the user's request.
  D.pieces=D.pieces.filter(p=>!['tan-suede-shoes','tan-suede-derbies'].includes(p.id));
  // Beige blazer (no looks) was removed at the user's request.
  D.pieces=D.pieces.filter(p=>p.id!=='beige-blazer');
  // "Jackets" was a one-piece category (cognac suede jacket). It is outerwear, so it can be linked with the other jackets.
  D.pieces.forEach(p=>{if(p.category==='Jackets')p.category='Outerwear'});
})();
