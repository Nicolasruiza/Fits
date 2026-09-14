(()=>{const D=window.FITS_DATA;if(!D)return;
const addFamily=f=>{if(!D.families.some(x=>x.id===f.id))D.families.push(f)};
const addLook=l=>{if(!D.looks.some(x=>x.id===l.id))D.looks.push(l)};
// Approved final only. Inspiration/reference cards stay out of Looks.
addFamily({id:'family-navy-crewneck-beige',name:'Navy crewneck + beige chinos',hero:'look-38',looks:['look-38']});
addLook({id:'look-38',family:'family-navy-crewneck-beige',name:'Navy crewneck + light blue Oxford + beige chinos',image:'assets/look-38-navy-crewneck-beige.webp?v=1',formal:3,badges:['Office','Weekend'],pieces:['navy-crewneck','light-blue-oxford','beige-chinos','white-leather-sneakers']});
})();
