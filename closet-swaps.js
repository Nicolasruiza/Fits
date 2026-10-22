(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const piece=id=>(D.pieces||[]).find(p=>p.id===id);
  const safe=(key,fallback)=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch(e){return fallback}};
  const owned=(id,wardrobe)=>wardrobe?.[id]==='owned'||(!wardrobe?.[id]&&piece(id)?.status==='owned');
  // Interchangeable pieces are chosen by the user (Wardrobe > piece > Interchangeable with), always both ways
  // and only within one category. The map is {pieceId:[otherPieceIds]}.
  const readGroups=()=>safe('fitsInterchangeable',{});
  const interchangeable=(id,groups=readGroups())=>(groups?.[id]||[]).filter(other=>piece(other)&&piece(other).category===piece(id)?.category);
  function link(a,b){
    if(!piece(a)||!piece(b)||a===b||piece(a).category!==piece(b).category)return;
    const groups=readGroups();
    groups[a]=[...new Set([...(groups[a]||[]),b])];
    groups[b]=[...new Set([...(groups[b]||[]),a])];
    localStorage.setItem('fitsInterchangeable',JSON.stringify(groups));
  }
  function unlink(a,b){
    const groups=readGroups();
    groups[a]=(groups[a]||[]).filter(x=>x!==b);groups[b]=(groups[b]||[]).filter(x=>x!==a);
    [a,b].forEach(k=>{if(!groups[k].length)delete groups[k]});
    localStorage.setItem('fitsInterchangeable',JSON.stringify(groups));
  }
  // A swap is only suggested when the user said the two pieces are interchangeable and the replacement is owned.
  function suggest(look,originalId,wardrobe,rejected=safe('fitsRejectedSwaps',{}),groups=readGroups()){
    const blocked=new Set(rejected?.[look.id]?.[originalId]||[]),inLook=new Set(look.pieces||[]);
    const candidates=interchangeable(originalId,groups).map(piece).filter(p=>p&&owned(p.id,wardrobe)&&!blocked.has(p.id)&&!inLook.has(p.id)).sort((a,b)=>a.name.localeCompare(b.name));
    return candidates[0]?{piece:candidates[0],score:200}:null;
  }
  function replacementFor(look,originalId,wardrobe,swaps=safe('fitsClosetSwaps',{}),groups=readGroups()){
    const id=swaps?.[look.id]?.[originalId],original=piece(originalId),replacement=piece(id);
    return id&&replacement&&original?.category===replacement.category&&owned(id,wardrobe)&&interchangeable(originalId,groups).includes(id)?replacement:null;
  }
  function accepted(look,wardrobe,swaps=safe('fitsClosetSwaps',{})){
    return(look.pieces||[]).map(id=>({original:piece(id),replacement:replacementFor(look,id,wardrobe,swaps)})).filter(x=>x.replacement);
  }
  function missing(look,wardrobe,swaps=safe('fitsClosetSwaps',{})){
    return(look.pieces||[]).filter(id=>!owned(id,wardrobe)&&!replacementFor(look,id,wardrobe,swaps));
  }
  function accept(lookId,originalId,replacementId){const all=safe('fitsClosetSwaps',{});all[lookId]={...(all[lookId]||{}),[originalId]:replacementId};localStorage.setItem('fitsClosetSwaps',JSON.stringify(all))}
  function reject(lookId,originalId,replacementId){const all=safe('fitsRejectedSwaps',{}),ids=new Set(all?.[lookId]?.[originalId]||[]);ids.add(replacementId);all[lookId]={...(all[lookId]||{}),[originalId]:[...ids]};localStorage.setItem('fitsRejectedSwaps',JSON.stringify(all))}
  function remove(lookId,originalId){const all=safe('fitsClosetSwaps',{});if(all[lookId]){delete all[lookId][originalId];if(!Object.keys(all[lookId]).length)delete all[lookId]}localStorage.setItem('fitsClosetSwaps',JSON.stringify(all))}
  window.FITS_SWAPS={owned,interchangeable,link,unlink,suggest,replacementFor,accepted,missing,accept,reject,remove,read:()=>safe('fitsClosetSwaps',{})};
})();
