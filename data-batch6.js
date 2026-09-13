(()=>{const D=window.FITS_DATA;if(!D)return;
const addPiece=p=>{if(!D.pieces.some(x=>x.id===p.id))D.pieces.push(p)};
const addFamily=f=>{if(!D.families.some(x=>x.id===f.id))D.families.push(f)};
const addLook=l=>{if(!D.looks.some(x=>x.id===l.id))D.looks.push(l)};
addPiece({id:'beige-turtleneck',name:'Beige turtleneck',category:'Top',status:'missing'});
addFamily({id:'family-white-tee-beige',name:'White T-shirt + beige chinos',hero:'look-37',looks:['look-37']});
addFamily({id:'family-navy-crewneck-beige',name:'Navy crewneck + beige chinos',hero:'look-38',looks:['look-38']});
addFamily({id:'family-grey-blazer-tonal',name:'Grey blazer + tonal beige',hero:'look-39',looks:['look-39']});
addLook({id:'look-37',family:'family-white-tee-beige',name:'White T-shirt + beige chinos + white sneakers',image:'assets/inspiration-look-37.jpeg',formal:1,badges:['Favorite','Weekend','Travel'],pieces:['white-tee','beige-chinos','white-leather-sneakers'],inspiration:true});
addLook({id:'look-38',family:'family-navy-crewneck-beige',name:'Navy crewneck + light blue Oxford + beige chinos',image:'assets/inspiration-look-38.jpeg',formal:3,badges:['Office','Weekend'],pieces:['navy-crewneck','light-blue-oxford','beige-chinos','white-leather-sneakers'],inspiration:true});
addLook({id:'look-39',family:'family-grey-blazer-tonal',name:'Grey blazer + beige turtleneck + beige chinos',image:'assets/inspiration-look-39.jpeg',formal:4,badges:['Office','Dinner'],pieces:['grey-blazer','beige-turtleneck','beige-chinos','brown-loafers'],inspiration:true});
const existing=D.looks.find(x=>x.id==='look-12');
if(existing){existing.inspiration=true;existing.inspirationImage='assets/inspiration-look-12.jpeg';}
})();
