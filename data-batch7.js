(()=>{const D=window.FITS_DATA;if(!D)return;
const addPiece=p=>{if(!D.pieces.some(x=>x.id===p.id))D.pieces.push(p)};
[
['light-blue-linen-shirt','Light blue linen shirt','Top'],['white-linen-shirt','White linen shirt','Top'],['pink-linen-shirt','Pink linen shirt','Top'],['beige-linen-shirt','Beige linen shirt','Top'],
['beige-shorts','Beige tailored shorts','Pants'],['denim-shorts','Denim shorts','Pants'],['olive-shorts','Olive tailored shorts','Pants'],['grey-shorts','Grey tailored shorts','Pants'],
['cream-linen-trousers','Cream linen trousers','Pants'],['taupe-linen-trousers','Taupe linen trousers','Pants'],['beige-espadrilles','Beige espadrilles','Shoes'],['brown-sandals','Brown leather sandals','Shoes'],['navy-slip-ons','Navy slip-on shoes','Shoes'],
['black-leather-jacket','Black leather jacket','Outerwear'],['brown-suede-jacket','Brown suede jacket','Outerwear'],['blue-denim-jacket','Blue denim jacket','Outerwear']
].forEach(([id,name,category])=>addPiece({id,name,category,status:'missing'}));
D.inspirations=[...(D.inspirations||[]),
{id:'inspiration-0548',image:'assets/inspiration-0548.jpeg',title:'Warm-weather shorts',summary:'4 complete combinations',status:'Needs individual photos'},
{id:'inspiration-0549',image:'assets/inspiration-0549.jpeg',title:'Light linen trousers',summary:'3 complete combinations',status:'Needs individual photos'},
{id:'inspiration-0550',image:'assets/inspiration-0550.jpeg',title:'3F warm-weather formula',summary:'2 new shoe variants · 1 duplicate',status:'Needs individual photos'},
{id:'inspiration-0551',image:'assets/inspiration-0551.jpeg',title:'Black leather jacket',summary:'Useful outerwear reference',status:'Footwear not shown'},
{id:'inspiration-0552',image:'assets/inspiration-0552.jpeg',title:'Brown suede jacket',summary:'Useful outerwear reference',status:'Footwear not shown'},
{id:'inspiration-0553',image:'assets/inspiration-0553.jpeg',title:'Navy bomber jacket',summary:'Matches an existing wardrobe piece',status:'Footwear not shown'},
{id:'inspiration-0554',image:'assets/inspiration-0554.jpeg',title:'Blue denim jacket',summary:'Useful outerwear reference',status:'Footwear not shown'}
];
})();
