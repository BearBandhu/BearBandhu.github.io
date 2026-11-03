/* subpage companion — same physics, bubble and menu as the home deck */
(function(){
if(window.SLIME_PALETTES)window.SLIME_PALETTES.paint();
var SAY={
hero:'This one is playable. Scroll, or hit play below.',
play:'Go on — it runs right here in the page.',
loop:'The loop in five steps. Read it, then go play it again.',
design:'Design notes. This is the part I actually like.',
systems:'Every system in the build, listed. No mystery boxes.',
contact:'Seen enough? He answers email.'
};
var SPOTS={hero:[.9,.66],work:[.94,.68],about:[.92,.34],companion:[.2,.3],play:[.95,.52],trailer:[.95,.5],gallery:[.94,.58],loop:[.94,.28],role:[.93,.34],problems:[.94,.3],design:[.93,.3],systems:[.94,.62],pipeline:[.93,.36],contact:[.16,.68]};
var frag=document.createElement('div');
frag.innerHTML='<div class="bubble" id="bubble" role="status" aria-live="polite"></div><div class="menu" id="menu"></div>'+
'<div class="slime" id="slime" role="button" tabindex="0" aria-label="Companion menu"><div class="slime__body"><span class="slime__gloss"></span><span class="slime__face"><i class="slime__ear slime__ear--l"></i><i class="slime__ear slime__ear--r"></i><i class="slime__eye slime__eye--c"></i><i class="slime__eye slime__eye--y"></i></span></div></div>';
while(frag.firstChild)document.body.appendChild(frag.firstChild);
var slime=document.getElementById('slime'),bubble=document.getElementById('bubble'),menu=document.getElementById('menu'),
secs=[].slice.call(document.querySelectorAll('[data-section]')),live=0,said='';

/* menu: page sections + home */
secs.forEach(function(s,i){
var b=document.createElement('button');b.type='button';
var h=s.querySelector('h1,h2'),num=s.querySelector('.sec__num'),
lab=s.dataset.menuLabel||(h?h.innerHTML.replace(/<br\s*\/?>/gi,' ').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim():s.dataset.section),
n=s.dataset.menuNum||(num?num.textContent.trim():'00');
if(n.length>3)n='00';
b.innerHTML='<i>'+n+'</i>'+lab;
b.onclick=function(){closeMenu();window.scrollTo({top:s.getBoundingClientRect().top+pageYOffset-70,behavior:'smooth'})};
menu.appendChild(b)});
if(!/(^|\/)(index\.html)?$/.test(location.pathname)){var home=document.createElement('button');home.type='button';home.innerHTML='<i>←</i>Back to the index';
home.onclick=function(){location.href='index.html'};menu.appendChild(home)}
var ES=document.documentElement.lang==='es',MSG=ES?'Haz clic o toca para enviarle un mensaje a Alejandro':'Click or Tap me to send Alejandro a message';
var dst=document.createElement('style');dst.textContent='.sdraw{position:fixed;z-index:61;width:min(320px,calc(100vw - 28px));padding:16px 16px 14px;border-radius:20px;background:#fff;border:1px solid rgba(22,20,27,.12);box-shadow:0 30px 70px -30px rgba(22,20,27,.55);opacity:0;pointer-events:none;transform:translateY(8px) scale(.97);transition:opacity .22s,transform .22s;font-family:var(--f-b,"Schibsted Grotesk",sans-serif)}.sdraw.is-on{opacity:1;pointer-events:auto;transform:none}.sdraw__h{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:2px}.sdraw__k{font-family:var(--f-m,"JetBrains Mono",monospace);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3,#6b6773)}.sdraw__x{font:inherit;font-size:14px;line-height:1;width:28px;height:28px;border-radius:50%;border:0;background:rgba(22,20,27,.06);cursor:pointer;color:var(--ink,#16141b)}.sdraw__x:hover{background:rgba(22,20,27,.12)}.sdraw .msg{display:flex;flex-direction:column;gap:8px;margin-top:10px}.sdraw .msg input,.sdraw .msg textarea{width:100%;box-sizing:border-box;font:inherit;font-size:13px;color:var(--ink,#16141b);background:rgba(22,20,27,.03);border:1px solid rgba(22,20,27,.14);border-radius:10px;padding:9px 11px;outline:none}.sdraw .msg textarea{min-height:86px;resize:vertical;line-height:1.45}.sdraw .msg input:focus,.sdraw .msg textarea:focus{border-color:#e97a4e;background:#fff}.sdraw .msg__send{font:inherit;font-size:13px;font-weight:600;cursor:pointer;border:0;border-radius:10px;padding:10px 14px;color:#fff;background:linear-gradient(120deg,#e97a4e,#8a5cf0)}.sdraw .msg__send:hover{filter:brightness(1.07)}.sdraw__idx{display:flex;justify-content:space-between;align-items:center;width:100%;margin-top:12px;padding:10px 12px;font:inherit;font-size:13px;font-weight:600;color:var(--ink,#16141b);background:rgba(22,20,27,.04);border:1px solid rgba(22,20,27,.12);border-radius:10px;cursor:pointer}.sdraw__idx:hover{border-color:#8a5cf0;background:rgba(138,92,240,.06)}.sdraw__idx b{font-weight:400;color:var(--ink-3,#6b6773)}.sdraw .msg__note{margin:0;font-size:11px;line-height:1.4;color:var(--ink-3,#6b6773)}';document.head.appendChild(dst);
var draw=document.createElement('div');draw.className='sdraw';draw.id='slimeDraw';draw.setAttribute('role','dialog');draw.setAttribute('aria-label',ES?'Envíame un mensaje':'Send me a message');
draw.innerHTML='<div class="sdraw__h"><span class="sdraw__k">'+(ES?'Envíame un mensaje':'Send me a message')+'</span><button class="sdraw__x" type="button" aria-label="Close">✕</button></div><form class="msg"><input name="name" type="text" placeholder="'+(ES?'Tu nombre':'Your name')+'" autocomplete="name" required><input name="email" type="email" placeholder="'+(ES?'Tu correo':'Your email')+'" autocomplete="email" required><textarea name="message" placeholder="'+(ES?'¿En qué estás trabajando?':'What are you working on?')+'" required></textarea><button class="msg__send" type="submit">'+(ES?'Enviar mensaje':'Send message')+'</button><p class="msg__note">'+(ES?'Llega directamente a Alejandro.':'Goes straight to Alejandro’s inbox.')+'</p></form><button class="sdraw__idx" type="button"><span>'+(ES?'Ver el índice':'Show the page index')+'</span><b>☰</b></button>';
document.body.appendChild(draw);
var drawOpen=false;
function openDraw(){closeMenu();drawOpen=true;draw.classList.add('is-on');bubble.classList.remove('is-on');bubbleT=0;setTimeout(function(){var i=draw.querySelector('input');if(i)i.focus({preventScroll:true})},220)}
function closeDraw(){drawOpen=false;draw.classList.remove('is-on')}
window.slimeMessage=openDraw;
draw.addEventListener('click',function(e){e.stopPropagation()});
draw.querySelector('.sdraw__x').onclick=closeDraw;
draw.querySelector('.sdraw__idx').onclick=function(e){e.stopPropagation();closeDraw();openMenu()};
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&drawOpen)closeDraw()});
if(!window.__msgSubmit){window.__msgSubmit=1;document.addEventListener('submit',function(e){var f=e.target.closest('form.msg');if(!f)return;e.preventDefault();if(f.dataset.busy)return;var n=f.elements.name.value.trim(),m=f.elements.email.value.trim(),b=f.elements.message.value.trim(),btn=f.querySelector('.msg__send'),note=f.querySelector('.msg__note'),lbl=btn.textContent;f.dataset.busy=1;btn.disabled=true;btn.textContent=ES?'Enviando…':'Sending…';fetch('https://formsubmit.co/ajax/alejandro.melian.r@gmail.com',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({_subject:'Portfolio message from '+n,_template:'table',_captcha:'false',_replyto:m,Name:n,Email:m,Message:b,Page:location.href})}).then(function(r){return r.json().then(function(d){if(!r.ok||d.success==='false'||d.success===false)throw 0})}).then(function(){f.reset();btn.textContent=ES?'Mensaje enviado ✓':'Message sent ✓';note.textContent=ES?'Gracias. Alejandro te responderá a tu correo.':'Thanks. Alejandro will reply to your email.';setTimeout(function(){btn.textContent=lbl;btn.disabled=false;delete f.dataset.busy},4000)}).catch(function(){btn.textContent=lbl;btn.disabled=false;delete f.dataset.busy;note.textContent=ES?'No se pudo enviar. Escribe a alejandro.melian.r@gmail.com':'Couldn’t send. Email alejandro.melian.r@gmail.com directly.'})})}
var mBtn=document.createElement('button');mBtn.type='button';mBtn.innerHTML='<i>✉</i>'+(ES?'Envíame un mensaje':'Send me a message');mBtn.onclick=function(e){e.stopPropagation();openDraw()};menu.appendChild(mBtn);
var mbs=[].slice.call(menu.children).filter(function(b){return b!==mBtn});
var quiet=false;try{quiet=localStorage.getItem('slimeQuiet')==='1'}catch(e){}
var qBtn=document.createElement('button');qBtn.type='button';qBtn.className='menu__toggle';
var QT={en:['Okay, you can talk','Please stop talking'],es:['Vale, puedes hablar','Deja de hablar, por favor']},QL=QT[document.documentElement.lang]||QT.en;
function paintQuiet(){qBtn.innerHTML='<i>'+(quiet?'○':'●')+'</i>'+(quiet?QL[0]:QL[1]);qBtn.setAttribute('aria-pressed',quiet?'true':'false')}
paintQuiet();
qBtn.onclick=function(e){e.stopPropagation();quiet=!quiet;try{localStorage.setItem('slimeQuiet',quiet?'1':'0')}catch(err){}paintQuiet();if(quiet)bubble.classList.remove('is-on')};
menu.appendChild(qBtn);

