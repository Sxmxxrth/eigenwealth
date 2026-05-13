/* ── EigenWealth Canvas Trading Chart Animation ── */
(function(){
const canvas=document.getElementById('heroCanvas');
if(!canvas)return;
const ctx=canvas.getContext('2d');
let W,H,particles=[],candles=[],lines=[];
const COLORS={green:'#00C805',red:'#FF5252',cyan:'#06B6D4',blue:'#3B82F6'};

function resize(){W=canvas.width=canvas.offsetWidth;H=canvas.height=canvas.offsetHeight;init()}
window.addEventListener('resize',resize);

function init(){
  particles=[];candles=[];lines=[];
  // Generate candlesticks
  const cw=Math.max(8,W/80),gap=2,count=Math.ceil(W/(cw+gap))+5;
  let price=H*.5,trend=0;
  for(let i=0;i<count;i++){
    trend+=(Math.random()-.5)*.3;trend=Math.max(-2,Math.min(2,trend));
    const open=price;const close=open+(Math.random()-.5)*40+trend*5;
    const high=Math.max(open,close)+(Math.random()*20);
    const low=Math.min(open,close)-(Math.random()*20);
    price=close;
    candles.push({x:i*(cw+gap),open:open,close:close,high:high,low:low,w:cw});
  }
  // Moving average line
  const ma=[];let sum=0;
  for(let i=0;i<candles.length;i++){
    sum+=candles[i].close;
    if(i>=9){sum-=candles[i-10]?.close||0;ma.push({x:candles[i].x+cw/2,y:sum/Math.min(i+1,10)})}
    else ma.push({x:candles[i].x+cw/2,y:sum/(i+1)})
  }
  lines=[ma];
  // Particles
  for(let i=0;i<60;i++){
    particles.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+.5,
      vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3-.1,
      a:Math.random()*.4+.1,color:Math.random()>.5?COLORS.green:COLORS.cyan});
  }
}

let scrollOffset=0,time=0;
function draw(){
  ctx.clearRect(0,0,W,H);
  time+=.016;
  scrollOffset=(time*15)%((candles.length>0?(candles[candles.length-1].x):W));
  const ox=-scrollOffset;
  // Draw grid
  ctx.strokeStyle='rgba(255,255,255,.02)';ctx.lineWidth=1;
  for(let y=0;y<H;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
  for(let x=0;x<W;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
  // Draw candles
  const drawCandles=(shift)=>{
    candles.forEach(c=>{
      const x=c.x+ox+shift;if(x<-20||x>W+20)return;
      const bull=c.close>c.open;
      ctx.fillStyle=bull?'rgba(0,200,5,.25)':'rgba(255,82,82,.25)';
      ctx.strokeStyle=bull?'rgba(0,200,5,.35)':'rgba(255,82,82,.35)';
      ctx.lineWidth=1;
      // Wick
      const wickX=x+c.w/2;
      ctx.beginPath();ctx.moveTo(wickX,c.high);ctx.lineTo(wickX,c.low);ctx.stroke();
      // Body
      const top=Math.min(c.open,c.close),h=Math.abs(c.close-c.open)||1;
      ctx.fillRect(x,top,c.w,h);
      ctx.strokeRect(x,top,c.w,h);
    });
  };
  const totalW=candles.length>0?candles[candles.length-1].x+candles[0].w:W;
  drawCandles(0);drawCandles(totalW);
  // Draw MA line
  lines.forEach(pts=>{
    ctx.beginPath();ctx.strokeStyle='rgba(6,182,212,.3)';ctx.lineWidth=2;
    pts.forEach((p,i)=>{
      const x=p.x+ox;const x2=x+totalW;
      if(i===0){ctx.moveTo(x<-20?x2:x,p.y)}else{ctx.lineTo(x<-20?x2:x,p.y)}
    });
    ctx.stroke();
    // Glow
    ctx.strokeStyle='rgba(6,182,212,.08)';ctx.lineWidth=6;
    ctx.beginPath();
    pts.forEach((p,i)=>{const x=p.x+ox;if(i===0)ctx.moveTo(x,p.y);else ctx.lineTo(x,p.y)});
    ctx.stroke();
  });
  // Draw particles
  particles.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;
    const flicker=.5+.5*Math.sin(time*2+p.x);
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=p.color.replace(')',','+p.a*flicker+')').replace('rgb','rgba');
    ctx.fill();
  });
  // Scan line effect
  const scanY=(time*30)%H;
  const grad=ctx.createLinearGradient(0,scanY-2,0,scanY+2);
  grad.addColorStop(0,'transparent');grad.addColorStop(.5,'rgba(0,200,5,.04)');grad.addColorStop(1,'transparent');
  ctx.fillStyle=grad;ctx.fillRect(0,scanY-2,W,4);
  requestAnimationFrame(draw);
}
resize();draw();
})();

