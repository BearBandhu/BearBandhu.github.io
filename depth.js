(function(){
var deck=document.getElementById('deck'),space=document.getElementById('scroller'),
screens=[].slice.call(deck.querySelectorAll('.screen')),N=screens.length,
prog=document.getElementById('prog'),hint=document.getElementById('hint'),
slime=document.getElementById('slime'),bubble=document.getElementById('bubble'),menu=document.getElementById('menu'),
lb=document.getElementById('lb'),lbf=document.getElementById('lbf'),lbx=document.getElementById('lbx');
var H=window.innerHeight,cur=0,live=-1,reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
var quick=matchMedia('(pointer:coarse)').matches||innerWidth<820;
var LERP=quick?0.22:0.13,SNAP=quick?0.17:0.09,SWIPE=quick?0.3:0.42;



/* progress dots */
screens.forEach(function(s,i){var b=document.createElement('b');prog.appendChild(b)});
var pbs=[].slice.call(prog.children);

/* slime menu */
screens.forEach(function(s,i){
var b=document.createElement('button');b.type='button';
b.innerHTML='<span>0'+(i+1)+'</span>'+s.dataset.name;
b.onclick=function(){closeMenu();goTo(i)};menu.appendChild(b)});
var mbs=[].slice.call(menu.children);
var quiet=false;try{quiet=localStorage.getItem('slimeQuiet')==='1'}catch(e){}
var qBtn=document.createElement('button');qBtn.type='button';qBtn.className='menu__toggle';
function paintQuiet(){qBtn.innerHTML='<span>'+(quiet?'○':'●')+'</span>'+(quiet?'Okay, you can talk':'Please stop talking');qBtn.setAttribute('aria-pressed',quiet?'true':'false')}
paintQuiet();
qBtn.onclick=function(e){e.stopPropagation();quiet=!quiet;try{localStorage.setItem('slimeQuiet',quiet?'1':'0')}catch(err){}paintQuiet();if(quiet)bubble.classList.remove('is-on')};
menu.appendChild(qBtn);

function goTo(i){target=Math.max(0,Math.min(N-1,i));if(reduce)cur=target}
window.slimeGoTo=goTo;
document.addEventListener('click',function(e){
var a=e.target.closest('a[href^="#"]');if(!a)return;
var id=a.getAttribute('href').slice(1);if(!id)return;
for(var i=0;i<N;i++){var s=screens[i],k=(s.dataset.screenLabel||s.dataset.name||'').toLowerCase();
if(k===id.toLowerCase()||k.indexOf(id.toLowerCase())===0){e.preventDefault();goTo(i);return}}
});

/* ---------- depth deck ---------- */
function paint(){
var i,d,ad,sc,op,bl,ty;
for(i=0;i<N;i++){
d=i-cur;ad=Math.abs(d);
if(ad>1.25){screens[i].style.opacity=0;screens[i].style.visibility='hidden';screens[i].classList.remove('is-live');if(screens[i].scrollTop)screens[i].scrollTop=0;continue}
screens[i].style.visibility='visible';
if(d>=0){sc=1-d*0.13;ty=d*70;bl=d*7}
else{sc=1+ad*0.28;ty=-ad*46;bl=ad*10}
op=Math.max(0,1-Math.pow(ad,1.15)*1.05);
screens[i].style.opacity=op;
screens[i].style.filter=bl>0.3?'blur('+bl.toFixed(2)+'px)':'none';
screens[i].style.transform='translate3d(0,'+ty.toFixed(2)+'px,0) scale('+sc.toFixed(4)+')';
}
var act=Math.round(cur);
if(act!==live){
if(live>-1)screens[live].classList.remove('is-live');
live=act;screens[live].classList.add('is-live');
pbs.forEach(function(b,k){b.classList.toggle('is-on',k===live)});
mbs.forEach(function(b,k){b.classList.toggle('is-here',k===live)});
if(!quiet)say(screens[live].dataset.say);
}
hint.style.opacity=cur>0.25?0:1;
/* ambient blobs drift with depth */
var f=cur/Math.max(1,N-1);
blobs.forEach(function(b,k){var s=1+k*0.35;b.style.transform='translate3d('+(Math.sin(f*3.1+k)*90*s).toFixed(1)+'px,'+(-f*220*s).toFixed(1)+'px,0) scale('+(1+f*0.18*s).toFixed(3)+')'})
}
var blobs=[].slice.call(document.querySelectorAll('.blob'));

/* ---------- slime ---------- */
var spots=[[.9,.26],[.93,.87],[.93,.87],[.93,.86],[.92,.13],[.22,.9],[.88,.26]];
var bubbleDY=0,fitT=0,smooth=0,antUntil=0,antDur=340,antX=0,antY=0,lastSpot=-1,fast=0,landAt=-9e3,landV=0;
var sx=innerWidth*.9,sy=innerHeight*.26,tx=sx,ty=sy,vx=0,vy=0,t0=0,bubbleT=0,menuOpen=false;
var tyBase=innerHeight*.26;
function targets(){var s=spots[live<0?0:live%spots.length];tx=innerWidth*s[0];tyBase=innerHeight*s[1];ty=tyBase+follow()}
var forceT=null;
window.slimeForce=function(x,y){forceT=(x==null)?null:[x,y]};
window.slimePlace=function(x,y){sx=x;sy=y;vx=vy=0;lastSpot=-1};
function follow(){if(!bubble.classList.contains('is-on'))return 0;return Math.max(70-tyBase,Math.min(innerHeight-70-tyBase,bubbleDY))}
function tick(ts){
var dt=Math.min(34,ts-t0)/16.7;t0=ts;
targets();
if(live!==lastSpot){
var dx=tx-sx,dy=ty-sy,d=Math.hypot(dx,dy);
if(d>40){antUntil=ts+antDur;antX=dx/d;antY=dy/d}
lastSpot=live}
ty=tyBase+follow();
if(forceT){tx=forceT[0];ty=forceT[1]}
var ant=antUntil>ts?(antUntil-ts)/antDur:0; /* 1 -> 0 while crouching */
if(ant>0){
/* hold, sink and lean back before the leap */
vx*=0.72;vy*=0.72;
sx-=antX*0.9*ant*dt;sy-=antY*0.55*ant*dt;
}else{
vx+=(tx-sx)*0.0294;vy+=(ty-sy)*0.0294;vx*=0.905;vy*=0.905;
var vmax=20,vm=Math.hypot(vx,vy);if(vm>vmax){vx*=vmax/vm;vy*=vmax/vm}
}
/* landing: the leap ends, momentum keeps deforming the body */
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
slime.style.transform='translate3d('+(sx-42)+'px,'+(sy-42+bob)+'px,0)';
slime.firstElementChild.style.transform='rotate('+rot.toFixed(2)+'deg) scale('+sqx.toFixed(3)+','+sqy.toFixed(3)+')';
slime.querySelector('.slime__face').style.transform='translate(-50%,-50%) translate('+(vx*0.3).toFixed(2)+'px,'+(vy*0.3+bob*0.22).toFixed(2)+'px)';
var right=sx<innerWidth*0.5;
bubble.style.left=(right?sx+56:sx-56-bubble.offsetWidth)+'px';
bubble.style.top=(sy-24-bubble.offsetHeight/2+bob)+'px';
bubble.style.borderRadius=right?'18px 18px 18px 6px':'18px 18px 6px 18px';
menu.style.left=Math.max(14,Math.min(innerWidth-238,sx-(right?0:214)))+'px';
menu.style.top=(sy>innerHeight*0.5?sy-58-menu.offsetHeight:sy+58)+'px';
if(bubbleT&&ts>bubbleT&&!menuOpen){if(slimeClicked){bubble.classList.remove('is-on')}else{sayHint()}}
requestAnimationFrame(tick)}
requestAnimationFrame(function(ts){t0=ts;tick(ts)});

function hits(r){var els=screens[live].querySelectorAll('h1,h2,h3,p,a,dt,dd,.chip,.gcard.is-on,.opt,.set__t,.lab__reset,.lab__stage'),i,b,o=0;
for(i=0;i<els.length;i++){
if(els[i].querySelector('h1,h2,h3,p,a,span,dd'))continue; /* structural rows: judge their leaves instead */
b=els[i].getBoundingClientRect();if(!b.width||!b.height)continue;
var ox=Math.min(r.right,b.right)-Math.max(r.left,b.left),oy=Math.min(r.bottom,b.bottom)-Math.max(r.top,b.top);
if(ox>0&&oy>0)o=Math.max(o,Math.min(ox,oy))}
return o}
function fit(){if(live<0)return;bubbleDY=0;ty=tyBase;
var bw=bubble.offsetWidth,bh=bubble.offsetHeight,
right=tx<innerWidth*0.5,
left=right?tx+56:tx-56-bw,
top0=tyBase-24-bh/2,
cands=[0,-40,40,-80,80,-150,150,-220,220],i,best=0,bestO=Infinity,seen={};
for(i=0;i<cands.length;i++){
var top=Math.max(10,Math.min(innerHeight-10-bh,top0+cands[i]));
if(seen[top])continue;seen[top]=1;
var o=hits({left:left,right:left+bw,top:top,bottom:top+bh});
if(o<bestO-4){bestO=o;best=top-top0;if(o===0)break}}
bubbleDY=best}
function say(txt){if(!txt)return;bubble.textContent=txt;bubble.classList.add('is-on');bubbleT=performance.now()+5200;bubbleDY=0;clearTimeout(fitT);fitT=setTimeout(fit,780)}
window.slimeHint=sayHint;
window.slimeSay=function(txt,ms){if(!txt)return;closeMenu();bubble.textContent=txt;bubble.classList.add('is-on');bubbleT=performance.now()+(ms||6400);bubbleDY=0;clearTimeout(fitT);fitT=setTimeout(fit,120)};
function openMenu(){menuOpen=true;menu.classList.add('is-on');bubble.classList.remove('is-on')}
function closeMenu(){menuOpen=false;menu.classList.remove('is-on')}

var slimeClicked=false;try{slimeClicked=localStorage.getItem('slimeClicked')==='1'}catch(e){}
function sayHint(){if(slimeClicked||menuOpen)return;bubble.textContent='Click me';bubble.classList.add('is-on');bubbleT=0;bubbleDY=0;clearTimeout(fitT);fitT=setTimeout(fit,400)}
function gotClick(){if(slimeClicked)return;slimeClicked=true;try{localStorage.setItem('slimeClicked','1')}catch(e){}}
function poke(){gotClick();slime.classList.remove('is-poked');void slime.offsetWidth;slime.classList.add('is-poked');setTimeout(function(){slime.classList.remove('is-poked')},600)}
slime.addEventListener('click',function(e){e.stopPropagation();poke();menuOpen?closeMenu():openMenu()});
slime.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();poke();menuOpen?closeMenu():openMenu()}});
document.addEventListener('click',function(){if(menuOpen)closeMenu()});
menu.addEventListener('click',function(e){e.stopPropagation()});