/* ---------- physics (ported from the home deck) ---------- */
var bubbleDY=0,fitT=0,smooth=0,antUntil=0,antDur=340,antX=0,antY=0,lastSpot=-1,fast=0,landAt=-9e3,landV=0;
var sx=innerWidth*.9,sy=innerHeight*.3,tx=sx,ty=sy,vx=0,vy=0,t0=0,bubbleT=0,menuOpen=false;
var tyBase=innerHeight*.3;
function slimeMob(){return innerWidth<=700}
function targets(){if(slimeMob()){tx=innerWidth*.5;tyBase=innerHeight-88;ty=tyBase+follow();return}var s=SPOTS[secs[live]?secs[live].dataset.section:'hero']||SPOTS.hero;tx=innerWidth*s[0];tyBase=innerHeight*s[1];ty=tyBase+follow()}
var forceT=null;
window.slimeForce=function(x,y){forceT=(x==null)?null:[x,y]};
window.slimePlace=function(x,y){sx=x;sy=y;vx=vy=0;lastSpot=-1};
function follow(){if(slimeMob())return 0;if(!bubble.classList.contains('is-on'))return 0;return Math.max(70-tyBase,Math.min(innerHeight-70-tyBase,bubbleDY))}
function tick(ts){
var dt=Math.min(34,ts-t0)/16.7;t0=ts;
targets();
if(live!==lastSpot){
var dx=tx-sx,dy=ty-sy,d=Math.hypot(dx,dy);
if(d>40){antUntil=ts+antDur;antX=dx/d;antY=dy/d}
lastSpot=live}
ty=tyBase+follow();
if(forceT){tx=forceT[0];ty=forceT[1]}
var ant=antUntil>ts?(antUntil-ts)/antDur:0;
if(ant>0){vx*=0.72;vy*=0.72;sx-=antX*0.9*ant*dt;sy-=antY*0.55*ant*dt}
else{vx+=(tx-sx)*0.0294;vy+=(ty-sy)*0.0294;vx*=0.905;vy*=0.905;
var vmax=20,vm=Math.hypot(vx,vy);if(vm>vmax){vx*=vmax/vm;vy*=vmax/vm}}
var wasFast=fast;fast=Math.hypot(vx,vy);
if(ant===0&&wasFast>7&&fast<=7&&ts-landAt>500){landAt=ts;landV=Math.min(1,wasFast/16)}
var land=Math.max(0,1-(ts-landAt)/620),
wob=land>0?Math.sin((ts-landAt)/62)*land*land*landV:0;
sx+=vx*dt;sy+=vy*dt;
var sp=Math.min(1,Math.hypot(vx,vy)/34);
smooth+=(sp-smooth)*0.09;
var crouch=Math.sin(Math.min(1,1-ant)*Math.PI)*(antUntil>ts?1:0),
bob=Math.sin(ts/620)*4.2*(1-smooth*.5),
sqx=1+smooth*0.13-Math.sin(ts/620)*0.03+crouch*0.16+wob*0.2,
sqy=1-smooth*0.1+Math.sin(ts/620)*0.03-crouch*0.15-wob*0.19,
rot=Math.max(-11,Math.min(11,vx*0.45))-antX*crouch*7+wob*5;
slime.style.transform='translate3d('+(sx-30.5)+'px,'+(sy-30.5+bob)+'px,0)';
slime.firstElementChild.style.transform='rotate('+rot.toFixed(2)+'deg) scale('+sqx.toFixed(3)+','+sqy.toFixed(3)+')';
slime.querySelector('.slime__face').style.transform='translate(-50%,-50%) translate('+(vx*0.3).toFixed(2)+'px,'+(vy*0.3+bob*0.22).toFixed(2)+'px)';
var right=sx<innerWidth*0.5;
if(slimeMob()){var bw=bubble.offsetWidth;
bubble.style.left=Math.max(12,Math.min(innerWidth-12-bw,sx-bw/2))+'px';
bubble.style.top=(sy-52-bubble.offsetHeight+bob)+'px';
bubble.style.borderRadius='18px';
menu.style.left=Math.max(14,Math.min(innerWidth-238,sx-112))+'px';
menu.style.top=(sy-54-menu.offsetHeight)+'px';
if(drawOpen){var dw=draw.offsetWidth;draw.style.left=Math.max(14,Math.min(innerWidth-14-dw,sx-dw/2))+'px';draw.style.top=Math.max(12,sy-54-draw.offsetHeight)+'px'}
if(bubbleT&&ts>bubbleT&&!menuOpen){if(slimeClicked){bubble.classList.remove('is-on')}else{sayHint()}}
return requestAnimationFrame(tick)}
bubble.style.left=(right?sx+52:sx-52-bubble.offsetWidth)+'px';
bubble.style.top=(sy-24-bubble.offsetHeight/2+bob)+'px';
bubble.style.borderRadius=right?'18px 18px 18px 6px':'18px 18px 6px 18px';
menu.style.left=Math.max(14,Math.min(innerWidth-238,sx-(right?0:214)))+'px';
menu.style.top=(sy>innerHeight*0.5?sy-54-menu.offsetHeight:sy+54)+'px';
if(drawOpen){var dw2=draw.offsetWidth,dh=draw.offsetHeight;draw.style.left=Math.max(14,Math.min(innerWidth-14-dw2,sx-(right?0:dw2-28)))+'px';draw.style.top=Math.max(12,Math.min(innerHeight-12-dh,sy>innerHeight*0.5?sy-54-dh:sy+54))+'px'}
if(bubbleT&&ts>bubbleT&&!menuOpen){if(slimeClicked){bubble.classList.remove('is-on')}else{sayHint()}}
requestAnimationFrame(tick)}
requestAnimationFrame(function(ts){t0=ts;tick(ts)});

