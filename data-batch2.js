(()=>{const D=window.FITS_DATA;if(!D)return;
const addFamily=f=>{if(!D.families.some(x=>x.id===f.id))D.families.push(f)};
const addLook=l=>{if(!D.looks.some(x=>x.id===l.id))D.looks.push(l)};
const addPiece=p=>{if(!D.pieces.some(x=>x.id===p.id))D.pieces.push(p)};
const addVariant=(familyId,lookId)=>{const f=D.families.find(x=>x.id===familyId);if(f&&!f.looks.includes(lookId))f.looks.push(lookId)};
[
{id:'tan-chelsea',name:'Tan suede Chelsea boots',category:'Shoes',status:'missing'},
{id:'navy-casual-jacket',name:'Navy casual jacket',category:'Outerwear',status:'missing'},
{id:'grey-tee',name:'Grey T-shirt',category:'Top',status:'missing'},
{id:'grey-cardigan',name:'Grey cardigan',category:'Outerwear',status:'missing'},
{id:'white-tee',name:'White T-shirt',category:'Top',status:'missing'},
{id:'dark-chelsea',name:'Dark Chelsea boots',category:'Shoes',status:'missing'},
{id:'charcoal-overcoat',name:'Charcoal overcoat',category:'Outerwear',status:'missing'},
{id:'navy-crewneck',name:'Navy crewneck sweater',category:'Top',status:'missing'},
{id:'brown-leather-jacket',name:'Brown leather jacket',category:'Outerwear',status:'missing'},
{id:'black-turtleneck',name:'Black turtleneck',category:'Top',status:'missing'},
{id:'brown-chelsea',name:'Brown leather Chelsea boots',category:'Shoes',status:'missing'},
{id:'beige-blazer',name:'Beige unstructured blazer',category:'Outerwear',status:'missing'},
{id:'tan-suede-derbies',name:'Tan suede derby shoes',category:'Shoes',status:'missing'},
{id:'grey-blazer',name:'Grey blazer',category:'Outerwear',status:'missing'},
{id:'brown-brogues',name:'Brown brogue shoes',category:'Shoes',status:'missing'},
{id:'navy-cardigan',name:'Navy cardigan',category:'Outerwear',status:'missing'},
{id:'olive-henley',name:'Olive long-sleeve henley',category:'Top',status:'missing'}
].forEach(addPiece);
[
{id:'family-dark-knit-chelsea',name:'Dark crewneck + dark chinos + Chelsea',hero:'look-14',looks:['look-14']},
{id:'family-navy-jacket-tan',name:'Navy jacket + grey tee + navy chinos',hero:'look-15',looks:['look-15']},
{id:'family-grey-cardigan-dark',name:'Grey cardigan + white tee + dark chinos',hero:'look-16',looks:['look-16']},
{id:'family-overcoat-navy',name:'Charcoal coat + navy sweater + dark chinos',hero:'look-17',looks:['look-17']},
{id:'family-leather-beige',name:'Brown leather + black turtleneck + beige chinos',hero:'look-18',looks:['look-18']},
{id:'family-beige-blazer-navy',name:'Beige blazer + white shirt + navy chinos',hero:'look-19',looks:['look-19']},
{id:'family-navy-blazer-lightblue',name:'Navy blazer + light blue shirt + dark chinos',hero:'look-20',looks:['look-20']},
{id:'family-grey-blazer-denim',name:'Grey blazer + white shirt + dark denim',hero:'look-21',looks:['look-21']},
{id:'family-cardigan-light',name:'Navy cardigan + light blue shirt + beige chinos',hero:'look-25',looks:['look-25']},
{id:'family-henley-denim',name:'Olive henley + dark denim + Chelsea',hero:'look-26',looks:['look-26']}
].forEach(addFamily);
[
{id:'look-14',family:'family-dark-knit-chelsea',name:'Dark crewneck + dark chinos + tan Chelsea',image:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_212217_9f084bfc-bfad-4f5e-a89d-a3b569e863e9_min.webp',formal:2,badges:['Weekend','Dinner'],pieces:['dark-crewneck','dark-chinos','tan-chelsea']},
{id:'look-15',family:'family-navy-jacket-tan',name:'Navy jacket + grey tee + navy chinos + tan Chelsea',image:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_212216_625c433f-921c-478e-a264-7ad9c12a8f76_min.webp',formal:2,badges:['Weekend','Travel','Dinner'],pieces:['navy-casual-jacket','grey-tee','navy-trousers','tan-chelsea']},
{id:'look-16',family:'family-grey-cardigan-dark',name:'Grey cardigan + white tee + dark chinos + dark Chelsea',image:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_212216_efbd469d-25ea-4a45-8b47-feffb01c2abd_min.webp',formal:2,badges:['Weekend','Dinner'],pieces:['grey-cardigan','white-tee','dark-chinos','dark-chelsea']},
{id:'look-17',family:'family-overcoat-navy',name:'Charcoal overcoat + navy crewneck + dark chinos + tan Chelsea',image:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_212320_bb50fd54-e43c-4389-89f0-adb909e48c59_min.webp',formal:3,badges:['Office','Dinner','Travel'],pieces:['charcoal-overcoat','navy-crewneck','dark-chinos','tan-chelsea']},
{id:'look-18',family:'family-leather-beige',name:'Brown leather jacket + black turtleneck + beige chinos',image:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_212217_e39abbe1-7708-4a86-97d4-f8eef61507eb_min.webp',formal:2,badges:['Weekend','Dinner','Travel'],pieces:['brown-leather-jacket','black-turtleneck','beige-chinos','brown-chelsea']},
{id:'look-19',family:'family-beige-blazer-navy',name:'Beige blazer + white shirt + navy chinos + tan suede derbies',image:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_212217_6813e88a-c7c0-428d-94ce-6deed77917b3_min.webp',formal:4,badges:['Office','Dinner'],pieces:['beige-blazer','white-shirt','navy-trousers','tan-suede-derbies','brown-belt']},
{id:'look-20',family:'family-navy-blazer-lightblue',name:'Navy blazer + light blue shirt + dark chinos + tan suede derbies',image:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_212321_32b3cb73-b6c3-49b7-b3a7-e55d6613c338_min.webp',formal:4,badges:['Office','Dinner'],pieces:['navy-blazer','light-blue-oxford','charcoal-trousers','tan-suede-derbies','brown-belt']},
{id:'look-21',family:'family-grey-blazer-denim',name:'Grey blazer + white shirt + dark denim + brown brogues',image:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_212321_67675188-91d5-4813-9cde-91f3e4d57de8_min.webp',formal:3,badges:['Office','Dinner','Weekend'],pieces:['grey-blazer','white-shirt','dark-denim','brown-brogues','brown-belt']},
{id:'look-22',family:'family-lightblue-beige',name:'Light blue Oxford + beige chinos + tan suede derbies',image:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_212321_f8b3729a-a88c-47bd-80ba-4c4f8dcc6bd2_min.webp',formal:3,badges:['Office','Weekend','Travel'],pieces:['light-blue-oxford','beige-chinos','tan-suede-derbies','brown-belt']},
{id:'look-23',family:'family-white-navy',name:'Navy blazer + white polo + navy chinos + white sneakers',image:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_212357_93513959-c85e-4bbd-9284-aca5f056f90d_min.webp',formal:3,badges:['Office','Dinner','Weekend'],pieces:['navy-blazer','white-polo','navy-trousers','white-leather-sneakers']},
{id:'look-24',family:'family-dark-blazer-dark',name:'Dark blazer + white tee + dark chinos + tan Chelsea',image:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_212438_612f912d-0525-4623-84f9-8c4cd7358924_min.webp',formal:3,badges:['Dinner','Office','Weekend'],pieces:['navy-blazer','white-tee','dark-chinos','tan-chelsea']},
{id:'look-25',family:'family-cardigan-light',name:'Navy cardigan + light blue shirt + beige chinos + brown loafers',image:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_212357_5ab8ee71-8352-456b-aefe-5621768450cc_min.webp',formal:3,badges:['Office','Dinner','Weekend'],pieces:['navy-cardigan','light-blue-oxford','beige-chinos','brown-loafers','brown-belt']},
{id:'look-26',family:'family-henley-denim',name:'Olive henley + dark denim + tan Chelsea',image:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_212438_f74c765b-d8b8-49fd-92b0-5887afdd5126_min.webp',formal:1,badges:['Weekend','Travel'],pieces:['olive-henley','dark-denim','tan-chelsea']}
].forEach(addLook);
addVariant('family-lightblue-beige','look-22');
addVariant('family-white-navy','look-23');
addVariant('family-dark-blazer-dark','look-24');
})();