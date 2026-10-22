(()=>{
  const D=window.FITS_DATA,S=window.FITS_SWAPS;if(!D||!S)return;
  const safe=(key,fallback)=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch(e){return fallback}},piece=id=>D.pieces.find(p=>p.id===id),q=new URLSearchParams(location.search);
  const active=D.looks.find(l=>l.id===q.get('look'))||D.looks.find(l=>l.family===q.get('family'));if(!active)return;
  window.acceptClosetSwap=(originalId,replacementId)=>{S.accept(active.id,originalId,replacementId);location.reload()};
  window.rejectClosetSwap=(originalId,replacementId)=>{S.reject(active.id,originalId,replacementId);location.reload()};
  window.removeClosetSwap=originalId=>{S.remove(active.id,originalId);location.reload()};
  function enhance(){
    const hero=document.querySelector('.hero'),pieces=document.querySelector('.pieces');if(!hero||!pieces)return;
    const wardrobe=safe('fitsWardrobe',{}),swaps=safe('fitsClosetSwaps',{}),rejected=safe('fitsRejectedSwaps',{}),accepted=S.accepted(active,wardrobe,swaps);
    let badge=hero.querySelector('.adapted-look-badge');if(accepted.length){if(!badge){badge=document.createElement('span');badge.className='adapted-look-badge';hero.appendChild(badge)}badge.textContent=`ADAPTED · ${accepted.length} ${accepted.length===1?'SWAP':'SWAPS'}`}else badge?.remove();
    (active.pieces||[]).forEach(id=>{
      const card=pieces.querySelector(`[data-piece-id="${CSS.escape(id)}"]`);if(!card||card.querySelector('.closet-swap'))return;
      const replacement=S.replacementFor(active,id,wardrobe,swaps),isOwned=S.owned(id,wardrobe),suggestion=!isOwned&&!replacement?S.suggest(active,id,wardrobe,rejected):null;
      if(replacement){const pill=card.querySelector('.own-pill');if(pill){pill.className='own-pill swap';pill.textContent='SWAPPED'}const box=document.createElement('div');box.className='closet-swap accepted';box.innerHTML=`<span>Closet swap</span><strong>${piece(id)?.name} → ${replacement.name}</strong><small>This adapted look counts as complete.</small><button type="button" onclick="event.stopPropagation();removeClosetSwap('${id}')">Use original instead</button>`;card.appendChild(box)}
      else if(suggestion){const box=document.createElement('div');box.className='closet-swap suggested';box.innerHTML=`<span>Suggested replacement</span><strong>${piece(id)?.name} → ${suggestion.piece.name}</strong><small>You marked these as interchangeable.</small><div><button class="use" type="button" onclick="event.stopPropagation();acceptClosetSwap('${id}','${suggestion.piece.id}')">Use this swap</button><button type="button" onclick="event.stopPropagation();rejectClosetSwap('${id}','${suggestion.piece.id}')">Not similar enough</button></div>`;card.appendChild(box)}
    });
  }
  let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance()})}).observe(document.getElementById('root')||document.body,{childList:true,subtree:true});enhance();
})();