/* keep the bubble off the text it would cover */
function hits(r){var host=secs[live]||document.body,
els=host.querySelectorAll('h1,h2,h3,p,a,li,dt,dd,.btn,iframe,.playable'),i,b,o=0;
for(i=0;i<els.length;i++){
b=els[i].getBoundingClientRect();if(!b.width||!b.height)continue;
if(b.bottom<0||b.top>innerHeight)continue;
var ox=Math.min(r.right,b.right)-Math.max(r.left,b.left),oy=Math.min(r.bottom,b.bottom)-Math.max(r.top,b.top);
if(ox>0&&oy>0)o=Math.max(o,Math.min(ox,oy))}
return o}
function fit(){bubbleDY=0;ty=tyBase;
var bw=bubble.offsetWidth,bh=bubble.offsetHeight,
right=tx<innerWidth*0.5,left=right?tx+52:tx-52-bw,top0=tyBase-24-bh/2,
cands=[0,-40,40,-80,80,-150,150,-220,220],i,best=0,bestO=Infinity,seen={};
for(i=0;i<cands.length;i++){
var top=Math.max(10,Math.min(innerHeight-10-bh,top0+cands[i]));
if(seen[top])continue;seen[top]=1;
var o=hits({left:left,right:left+bw,top:top,bottom:top+bh});
if(o<bestO-4){bestO=o;best=top-top0;if(o===0)break}}
bubbleDY=best}
var saidOnce={};
function say(txt,ms){if(!txt||menuOpen||drawOpen)return;if(saidOnce[txt]&&txt!==MSG)return;saidOnce[txt]=1;bubble.textContent=txt;bubble.classList.add('is-on');bubbleT=performance.now()+(ms||5200);bubbleDY=0;clearTimeout(fitT);fitT=setTimeout(fit,600)}
window.slimeSay=say;
function openMenu(){menuOpen=true;menu.classList.add('is-on');bubble.classList.remove('is-on')}
function closeMenu(){menuOpen=false;menu.classList.remove('is-on')}
window.slimeMenu=function(o){o?openMenu():closeMenu()};
window.slimeMenuOpen=function(){return menuOpen};