/* ---------- rails ---------- */
var rails={};
[].slice.call(document.querySelectorAll('.track')).forEach(function(track){
var key=track.dataset.rail,cards=[].slice.call(track.children),
dots=document.querySelector('[data-dots="'+key+'"]'),idx=0,drag=null,off=0;
cards.forEach(function(c,i){var d=document.createElement('button');d.className='dot';d.type='button';d.setAttribute('aria-label','Card '+(i+1));d.onclick=function(){set(i)};dots.appendChild(d)});
var dEls=[].slice.call(dots.children);
function dims(){var rs=getComputedStyle(track.parentElement),cs=getComputedStyle(track);
return{w:parseFloat(rs.getPropertyValue('--cw'))||320,a:parseFloat(rs.getPropertyValue('--caw'))||468,g:parseFloat(cs.columnGap||cs.gap)||20}}
function layout(anim){
var D=dims(),rail=track.parentElement,pad=parseFloat(getComputedStyle(rail).paddingLeft)||0,
vw=rail.clientWidth-pad*2,x=0,i;
for(i=0;i<idx;i++)x+=(i===idx?D.a:D.w)+D.g;
var center=x+D.a/2,base=vw/2-center;
track.style.transition=anim?'transform 1.05s cubic-bezier(.4,.5,.25,1)':'none';
track.style.transform='translate3d('+(base+off)+'px,0,0)';
}
function set(i,anim){idx=Math.max(0,Math.min(cards.length-1,i));
cards.forEach(function(c,k){c.classList.toggle('is-on',k===idx);c.style.filter=k===idx?'none':'blur(.4px)';c.style.opacity=k===idx?1:.72});
dEls.forEach(function(d,k){d.classList.toggle('is-on',k===idx)});
layout(anim!==false)}
rails[key]={set:function(d){set(idx+d)},relayout:function(){layout(false)}};
set(0,false);

track.addEventListener('pointerdown',function(e){
if(e.target.closest('a'))return;
drag={x:e.clientX,id:e.pointerId};off=0;track.classList.add('is-drag');track.setPointerCapture(e.pointerId)});
track.addEventListener('pointermove',function(e){if(!drag)return;off=(e.clientX-drag.x)*0.9;layout(false)});
function end(e){if(!drag)return;var D=dims(),moved=off;drag=null;track.classList.remove('is-drag');
var steps=Math.round(-moved/(D.w+D.g));off=0;
if(Math.abs(moved)>60)set(idx+steps||idx+(moved<0?1:-1));else set(idx);}
track.addEventListener('pointerup',end);track.addEventListener('pointercancel',end);

cards.forEach(function(c,i){
c.addEventListener('click',function(e){
if(e.target.closest('a'))return;
if(i!==idx){set(i);return}
if(c.dataset.yt){e.preventDefault();openLb(c.dataset.yt)}
else if(c.dataset.href)location.href=c.dataset.href;
})});
});
[].slice.call(document.querySelectorAll('[data-nav]')).forEach(function(b){
b.onclick=function(){rails[b.dataset.for].set(b.dataset.nav==='next'?1:-1)}});

