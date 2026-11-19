(function(){
  var d=document, html=d.documentElement;

  /* header: solid once scrolled */
  var hdr=d.getElementById('hdr');
  function onScroll(){ if(hdr) hdr.classList.toggle('solid', scrollY>40); }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  /* mobile drawer */
  var burger=d.getElementById('burger'), drawer=d.getElementById('drawer');
  function setDrawer(open){
    if(!drawer) return;
    drawer.classList.toggle('open',open);
    burger.setAttribute('aria-expanded',open?'true':'false');
    burger.setAttribute('aria-label',open?'Close menu':'Open menu');
    drawer.setAttribute('aria-hidden',open?'false':'true');
    d.body.style.overflow=open?'hidden':'';
    if(open && hdr) hdr.classList.add('solid'); else onScroll();
  }
  if(burger){
    burger.addEventListener('click',function(){ setDrawer(!drawer.classList.contains('open')); });
    drawer.addEventListener('click',function(e){ if(e.target.closest('a')) setDrawer(false); });
    addEventListener('keydown',function(e){ if(e.key==='Escape') setDrawer(false); });
    addEventListener('resize',function(){ if(innerWidth>1180) setDrawer(false); });
  }

  /* reveal on scroll */
  var rev=[].slice.call(d.querySelectorAll('[data-r],.steps'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
    },{rootMargin:'0px 0px -8% 0px',threshold:.12});
    rev.forEach(function(el){ io.observe(el); });
  } else rev.forEach(function(el){ el.classList.add('in'); });

  /* counters */
  var cs=d.querySelectorAll('[data-count]');
  if(cs.length && 'IntersectionObserver' in window){
    var co=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting) return; co.unobserve(e.target);
        var el=e.target, to=parseFloat(el.dataset.count), dec=(el.dataset.count.split('.')[1]||'').length, t0=null;
        function step(t){ if(!t0) t0=t; var p=Math.min((t-t0)/1400,1), v=to*(1-Math.pow(1-p,3)); el.textContent=v.toFixed(dec); if(p<1) requestAnimationFrame(step); }
        requestAnimationFrame(step);
      });
    },{threshold:.5});
    cs.forEach(function(c){ co.observe(c); });
  }

  /* hero slideshow */
  var slides=d.querySelectorAll('.hero .slide'), dots=d.querySelectorAll('.hero-dots button'), si=0, timer;
  function show(n){
    slides[si].classList.remove('on'); if(dots[si]) dots[si].classList.remove('on');
    si=(n+slides.length)%slides.length;
    slides[si].classList.add('on'); if(dots[si]) dots[si].classList.add('on');
  }
  function auto(){ clearInterval(timer); timer=setInterval(function(){ show(si+1); },5500); }
  if(slides.length>1){
    dots.forEach(function(b,i){ b.addEventListener('click',function(){ show(i); auto(); }); });
    auto();
  }

  /* reviews: duplicate cards for a seamless loop */
  var track=d.querySelector('.rev-track');
  if(track && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    [].slice.call(track.children).forEach(function(c){ var k=c.cloneNode(true); k.setAttribute('aria-hidden','true'); track.appendChild(k); });
  }

  /* opening hours: live badge + highlight today (UK time) */
  var HRS={1:[10,19],2:[10,19],3:[10,19],4:[10,19],5:[10,19],6:[9,16],0:null};
  try{
    var parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date());
    var get=function(t){ return (parts.filter(function(p){return p.type===t;})[0]||{}).value; };
    var day={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[get('weekday')], h=parseInt(get('hour'),10)%24+parseInt(get('minute'),10)/60;
    var r=HRS[day], open=!!(r && h>=r[0] && h<r[1]);
    d.querySelectorAll('.hrs-badge').forEach(function(b){ b.textContent=open?'Open now':'Closed now'; b.hidden=false; b.classList.add(open?'yes':'no'); });
    d.querySelectorAll('[data-day="'+day+'"]').forEach(function(tr){ tr.classList.add('today'); });
  }catch(e){}

  /* gallery lightbox */
  var items=[].slice.call(d.querySelectorAll('.gitem')), lb=d.getElementById('lb');
  if(items.length && lb){
    var li=0, lbImg=lb.querySelector('img'), lbCap=lb.querySelector('p'), last;
    function lbShow(i){ li=(i+items.length)%items.length; var it=items[li]; lbImg.src=it.dataset.full; lbImg.alt=it.dataset.alt; lbCap.textContent=it.dataset.alt; }
    function lbOpen(i){ last=d.activeElement; lbShow(i); lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); d.body.style.overflow='hidden'; lb.querySelector('.x').focus(); }
    function lbClose(){ lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); d.body.style.overflow=''; if(last) last.focus(); }
    items.forEach(function(it,i){ it.addEventListener('click',function(){ lbOpen(i); }); });
    lb.querySelector('.x').addEventListener('click',lbClose);
    lb.querySelector('.pv').addEventListener('click',function(){ lbShow(li-1); });
    lb.querySelector('.nx').addEventListener('click',function(){ lbShow(li+1); });
    lb.addEventListener('click',function(e){ if(e.target===lb) lbClose(); });
    addEventListener('keydown',function(e){ if(!lb.classList.contains('open')) return; if(e.key==='Escape') lbClose(); if(e.key==='ArrowLeft') lbShow(li-1); if(e.key==='ArrowRight') lbShow(li+1); });
  }

  /* quote form → WhatsApp */
  var form=d.getElementById('quote-form');
  if(form){
    var params=new URLSearchParams(location.search), pre=params.get('service');
    if(pre){ var sel=form.querySelector('#f-service'); [].slice.call(sel.options).forEach(function(o){ if(o.value===pre) sel.value=pre; }); }
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var ok=true, first=null;
      form.querySelectorAll('[required]').forEach(function(el){
        var f=el.closest('.f'), v=el.value.trim(), bad=!v;
        if(el.type==='tel' && v && v.replace(/[^0-9]/g,'').length<10) bad=true;
        f.classList.toggle('bad',bad); if(bad){ ok=false; if(!first) first=el; }
      });
      if(!ok){ first.focus(); return; }
      var val=function(id){ var el=d.getElementById(id); return el?el.value.trim():''; };
      var lines=['Hi Sultan Autos, I would like a quote.','','Name: '+val('f-name'),'Phone: '+val('f-phone'),'Vehicle: '+val('f-vehicle'),'Service: '+val('f-service')];
      if(val('f-reg')) lines.push('Reg: '+val('f-reg'));
      if(val('f-msg')) lines.push('','Details: '+val('f-msg'));
      lines.push('','I can send photos of the damage on here.');
      var url='https://wa.me/447599999112?text='+encodeURIComponent(lines.join('\n'));
      form.querySelector('.form-ok').classList.add('show');
      form.dataset.wa=url;
      window.open(url,'_blank','noopener');
    });
    form.querySelectorAll('input,select,textarea').forEach(function(el){
      el.addEventListener('input',function(){ var f=el.closest('.f'); if(f) f.classList.remove('bad'); });
    });
  }

  /* year */
  d.querySelectorAll('.yr').forEach(function(y){ y.textContent=new Date().getFullYear(); });
})();
