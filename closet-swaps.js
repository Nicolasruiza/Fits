(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const piece=id=>(D.pieces||[]).find(p=>p.id===id);
  const safe=(key,fallback)=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch(e){return fallback}};
  const owned=(id,wardrobe)=>wardrobe?.[id]==='owned'||(!wardrobe?.[id]&&piece(id)?.status==='owned');
  const color=name=>{name=String(name||'').toLowerCase();if(/olive|green|moss/.test(name))return'green';if(/navy|blue|indigo/.test(name))return'blue';if(/burgundy|red/.test(name))return'red';if(/brown|cognac|camel|tan/.test(name))return'brown';if(/cream|beige|white|stone/.test(name))return'light';if(/grey|gray|charcoal|black/.test(name))return'dark';return'other'};
  const role=name=>{name=String(name||'').toLowerCase();if(/sneaker/.test(name))return'sneaker';if(/chelsea|boot/.test(name))return'boot';if(/loafer/.test(name))return'loafer';if(/derby|brogue|cap-toe|dress shoe|lace-up/.test(name))return'dress-shoe';if(/sweater|crew[- ]?neck|v-neck|quarter[- ]?zip|turtleneck/.test(name))return'sweater';if(/button|shirt|oxford|gingham|check/.test(name))return'shirt';if(/polo/.test(name))return'polo';if(/henley/.test(name))return'henley';if(/tee|t-shirt/.test(name))return'tee';if(/denim|jean/.test(name))return'denim';if(/chino|trouser|pant|short/.test(name))return'pants';if(/jacket|blazer|coat|overshirt|cardigan/.test(name))return'outerwear';return'other'};
  const colorNear=(a,b)=>a===b||(['light','brown'].includes(a)&&['light','brown'].includes(b))||(['blue','dark'].includes(a)&&['blue','dark'].includes(b));
  const curated={'olive-tee':['owned-green-crewneck']};
  function score(original,candidate,look){
    if(!original||!candidate||original.id===candidate.id||original.category!==candidate.category)return-Infinity;
    const oc=color(original.name),cc=color(candidate.name),or=role(original.name),cr=role(candidate.name);let value=100;
    if(oc===cc)value+=38;else if(colorNear(oc,cc))value+=17;else value-=28;
    if(or===cr)value+=35;
    else if(original.category==='Top'&&['tee','henley','polo','shirt'].includes(or)&&cr==='sweater'&&(look.pieces||[]).some(id=>piece(id)?.category==='Outerwear'))value+=12;
    else if(original.category==='Shoes')value-=28;
    else value-=8;
    return value;
  }
  function suggest(look,originalId,wardrobe,rejected=safe('fitsRejectedSwaps',{})){
    const original=piece(originalId),blocked=new Set(rejected?.[look.id]?.[originalId]||[]),preferred=curated[originalId]||[];
    const candidates=(D.pieces||[]).filter(p=>owned(p.id,wardrobe)&&!blocked.has(p.id)&&p.id!==originalId).map(p=>({piece:p,score:score(original,p,look)+(preferred.includes(p.id)?100:0)})).filter(x=>x.score>=125).sort((a,b)=>b.score-a.score||a.piece.name.localeCompare(b.piece.name));
    return candidates[0]||null;
  }
  function replacementFor(look,originalId,wardrobe,swaps=safe('fitsClosetSwaps',{})){
    const id=swaps?.[look.id]?.[originalId],original=piece(originalId),replacement=piece(id);
    return id&&replacement&&original?.category===replacement.category&&owned(id,wardrobe)?replacement:null;
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
  window.FITS_SWAPS={owned,color,role,score,suggest,replacementFor,accepted,missing,accept,reject,remove,read:()=>safe('fitsClosetSwaps',{})};
})();
