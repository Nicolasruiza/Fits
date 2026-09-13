(()=>{const D=window.FITS_DATA;if(!D)return;
const addFamily=f=>{if(!D.families.some(x=>x.id===f.id))D.families.push(f)};
const addLook=l=>{if(!D.looks.some(x=>x.id===l.id))D.looks.push(l)};
const addVariant=(familyId,lookId)=>{const f=D.families.find(x=>x.id===familyId);if(f&&!f.looks.includes(lookId))f.looks.push(lookId)};
addFamily({id:'family-cardigan-henley-denim',name:'Cardigan + henley + denim',hero:'look-36',looks:['look-36']});
addLook({id:'look-35',family:'family-navy-denim',name:'Navy polo + blue denim + white sneakers',image:'',formal:1,badges:['Weekend','Travel'],pieces:['navy-polo','blue-denim','white-leather-sneakers']});
addLook({id:'look-36',family:'family-cardigan-henley-denim',name:'Charcoal cardigan + grey henley + blue denim',image:'',formal:2,badges:['Weekend','Dinner'],pieces:['charcoal-cardigan','grey-henley','blue-denim','brown-casual-shoes']});
addVariant('family-navy-denim','look-35');
})();