var slimeClicked=false;try{slimeClicked=localStorage.getItem('slimeClicked')==='1'}catch(e){}
function sayHint(){if(slimeClicked||menuOpen)return;bubble.textContent='Click me';bubble.classList.add('is-on');bubbleT=0;bubbleDY=0;clearTimeout(fitT);fitT=setTimeout(fit,400)}
function gotClick(){if(slimeClicked)return;slimeClicked=true;try{localStorage.setItem('slimeClicked','1')}catch(e){}}
function poke(){gotClick();slime.classList.remove('is-poked');void slime.offsetWidth;slime.classList.add('is-poked');setTimeout(function(){slime.classList.remove('is-poked')},600)}
function slimeAct(){poke();if(drawOpen){closeDraw();return}if(bubble.classList.contains('is-on')&&bubble.textContent===MSG){openDraw();return}menuOpen?closeMenu():openMenu()}
slime.addEventListener('click',function(e){e.stopPropagation();slimeAct()});
slime.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();slimeAct()}});
document.addEventListener('click',function(){if(menuOpen)closeMenu();if(drawOpen)closeDraw()});
menu.addEventListener('click',function(e){e.stopPropagation()});

/* section tracking */
function onScroll(){
var mid=innerHeight*0.42,here=-1;
secs.forEach(function(s,i){var r=s.getBoundingClientRect();if(r.top<=mid&&r.bottom>mid)here=i});
if(here<0||here===live)return;
live=here;
mbs.forEach(function(b,k){b.classList.toggle('is-here',k===live)});
var s=secs[live],k=s.dataset.section;
if(k!==said){said=k;if(!quiet)say((k==='work'||k==='cases')?MSG:(s.dataset.say||SAY[k]),(k==='work'||k==='cases')?7000:0)}
}
addEventListener('scroll',onScroll,{passive:true});
var atEnd=false;addEventListener('scroll',function(){var end=innerHeight+pageYOffset>=document.documentElement.scrollHeight-40;if(end&&!atEnd&&!quiet)say(MSG,8000);atEnd=end},{passive:true});
setTimeout(function(){mbs[0].classList.add('is-here');if(!quiet)say(secs[0]&&secs[0].dataset.say||SAY.hero);onScroll()},800);
})();