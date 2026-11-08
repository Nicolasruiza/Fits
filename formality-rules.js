/* FITS formality rules: how dressed-up a look is, from the pieces it is made of, the same way
   climate-rules.js works out warmth. Each piece scores 1 (casual) to 4 (formal); a look scores the
   mean of its top, bottom, shoes and outer layer, and that score gives its style:
   Relaxed, Smart casual or Sharp. Looks filters on the style.

   Tune everything in config; no other file should hold formality thresholds. */
(()=>{
  const D=window.FITS_DATA;
  const config={
    // First matching rule wins, tested on the piece name (lower case) within its slot.
    pieces:{
      outer:[
        [/blazer/,4],[/overcoat|coat/,3],[/cardigan|suede jacket|leather jacket/,2],
        [/vest|overshirt|bomber|casual jacket|jacket/,1]
      ],
      top:[
        [/dress shirt|turtleneck|v-neck/,3],
        [/shirt(?!.*(t-shirt|sweatshirt))|oxford|button|sweater|knit|quarter-zip|polo/,2],
        [/t-shirt|tee|henley|sweatshirt|hoodie/,1]
      ],
      bottom:[
        [/dress trousers/,4],[/tailored trousers/,3],
        [/jeans|denim|joggers|shorts/,1],[/chinos|trousers|pants/,2]
      ],
      shoes:[
        [/cap-toe|dress shoes|oxford shoes/,4],[/loafers|brogue|lace-up|derby/,3],
        [/boots|casual shoes/,2],[/sneakers|sandals|espadrilles/,1]
      ]
    },
    // A slot with no matching rule counts as smart casual.
    fallback:2,
    // Look score bands: below `relaxed` is Relaxed, below `sharp` is Smart casual, the rest is Sharp.
    bands:{relaxed:1.6,sharp:2.75}
  };
  const STYLES=['Relaxed','Smart casual','Sharp'];
  const SLOTS={Outerwear:'outer',Top:'top',Pants:'bottom',Shoes:'shoes'};

  function pieceScore(piece){
    const slot=SLOTS[piece?.category];if(!slot)return null;
    const text=String(piece.name||'').toLowerCase();
    const rule=config.pieces[slot].find(([test])=>test.test(text));
    return{slot,score:rule?rule[1]:config.fallback};
  }
  // Layered tops (a shirt under a sweater) count once, as the dressier of the two.
  function lookScore(look){
    const best={};
    (look.pieces||[]).map(id=>pieceScore((D.pieces||[]).find(p=>p.id===id))).filter(Boolean)
      .forEach(({slot,score})=>{best[slot]=Math.max(best[slot]||0,score)});
    const scores=Object.values(best);
    return scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:config.fallback;
  }
  const styleOf=score=>score<config.bands.relaxed?'Relaxed':score<config.bands.sharp?'Smart casual':'Sharp';

  if(D)(D.looks||[]).forEach(l=>{l.formality=Math.round(lookScore(l)*100)/100;l.style=styleOf(l.formality)});
  window.FITS_FORMALITY={config,STYLES,pieceScore,lookScore,styleOf};
})();
