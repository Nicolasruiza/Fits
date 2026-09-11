(()=>{const D=window.FITS_DATA;if(!D)return;
const addLook=l=>{if(!D.looks.some(x=>x.id===l.id))D.looks.push(l)};
const addPiece=p=>{if(!D.pieces.some(x=>x.id===p.id))D.pieces.push(p)};
const addVariant=(familyId,lookId)=>{const f=D.families.find(x=>x.id===familyId);if(f&&!f.looks.includes(lookId))f.looks.push(lookId)};
[
{id:'navy-henley',name:'Navy long-sleeve henley',category:'Top',status:'missing'},
{id:'grey-henley',name:'Grey long-sleeve henley',category:'Top',status:'missing'},
{id:'taupe-suede-shoes',name:'Taupe suede casual shoes',category:'Shoes',status:'missing'}
].forEach(addPiece);
[
{id:'look-27',family:'family-henley-denim',name:'Navy henley + dark denim + tan Chelsea',image:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_213452_98058561-33bc-49ff-b803-19f5e051e769.png',formal:1,badges:['Weekend','Travel','Dinner'],pieces:['navy-henley','dark-denim','tan-chelsea']},
{id:'look-28',family:'family-henley-denim',name:'Grey henley + dark chinos + taupe suede shoes',image:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_213452_5f836161-3ba0-4244-b215-5ddc0a28e340.png',formal:1,badges:['Weekend','Travel'],pieces:['grey-henley','dark-chinos','taupe-suede-shoes']},
{id:'look-29',family:'family-grey-blazer-denim',name:'Grey blazer + white shirt + dark chinos + brown derbies',image:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_213452_27f1b260-2b7f-41c9-82b4-fb5fdd700012.png',formal:4,badges:['Office','Dinner'],pieces:['grey-blazer','white-shirt','dark-chinos','brown-derbies','brown-belt']}
].forEach(addLook);
addVariant('family-henley-denim','look-27');
addVariant('family-henley-denim','look-28');
addVariant('family-grey-blazer-denim','look-29');
})();