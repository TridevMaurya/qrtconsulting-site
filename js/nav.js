// Shared UI: mobile nav, active link, scroll reveal, counters, FAQ
(function(){
  var btn = document.getElementById('menuBtn');
  var links = document.getElementById('navLinks');
  if (btn && links) btn.addEventListener('click', function(){ links.classList.toggle('open'); });
  if (links) links.addEventListener('click', function(e){
    if (e.target.tagName === 'A') links.classList.remove('open');
  });

  // active nav link
  var path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.links a').forEach(function(a){
    var href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });

  // reveal on scroll
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  // animated counters
  function animate(el){
    var target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec||'0');
    var suf = el.dataset.suffix||'', pre = el.dataset.prefix||'', t0 = null, dur = 1600;
    function tick(t){
      if(!t0) t0 = t;
      var p = Math.min((t-t0)/dur, 1), ease = 1-Math.pow(1-p,3);
      el.textContent = pre + (target*ease).toFixed(dec) + suf;
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var cio = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ animate(e.target); cio.unobserve(e.target); } });
  }, {threshold:.5});
  document.querySelectorAll('[data-count]').forEach(function(el){ cio.observe(el); });

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(function(q){
    q.addEventListener('click', function(){
      var item = q.parentElement, was = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function(i){ i.classList.remove('open'); });
      if(!was) item.classList.add('open');
    });
  });

  // contact form -> mailto fallback with success note
  var form = document.getElementById('contactForm');
  if (form) form.addEventListener('submit', function(e){
    e.preventDefault();
    var msg = document.getElementById('formMsg');
    if (msg) msg.style.display = 'block';
    form.reset();
  });
})();
