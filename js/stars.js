// Lightweight 2D particle network for inner pages (about / contact)
(function(){
  const canvas = document.getElementById('stars-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W,H,pts=[];
  const N = 90, LINK = 130;
  function resize(){
    W = canvas.width = canvas.clientWidth;
    H = canvas.height = canvas.clientHeight;
  }
  function init(){
    pts = [];
    for(let i=0;i<N;i++) pts.push({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*.45, vy:(Math.random()-.5)*.45,
      r:Math.random()*1.8+.6,
      c:Math.random()<.5 ? '0,240,255' : (Math.random()<.5 ? '255,47,179' : '182,255,46')
    });
  }
  addEventListener('resize', ()=>{ resize(); init(); });
  resize(); init();
  (function tick(){
    ctx.clearRect(0,0,W,H);
    for(const p of pts){
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W) p.vx*=-1;
      if(p.y<0||p.y>H) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7);
      ctx.fillStyle=`rgba(${p.c},.8)`; ctx.fill();
    }
    for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
      const a=pts[i],b=pts[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);
      if(d<LINK){
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=`rgba(0,240,255,${(1-d/LINK)*.16})`; ctx.stroke();
      }
    }
    requestAnimationFrame(tick);
  })();
})();