/* ---------- lightbox ---------- */
function openLb(id){lbf.innerHTML='<iframe allow="autoplay; encrypted-media" allowfullscreen src="https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0"></iframe>';lb.classList.add('is-on')}
function closeLb(){lb.classList.remove('is-on');lbf.innerHTML=''}
lbx.onclick=closeLb;lb.addEventListener('click',function(e){if(e.target===lb)closeLb()});

/* ---------- loop ---------- */
var target=0,touchY=null;
(function(){var h=(location.hash||'').slice(1);if(!h)return;h=h.toLowerCase();
for(var i=0;i<N;i++){var s=screens[i],k=(s.dataset.screenLabel||s.dataset.name||'').toLowerCase();
if(k===h||k.indexOf(h)===0){cur=Math.max(0,i-0.6);target=i;return}}})();
function nudge(d){target=Math.max(0,Math.min(N-1,target+d))}
function absorbs(dy){var s=live>-1?screens[live]:null;if(!s)return false;
var room=s.scrollHeight-s.clientHeight;if(room<6)return false;
if(dy>0)return s.scrollTop<room-1;
return s.scrollTop>1}
addEventListener('wheel',function(e){
if(lb.classList.contains('is-on'))return;
if(e.target.closest&&e.target.closest('.menu'))return;
var d=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?H:1);
if(absorbs(d))return;
e.preventDefault();
nudge(d/(H*0.5));
},{passive:false});
addEventListener('touchstart',function(e){touchY=e.touches[0].clientY},{passive:true});
addEventListener('touchmove',function(e){
if(touchY===null||lb.classList.contains('is-on'))return;
var y=e.touches[0].clientY;
var dy=touchY-y;
if(!e.target.closest('.track')){
if(absorbs(dy)){touchY=y;return}
e.preventDefault();nudge(dy/(H*SWIPE))}
touchY=y;
},{passive:false});
addEventListener('touchend',function(){touchY=null;target=Math.max(0,Math.min(N-1,Math.round(target)))});
addEventListener('keydown',function(e){
if(e.key==='Escape'){closeLb();closeMenu()}
if(lb.classList.contains('is-on'))return;
if(e.key==='ArrowRight'&&rails.work&&live===1)rails.work.set(1);
if(e.key==='ArrowLeft'&&rails.work&&live===1)rails.work.set(-1);
if(e.key==='ArrowRight'&&rails.proto&&live===2)rails.proto.set(1);
if(e.key==='ArrowLeft'&&rails.proto&&live===2)rails.proto.set(-1);
if(e.key==='ArrowDown'||e.key==='PageDown'||e.key===' '){e.preventDefault();goTo(Math.round(cur)+1)}
if(e.key==='ArrowUp'||e.key==='PageUp'){e.preventDefault();goTo(Math.round(cur)-1)}
});
var settle=0;
addEventListener('resize',function(){H=innerHeight;Object.keys(rails).forEach(function(k){rails[k].relayout()})});
(function loop(ts){
/* magnetise toward the nearest screen when the wheel goes quiet */
var near=Math.round(target);
if(Math.abs(target-near)>0.001)target+=(near-target)*SNAP;
cur+=(target-cur)*(reduce?1:LERP);
if(Math.abs(target-cur)<0.0004)cur=target;
paint();requestAnimationFrame(loop)})();
paint();
})();
