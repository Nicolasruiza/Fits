(()=>{
  const D=window.FITS_DATA;if(!D)return;
  const pieces=new Map((D.pieces||[]).map(p=>[p.id,p]));
  const looks=new Map((D.looks||[]).map(l=>[l.id,l]));
  const signature=l=>{
    const pants=(l.pieces||[]).filter(id=>pieces.get(id)?.category==='Pants').sort();
    const tops=(l.pieces||[]).filter(id=>pieces.get(id)?.category==='Top');
    const sweaters=tops.filter(id=>/(sweater|crew[- ]?neck|v-neck|quarter[- ]?zip|turtleneck)/i.test(pieces.get(id)?.name||''));
    const visibleTops=(sweaters.length?sweaters:tops).sort();
    return [...visibleTops,...pants].join('|');
  };
  const rebuilt=[];
  (D.families||[]).forEach(f=>{
    const groups=new Map();
    (f.looks||[]).map(id=>looks.get(id)).filter(l=>l&&l.family===f.id).forEach(l=>{const key=signature(l)||l.id;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(l)});
    [...groups.values()].forEach((group,index)=>{
      const hero=group.some(l=>l.id===f.hero)?f.hero:group[0].id,id=index===0?f.id:`${f.id}--${hero}`;
      group.forEach(l=>{l.family=id});
      rebuilt.push({...f,id,hero,looks:group.map(l=>l.id),name:index===0&&groups.size===1?f.name:group[0].name.replace(/\s+\+\s+[^+]+$/,'')});
    });
  });
  D.families=rebuilt;
})();
