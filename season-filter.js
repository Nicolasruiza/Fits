(()=>{
  const D=window.FITS_DATA;if(!D)return;
  let occasion='All',season='All';
  const look=id=>D.looks.find(l=>l.id===id);
  const seasonsForFamily=f=>[...new Set((f.looks||[]).map(look).filter(Boolean).flatMap(l=>l.seasons||['Summer']))];
  function apply(){let visible=0;document.querySelectorAll('.card').forEach(card=>{const tags=(card.dataset.tags||'').split(','),ss=(card.dataset.seasons||'').split(',');const showOcc=occasion==='All'||tags.includes(occasion),showSeason=season==='All'||ss.includes(season),show=showOcc&&showSeason;card.classList.toggle('hidden',!show);if(show)visible++});const empty=document.querySelector('.empty');if(empty){empty.style.display=visible?'none':'block';empty.textContent=`No ${season==='All'?'':season.toLowerCase()+' '}${occasion==='All'?'looks':occasion.toLowerCase()+' looks'} yet.`}const count=document.querySelector('.filter-result-count');if(count)count.textContent=`${visible} ${visible===1?'family':'families'}`;}
  function enhance(){const chips=document.querySelector('.chips');if(!chips)return;chips.classList.add('occasion-chips');
    D.families.forEach(f=>{const card=document.querySelector(`a.card[href="detail.html?family=${f.id}"]`);if(card){const ss=seasonsForFamily(f);card.dataset.seasons=ss.join(',');const body=card.querySelector('.body');if(body&&!body.querySelector('.season-note')){const n=document.createElement('div');n.className='season-note';n.textContent=ss.join(' · ');body.appendChild(n)}}});
    [...chips.querySelectorAll('[data-season]')].forEach(x=>x.remove());
    chips.querySelectorAll('[data-filter]').forEach(btn=>{btn.classList.toggle('active',btn.dataset.filter===occasion);btn.onclick=e=>{e.preventDefault();occasion=btn.dataset.filter;chips.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x.dataset.filter===occasion));apply()}});
    if(!document.querySelector('.season-filter-wrap')){const wrap=document.createElement('div');wrap.className='season-filter-wrap';wrap.innerHTML=`<div class="filter-label-row"><span>Season</span><b class="filter-result-count"></b></div><div class="season-chips">${['All','Summer','Transitional','Cold'].map(x=>`<button class="chip season-choice ${x===season?'active':''}" data-season-choice="${x}">${x==='All'?'All seasons':x}</button>`).join('')}</div>`;chips.after(wrap);wrap.querySelectorAll('[data-season-choice]').forEach(btn=>btn.onclick=()=>{season=btn.dataset.seasonChoice;wrap.querySelectorAll('[data-season-choice]').forEach(x=>x.classList.toggle('active',x.dataset.seasonChoice===season));apply()})}
    apply();
  }
  const original=window.render;if(typeof original==='function')window.render=function(...args){const out=original.apply(this,args);enhance();return out};
  enhance();
})();