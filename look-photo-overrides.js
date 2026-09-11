(()=>{
  const photos={
    'look-14':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_222241_5d57171e-3b7d-4897-987a-6579aedc35e7.png',
    'look-15':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_224726_05c69f6b-3d8a-42a6-9be7-3ef226ad74e7_min.webp',
    'look-17':'https://d8j0ntlcm91z4.cloudfront.net/user_3CUt7UpZE1V87ctJC99CMT6AYSe/hf_20260911_224726_46309108-84ae-4f66-9e19-e8b05f391859_min.webp'
  };
  if(!window.FITS_DATA||!Array.isArray(window.FITS_DATA.looks))return;
  window.FITS_DATA.looks.forEach(l=>{if(photos[l.id])l.image=photos[l.id];});
})();