/* FITS seasonal explorer: progressive browsing, soft warmth ranking, weather-led default. */
(()=>{
 'use strict';
 const D=window.FITS_DATA;
 if(!D || document.body.dataset.page==='wardrobe')return;
 const seasons=['Summer','Transitional','Cold'];
 const labels={Summer:'Summer',Transitional:'Transition',Cold:'Cold'};
 const levels=['Very light','Light','Medium','Warm','Very warm'];
 let manuallyChosen=null,manualLevel=null,open=null,level=2,visibleCount=8,initialized=false;
 const readWeather=()=>{try{return JSON.parse(localStorage.getItem('fitsWeatherHome')||'null')}catch(e){return null}};
 const look=id=>(D.looks||[]).find(x=>x.id===id);
 const piece=id=>(D.pieces||[]).find(x=>x.id===id);
 function pieceWarmth(p){
   const name=(p?.name||'').toLowerCase(),category=p?.category||'';
   if(category==='Shoes'||category==='Accessory')return 0;
   if(/shorts|bermuda/.test(name))return-1.4;
   if(/overcoat|topcoat|parka|puffer/.test(name))return 3.3;
   if(/leather jacket|bomber|suede jacket/.test(name))return 2.25;
   if(/overshirt|blazer|casual jacket/.test(name))return 1.65;
   if(/turtleneck|cable.?knit|heavy sweater/.test(name))return 2.15;
   if(/sweater|knit|crew.?neck|cardigan|quarter.?zip|v.?neck/.test(name))return 1.75;
   if(/long.?sleeve|henley/.test(name))return .85;
   if(/button.?down|buttonup|oxford|shirt|microcheck|gingham|linen/.test(name))return .65;
   if(/tee|t-shirt|polo/.test(name))return-.35;
   if(category==='Pants')return .35;
   return .15;
 }
 function warmth(v){
   if(!v)return 1;
   const clothes=(v.pieces||[]).map(piece).filter(Boolean),tops=clothes.filter(p=>p.category==='Top'||p.category==='Outerwear');
   const total=clothes.reduce((sum,p)=>sum+pieceWarmth(p),0);
   const layerBonus=Math.max(0,tops.length-1)*.55;
   return total+layerBonus;
 }
 function levelsForSeason(s){
   // Relative scale within each season, not an absolute temperature classification.
   return s==='Summer'?[-1.4,-.45,.35,1.2,2.2]:s==='Cold'?[1.9,2.8,3.7,4.8,6]:[-.25,.75,1.7,2.8,4.1];
 }
 function weatherDefault(){
   const w=readWeather(),t=Number(w?.temp),high=Number(w?.maxTemp),goodT=Number.isFinite(t),goodHigh=Number.isFinite(high);
   if(!goodT&&!goodHigh)return{season:'Transitional',level:2,hasWeather:false};
   const cur=goodT?t:high,peak=goodHigh?high:cur;
   let season='Transitional';
   if(peak>=25 && cur>=18)season='Summer';
   else if(peak<=11 || (cur<=2&&peak<=13))season='Cold';
   let selected;
   if(season==='Summer')selected=cur>=28?0:cur>=24?1:cur>=21?2:cur>=18?3:4;
   else if(season==='Cold')selected=cur>=11?0:cur>=8?1:cur>=4?2:cur>=0?3:4;
   else selected=cur>=21?0:cur>=17?1:cur>=12?2:cur>=4?3:4;
   return{season,level:selected,hasWeather:true,temp:cur,high:peak};
 }
 function selectedVariant(card){
   const id=card.dataset.smartLook;
   if(id)return look(id);
   const href=card.getAttribute('href')||'';
   const fid=decodeURIComponent((href.match(/[?&]family=([^&]+)/)||[])[1]||'');
   const f=(D.families||[]).find(x=>x.id===fid);
   return look(f?.hero)||look(f?.looks?.[0]);
 }
 function score(card,season){
   const v=selectedVariant(card);
   const w=warmth(v);
   const expected=levelsForSeason(season)[level];
   const ready=card.dataset.ready==='yes'?-0.3:0;
   return Math.abs(w-expected)+ready;
 }
 function makeHeader(group,s,opened,count){
   const title=group.querySelector('.look-group-title');
   if(!title)return;
   title.innerHTML='';
   const button=document.createElement('button');
   button.className='thermal-season-button';
   button.type='button';
   button.setAttribute('aria-expanded',String(opened));
   const left=document.createElement('span');
   left.className='thermal-season-name';
   const eyebrow=document.createElement('small');eyebrow.textContent=s==='Summer'?'Light pieces':s==='Cold'?'Warm layers':'Easy layers';
   const name=document.createElement('strong');name.textContent=labels[s];
   left.append(eyebrow,name);
   const right=document.createElement('span');
   right.className='thermal-season-count';
   right.innerHTML='<span><b>'+count+'</b> looks</span><i class="'+(opened?'is-open':'')+'" aria-hidden="true"></i>';
   button.append(left,right);
   button.addEventListener('click',()=>{
     if(open===s){open=null;manuallyChosen='';}
     else{open=s;manuallyChosen=s;}
     manualLevel=null;
     visibleCount=8;
     update();
   });
   title.append(button);
 }
 function addThermometer(group,s){
   const rail=group.querySelector('.look-group-rail');
   if(!rail)return;
   let shelf=group.querySelector('.thermal-content');
   if(!shelf){
     shelf=document.createElement('div');
     shelf.className='thermal-content';
     rail.before(shelf);
     shelf.append(rail);
   }
   let aside=shelf.querySelector('.thermal-aside');
   if(!aside){
     aside=document.createElement('div');
     aside.className='thermal-aside';
     shelf.prepend(aside);
   }
   aside.replaceChildren();
   const hot=document.createElement('span');hot.textContent='HOT';hot.className='thermal-end hot';aside.append(hot);
   const track=document.createElement('div');track.className='thermal-track';track.setAttribute('role','group');track.setAttribute('aria-label','Outfit warmth');
   levels.forEach((label,i)=>{
     const btn=document.createElement('button');
     btn.type='button';
     btn.className='thermal-stop'+(level===i?' selected':'');
     btn.setAttribute('aria-label',label+' outfits');
     btn.setAttribute('aria-pressed',String(level===i));
     btn.title=label;
     btn.innerHTML='<span></span>';
     btn.addEventListener('click',()=>{level=i;manualLevel=i;visibleCount=8;update()});
     track.append(btn);
   });
   aside.append(track);
   const cold=document.createElement('span');cold.textContent='COLD';cold.className='thermal-end cold';aside.append(cold);
   let subtitle=group.querySelector('.thermal-level-caption');
   if(!subtitle){subtitle=document.createElement('p');subtitle.className='thermal-level-caption';shelf.before(subtitle)}
   subtitle.textContent=levels[level]+' layers · warmer outfits toward the blue';
 }
 function update(){
   const grid=document.querySelector('.grid');
   if(!grid)return;
   const groups=[...grid.querySelectorAll(':scope > .look-group')];
   if(!groups.length)return;
   const automatic=weatherDefault();
   if(!initialized){open=automatic.season;level=automatic.level;initialized=true}
   else if(manuallyChosen===null){open=automatic.season;if(manualLevel===null)level=automatic.level}
   else if(manuallyChosen===''){open=null}
   if(open&&manualLevel===null)level=automatic.level;
   groups.forEach(group=>{
     const s=group.dataset.season;
     const rail=group.querySelector('.look-group-rail');
     if(!rail)return;
     // Undo old smart-home compact clipping; new layout controls visibility.
     group.classList.remove('compact','recommended','expanded');
     group.classList.add('thermal-group');
     const cards=[...rail.querySelectorAll(':scope > a.card')];
     const shown=cards.filter(c=>!c.classList.contains('hidden')&&!c.classList.contains('smart-hidden'));
     makeHeader(group,s,open===s,shown.length);
     group.querySelector('.look-group-more')?.remove();
     group.querySelector('.thermal-content')?.removeAttribute('hidden');
     group.querySelector('.thermal-level-caption')?.remove();
     group.querySelector('.thermal-aside')?.remove();
     // Keep the visual rail truthful: light, short-sleeve looks begin by HOT and
     // layered knits/jackets progress toward COLD. The selected stop remains the
     // weather or user preference and never removes looks.
     cards.sort((a,b)=>warmth(selectedVariant(a))-warmth(selectedVariant(b))||score(a,s)-score(b,s));
     cards.forEach(card=>rail.append(card));
     if(open===s){
       group.classList.add('thermal-open');
       addThermometer(group,s);
       const count=shown.length;
       cards.forEach(card=>{card.classList.toggle('thermal-page-hidden',shown.indexOf(card)>=visibleCount)});
       let more=group.querySelector('.thermal-load-more');
       if(count>visibleCount){
         if(!more){more=document.createElement('button');more.type='button';more.className='thermal-load-more';group.append(more)}
         more.textContent='Show more looks ('+(count-visibleCount)+' remaining)';
         more.onclick=()=>{visibleCount+=8;update()};
       }else more?.remove();
     }else{
       group.classList.remove('thermal-open');
       const shelf=group.querySelector('.thermal-content');
       if(shelf)shelf.hidden=true;
       cards.forEach(card=>card.classList.add('thermal-page-hidden'));
       group.querySelector('.thermal-load-more')?.remove();
     }
   });
   const hint=document.querySelector('.thermal-current-note')||document.createElement('div');
   hint.className='thermal-current-note';
   const autoText=automatic.hasWeather?'Weather suggestion':'Browse by warmth';
   hint.textContent=autoText+' · '+(open?labels[open]:'All seasons collapsed')+(open?' · '+levels[level]:'');
   const head=document.querySelector('.smart-rotation-head');
   if(head){head.after(hint)}
 }
 // Existing smart-home repaints cards and groups; enhance only after it has finished.
 window.addEventListener('fits:home-enhanced',()=>requestAnimationFrame(update));
 document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(update));
 requestAnimationFrame(update);
})();
