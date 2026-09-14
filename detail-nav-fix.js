(()=>{
  const go=url=>{if(!url)return;window.location.assign(url)};
  function bind(){
    document.querySelectorAll('.nav a').forEach(a=>{
      if(a.dataset.hardNav==='1')return;a.dataset.hardNav='1';
      a.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();go(a.getAttribute('href'))},{capture:true});
    });
    const back=document.querySelector('.toprow .iconbtn[aria-label="Back"]');
    if(back&&!back.dataset.hardBack){back.dataset.hardBack='1';back.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();try{const r=document.referrer&&new URL(document.referrer);if(r&&r.origin===location.origin&&history.length>1){history.back();return}}catch(_){}go('index.html')},{capture:true});}
  }
  const style=document.createElement('style');
  style.textContent='.nav{z-index:9999!important;pointer-events:auto!important}.nav a{pointer-events:auto!important;position:relative;z-index:10000}.top{z-index:9998!important}.toprow .iconbtn{pointer-events:auto!important;position:relative;z-index:10000}';
  document.head.appendChild(style);
  new MutationObserver(()=>requestAnimationFrame(bind)).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',bind);bind();
})();