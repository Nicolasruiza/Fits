(()=>{
  const D=window.FITS_DATA;
  if(!D)return;

  const getPiece=id=>D.pieces.find(p=>p.id===id);
  const owned=id=>typeof isOwned==='function'?isOwned(id):false;
  const missing=l=>(l.pieces||[]).filter(id=>!owned(id));

  function impactFor(p){
    let used=0;
    let completes=0;
    let nearReady=0;
    let distance=0;
    const families=new Set();
    const completedFamilies=new Set();
    const nearFamilies=new Set();

    D.looks.forEach(l=>{
      if(!(l.pieces||[]).includes(p.id))return;
      const m=missing(l);
      if(!m.includes(p.id))return;
      used++;
      families.add(l.family);
      distance+=1/Math.max(1,m.length);
      if(m.length===1){
        completes++;
        completedFamilies.add(l.family);
      }else if(m.length===2){
        nearReady++;
        nearFamilies.add(l.family);
      }
    });

    const familyReach=families.size;
    const score=(completedFamilies.size*1200)+(completes*500)+(nearFamilies.size*220)+(nearReady*90)+(familyReach*45)+(distance*35)+(used*4);
    return {...p,used,completes,nearReady,familyReach,completedFamilies:completedFamilies.size,nearFamilies:nearFamilies.size,distance,score};
  }

  function reason(p){
    if(p.completes>0){
      return {
        tier:'ready',
        label:p.completes===1?'UNLOCK NOW':`UNLOCK ${p.completes} LOOKS`,
        headline:`Completes ${p.completes} wearable look${p.completes===1?'':'s'} now`,
        support:p.completedFamilies===1?'Finishes 1 style family immediately.':`Finishes ${p.completedFamilies} style families immediately.`
      };
    }
    if(p.nearReady>0){
      return {
        tier:'near',
        label:'HIGH IMPACT',
        headline:`Gets ${p.nearReady} look${p.nearReady===1?'':'s'} to one piece away`,
        support:`Useful across ${p.familyReach} style famil${p.familyReach===1?'y':'ies'} · ${p.used} real variant${p.used===1?'':'s'}.`
      };
    }
    if(p.familyReach>1){
      return {
        tier:'reach',
        label:'VERSATILE',
        headline:`Helps ${p.familyReach} style families`,
        support:`Appears in ${p.used} real variant${p.used===1?'':'s'} across your saved looks.`
      };
    }
    return {
      tier:'base',
      label:'LOWER PRIORITY',
      headline:'Helps 1 style family',
      support:`Appears in ${p.used} real variant${p.used===1?'':'s'} and does not complete one yet.`
    };
  }

  window.renderUnlock=function(){
    const items=D.pieces
      .filter(p=>!owned(p.id))
      .map(impactFor)
      .filter(x=>x.used)
      .sort((a,b)=>b.score-a.score||b.familyReach-a.familyReach||b.used-a.used||a.name.localeCompare(b.name));

    const immediate=items.filter(x=>x.completes>0).length;
    const highImpact=items.filter(x=>!x.completes&&x.nearReady>0).length;

    document.body.innerHTML=`<div class="app wardrobe-v2">
      ${headerBar('Unlock','Buy fewer pieces. Unlock more outfits. Ranked from your actual wardrobe and saved looks.','smart buys')}
      <main>
        <div class="unlock-summary">
          <div><b>${immediate}</b><span>can unlock a look now</span></div>
          <div><b>${highImpact}</b><span>high-impact next buys</span></div>
          <div><b>${items.length}</b><span>missing pieces ranked</span></div>
        </div>
        <div class="notice">The ranking rewards <b>complete outfits first</b>, then pieces that get several real looks close to wearable. A repeated item inside one family no longer dominates the list.</div>
        <div class="unlock-list-v2">${items.map((p,i)=>{
          const r=reason(p);
          return `<article class="unlock-card-v2 ${r.tier}">
            <div class="unlock-photo">${piecePhoto(p)}<span class="unlock-rank">${i+1}</span></div>
            <div class="unlock-copy-v2">
              <div class="unlock-title-row"><strong>${p.name}</strong><span class="impact-pill ${r.tier}">${r.label}</span></div>
              <span>${r.headline}</span>
              <small>${r.support}</small>
              <button class="find-item" onclick="searchItem('${p.id}')">⌕ Find item to buy <span>↗</span></button>
            </div>
          </article>`;
        }).join('')}</div>
      </main>${nav('unlock')}
    </div>`;
  };
})();