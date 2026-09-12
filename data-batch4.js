(()=>{const D=window.FITS_DATA;if(!D)return;
const addFamily=f=>{if(!D.families.some(x=>x.id===f.id))D.families.push(f)};
const addLook=l=>{if(!D.looks.some(x=>x.id===l.id))D.looks.push(l)};
const addPiece=p=>{if(!D.pieces.some(x=>x.id===p.id))D.pieces.push(p)};
const old28=D.looks.find(x=>x.id==='look-28');if(old28)old28.image='assets/look-28-lightblue-beige-v2.svg?v=12';
addPiece({id:'navy-quarterzip',name:'Navy quarter-zip',category:'Top',status:'missing'});
addFamily({id:'family-quarterzip-beige',name:'Navy quarter-zip + light blue Oxford + beige chinos',hero:'look-33',looks:['look-33']});
addLook({id:'look-33',family:'family-quarterzip-beige',name:'Navy quarter-zip + light blue Oxford + beige chinos',image:'assets/look-33-quarterzip-beige.svg?v=12',formal:3,badges:['Office','Weekend'],pieces:['navy-quarterzip','light-blue-oxford','beige-chinos','brown-derbies']});
})();