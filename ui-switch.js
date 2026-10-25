/* Sends classic pages to their v5 version when the v5 UI is chosen (the default).
   ?ui=classic or ?ui=v5 changes the choice on this device; &classic=1 opens one classic page
   without changing it (used by "Edit swaps" on the v5 piece page). */
(()=>{
  const DEFAULT_UI='v5';
  const url=new URL(window.location.href),q=url.searchParams;
  const chosen=q.get('ui');
  if(chosen==='v5'||chosen==='classic'){try{localStorage.setItem('fitsUI',JSON.stringify(chosen))}catch(e){}}
  if(q.get('classic')==='1')return;
  let ui=DEFAULT_UI;
  try{const saved=JSON.parse(localStorage.getItem('fitsUI')||'null');if(saved==='v5'||saved==='classic')ui=saved}catch(e){}
  if(ui!=='v5')return;
  const page=url.pathname.split('/').pop()||'index.html';
  let target=null;
  if(page==='wardrobe.html'){
    if(q.get('piece'))target=`piece-v5.html?id=${encodeURIComponent(q.get('piece'))}`;
    else target=q.get('status')==='missing'?'wardrobe-v5.html?status=missing':'wardrobe-v5.html';
  }else if(page==='stats.html')target='stats-v5.html';
  else if(page==='piece.html'&&q.get('id'))target=`piece-v5.html?id=${encodeURIComponent(q.get('id'))}`;
  if(target)window.location.replace(target);
})();
