(()=>{const D=window.FITS_DATA;if(!D)return;
const addPiece=p=>{if(!D.pieces.some(x=>x.id===p.id))D.pieces.push(p)};
const addFamily=f=>{if(!D.families.some(x=>x.id===f.id))D.families.push(f)};
const addLook=l=>{if(!D.looks.some(x=>x.id===l.id))D.looks.push(l)};
addPiece({id:'cream-chinos',name:'Cream chinos',category:'Pants',status:'missing'});
addFamily({id:'family-navy-polo-cream',name:'Navy polo + cream chinos',hero:'look-40',looks:['look-40']});
addLook({id:'look-40',family:'family-navy-polo-cream',name:'Navy polo + cream chinos + brown loafers',image:'assets/look-40-navy-polo-cream.webp?v=1',formal:3,badges:['Office','Dinner','Weekend'],pieces:['navy-polo','cream-chinos','brown-loafers','brown-belt']});
})();