/* ── Scroll Animations ── */
const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting)x.target.classList.add('in')}),{threshold:.06,rootMargin:'0px 0px -30px 0px'});
document.querySelectorAll('.fade').forEach(el=>io.observe(el));

/* ── Animated Counters ── */
function animateCounter(el,target,suffix=''){
  let start=0;const dur=1500;const startTime=performance.now();
  function step(now){
    const p=Math.min((now-startTime)/dur,1);
    const ease=1-Math.pow(1-p,3);
    el.textContent=Math.floor(start+(target-start)*ease)+suffix;
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const counterEls=document.querySelectorAll('[data-counter]');
const cio=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting)return;
    const el=e.target;const t=parseInt(el.dataset.counter);const s=el.dataset.suffix||'';
    animateCounter(el,t,s);cio.unobserve(el);
  });
},{threshold:.3});
counterEls.forEach(el=>cio.observe(el));

/* ── Score Bar Animation ── */
const barEls=document.querySelectorAll('.mock-bar-fill');
const bio=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting)return;
    e.target.style.transition='width 1.2s cubic-bezier(.22,1,.36,1)';
    e.target.style.width=e.target.dataset.width||e.target.style.width;
    bio.unobserve(e.target);
  });
},{threshold:.3});
barEls.forEach(el=>{el.dataset.width=el.style.width;el.style.width='0%';bio.observe(el)});

/* ── Typewriter for EigenGPT ── */
const typeEl=document.getElementById('eigenGptText');
if(typeEl){
  const text=typeEl.dataset.text||typeEl.textContent;
  typeEl.textContent='';
  const tio=new IntersectionObserver(entries=>{
    if(!entries[0].isIntersecting)return;
    let i=0;
    function type(){if(i<text.length){typeEl.textContent+=text[i];i++;setTimeout(type,12)}else{typeEl.style.borderRight='none'}}
    typeEl.style.borderRight='2px solid var(--accent)';
    setTimeout(type,400);tio.disconnect();
  },{threshold:.3});
  tio.observe(typeEl);
}

/* ── 3D Card Tilt ── */
document.querySelectorAll('.agent-card').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`translateY(-4px) perspective(600px) rotateX(${y*-6}deg) rotateY(${x*6}deg)`;
  });
  card.addEventListener('mouseleave',()=>{card.style.transform='translateY(0) perspective(600px) rotateX(0) rotateY(0)'});
});

/* ── Smooth Scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'})}});
});

/* ── Live Waitlist Count ── */
async function fetchCount(){
  try{const r=await fetch('/api/waitlist/count');const d=await r.json();
    document.querySelectorAll('[data-live-count]').forEach(el=>{el.textContent=d.count+'+'});
  }catch(e){}
}
fetchCount();

/* ── Form Handlers ── */
function setupForm(formId,successId,btnId){
  const form=document.getElementById(formId);
  const success=document.getElementById(successId);
  const btn=document.getElementById(btnId);
  if(!form)return;
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const orig=btn.textContent;btn.textContent='Joining...';btn.disabled=true;
    const data=Object.fromEntries(new FormData(form));
    data.source=formId==='wlForm'?'hero':'cta';
    try{
      const r=await fetch('/api/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const d=await r.json();
      if(r.ok){form.style.display='none';success.style.display='block';fetchCount()}
      else{alert(d.error||'Something went wrong');btn.textContent=orig;btn.disabled=false}
    }catch{alert('Network error. Please try again.');btn.textContent=orig;btn.disabled=false}
  });
}
setupForm('wlForm','fsuccess','submitBtn');
setupForm('ctaForm','ctaSuccess','ctaBtn');
