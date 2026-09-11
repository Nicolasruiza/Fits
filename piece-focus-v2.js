(()=>{
  const F={
    'navy-bomber':{src:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_222241_5d57171e-3b7d-4897-987a-6579aedc35e7.png',x:50,y:35,s:2.0},
    'grey-tee':{src:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_222241_5d57171e-3b7d-4897-987a-6579aedc35e7.png',x:50,y:34,s:2.25},
    'tan-chelsea':{src:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_222241_5d57171e-3b7d-4897-987a-6579aedc35e7.png',x:50,y:91,s:2.35},
    'charcoal-cardigan':{src:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_224726_05c69f6b-3d8a-42a6-9be7-3ef226ad74e7_min.webp',x:50,y:36,s:2.0},
    'white-tee':{src:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_224726_05c69f6b-3d8a-42a6-9be7-3ef226ad74e7_min.webp',x:50,y:34,s:2.25},
    'dark-chinos':{src:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_224726_05c69f6b-3d8a-42a6-9be7-3ef226ad74e7_min.webp',x:50,y:63,s:2.0},
    'black-chelsea':{src:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_224726_05c69f6b-3d8a-42a6-9be7-3ef226ad74e7_min.webp',x:50,y:91,s:2.35},
    'brown-leather-jacket':{src:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_224726_46309108-84ae-4f66-9e19-e8b05f391859_min.webp',x:50,y:36,s:2.0},
    'black-turtleneck':{src:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_224726_46309108-84ae-4f66-9e19-e8b05f391859_min.webp',x:50,y:33,s:2.3},
    'beige-chinos':{src:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_224726_46309108-84ae-4f66-9e19-e8b05f391859_min.webp',x:50,y:64,s:2.0},
    'brown-chelsea':{src:'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_224726_46309108-84ae-4f66-9e19-e8b05f391859_min.webp',x:50,y:91,s:2.35}
  };
  const base=piecePhoto;
  piecePhoto=function(p){
    const f=F[p.id];
    if(!f)return base(p);
    return `<img class="piece-focus-img" src="${f.src}" alt="${p.name}" loading="lazy" style="--pf-x:${f.x}%;--pf-y:${f.y}%;--pf-s:${f.s}">`;
  };
})();