(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const safe=(k,f)=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):f}catch(e){return f}};
  const look=id=>(D.looks||[]).find(x=>x.id===id);
  const family=id=>(D.families||[]).find(x=>x.id===id);
  function ownedMap(){
    const raw=safe('fitsWardrobe',{}),m={};
    (D.pieces||[]).forEach(p=>{m[p.id]=raw[p.id]==='owned'||(!raw[p.id]&&p.status==='owned')});
    return m;
  }
  function familyId(card){try{return new URL(card.getAttribute('href'),location.href).searchParams.get('family')}catch(e){return null}}
  function bestCompleteness(f,own){
    const variants=(f.looks||[]).map(look).filter(Boolean);
    if(!variants.length)return null;
    return variants.map(v=>{
      const total=(v.pieces||[]).length;
      const have=(v.pieces||[]).filter(id=>own[id]).length;
      return{v,total,have,missing:Math.max(0,total-have)};
    }).sort((a,b)=>a.missing-b.missing||b.have-a.have||(a.v.id===f.hero?-1:1))[0];
  }
  function stateFor(x){
    if(!x||!x.total)return{label:'MISSING ALL',cls:'all'};
    if(x.missing===0)return{label:'COMPLETE',cls:'complete'};
    if(x.missing===1)return{label:'MISSING 1',cls:'one'};
    if(x.have===0)return{label:'MISSING ALL',cls:'all'};
    return{label:'MISSING SOME',cls:'some'};
  }
  function style(){
    if(document.getElementById('ownership-badge-style'))return;
    const s=document.createElement('style');s.id='ownership-badge-style';s.textContent=`
      .card .tag{display:none!important}.card .readiness-pill{display:none!important}
      .ownership-pill{position:absolute;left:8px;top:8px;z-index:8;border-radius:999px;padding:6px 8px;font-size:7px;font-weight:850;letter-spacing:.065em;box-shadow:0 2px 9px #0002;border:1px solid transparent;backdrop-filter:blur(4px)}
      .ownership-pill.complete{background:#e1ece3;color:#35533d;border-color:#c5d9c9}.ownership-pill.one{background:#f2eadf;color:#765f3f;border-color:#dfd0b9}.ownership-pill.some{background:#ece9e5;color:#655e57;border-color:#d9d2cb}.ownership-pill.all{background:#eee4e4;color:#765050;border-color:#dcc6c6}`;
    document.head.appendChild(s);
  }
  function apply(){
    style();const own=ownedMap();
    document.querySelectorAll('a.card').forEach(card=>{
      const f=family(familyId(card));if(!f)return;
      const c=bestCompleteness(f,own),st=stateFor(c),visual=card.querySelector('.visual');if(!visual)return;
      let pill=visual.querySelector('.ownership-pill');if(!pill){pill=document.createElement('span');pill.className='ownership-pill';visual.appendChild(pill)}
      pill.className=`ownership-pill ${st.cls}`;pill.textContent=st.label;
      if(c){card.dataset.completeness=st.cls;card.dataset.missing=String(c.missing);}
    });
  }
  let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})};
  apply();new MutationObserver(schedule).observe(document.getElementById('root')||document.body,{childList:true,subtree:true});
  window.addEventListener('storage',schedule);
})();