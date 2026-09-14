(()=>{const D=window.FITS_DATA;if(!D)return;
const approved=[
{id:'look-12',family:'family-blazer-white-beige',name:'Navy blazer + white shirt + beige chinos',image:'assets/look-12-approved.webp?v=3'},
{id:'look-38',family:'family-navy-crewneck-beige',name:'Navy crewneck + light blue Oxford + beige chinos'},
{id:'look-40',family:'family-navy-polo-cream',name:'Navy polo + cream chinos + brown loafers',image:'assets/look-40-navy-polo-cream.webp?v=3'},
{id:'look-41',family:'family-cognac-suede-navy',name:'Cognac suede jacket + white tee + navy trousers',image:'assets/look-41-cognac-suede.webp?v=3'},
{id:'look-42',family:'family-white-taupe',name:'White shirt + taupe trousers + suede loafers'},
{id:'look-43',family:'family-white-tee-beige',name:'White tee + beige chinos + white sneakers',image:'assets/look-43-white-tee-beige.webp?v=3'},
{id:'look-44',family:'family-camel-grey-dark',name:'Camel overcoat + grey crewneck + dark chinos'},
{id:'look-45',family:'family-navy-sweater-beige',name:'Navy sweater + beige chinos + white sneakers'},
{id:'look-46',family:'family-grey-blazer-cream',name:'Grey blazer + cream trousers + brown loafers',image:'assets/look-46-grey-blazer-cream.webp?v=3'}
];
const look=id=>(D.looks||[]).find(x=>x.id===id);
approved.forEach(a=>{const l=look(a.id);if(!l)return;if(a.image)l.image=a.image;l.inspiration=false;l.family=a.family;let f=(D.families||[]).find(x=>x.id===a.family);if(!f){f={id:a.family,name:a.name,hero:a.id,looks:[a.id]};D.families.push(f)}else{f.looks=(f.looks||[]).filter(id=>!!look(id));if(!f.looks.includes(a.id))f.looks.push(a.id);if(!look(f.hero))f.hero=a.id;}});
const valid=new Set((D.looks||[]).filter(l=>!l.inspiration&&!String(l.image||'').includes('inspiration-')).map(l=>l.id));
D.families=(D.families||[]).filter(f=>(f.looks||[]).some(id=>valid.has(id)));
D.families.forEach(f=>{f.looks=(f.looks||[]).filter(id=>valid.has(id));if(!valid.has(f.hero))f.hero=f.looks[0]||''});
})();