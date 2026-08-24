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
var SPOTS={hero:[.9,.3],play:[.95,.52],trailer:[.95,.5],gallery:[.94,.58],loop:[.94,.28],role:[.93,.34],problems:[.94,.3],design:[.93,.3],systems:[.94,.62],pipeline:[.93,.36],contact:[.16,.68]};
var frag=document.createElement('div');
frag.innerHTML='<div class="bubble" id="bubble"></div><div class="menu" id="menu"></div>'+
'<div class="slime" id="slime" role="button" tabindex="0" aria-label="Companion menu"><div class="slime__body"><span class="slime__gloss"></span><span class="slime__face"><i class="slime__ear slime__ear--l"></i><i class="slime__ear slime__ear--r"></i><i class="slime__eye slime__eye--c"></i><i class="slime__eye slime__eye--y"></i></span></div></div>';
while(frag.firstChild)document.body.appendChild(frag.firstChild);
var slime=document.getElementById('slime'),bubble=document.getElementById('bubble'),menu=document.getElementById('menu'),
secs=[].slice.call(document.querySelectorAll('[data-section]')),live=0,said='';

/* menu: page sections + home */
secs.forEach(function(s,i){
var b=document.createElement('button');b.type='button';
var h=s.querySelector('h1,h2'),num=s.querySelector('.sec__num');
b.innerHTML='<i>'+(num?num.textContent:'00')+'</i>'+(h?h.textContent.replace(/\s+/g,' ').trim():s.dataset.section);
b.onclick=function(){closeMenu();window.scrollTo({top:s.getBoundingClientRect().top+pageYOffset-70,behavior:'smooth'})};
menu.appendChild(b)});
var home=document.createElement('button');home.type='button';home.innerHTML='<i>←</i>Back to the index';
home.onclick=function(){location.href='index.html'};menu.appendChild(home);
var mbs=[].slice.call(menu.children);
var quiet=false;try{quiet=localStorage.getItem('slimeQuiet')==='1'}catch(e){}
var qBtn=document.createElement('button');qBtn.type='button';qBtn.className='menu__toggle';
function paintQuiet(){qBtn.innerHTML='<i>'+(quiet?'○':'●')+'</i>'+(quiet?'Okay, you can talk':'Please stop talking');qBtn.setAttribute('aria-pressed',quiet?'true':'false')}
paintQuiet();
qBtn.onclick=function(e){e.stopPropagation();quiet=!quiet;try{localStorage.setItem('slimeQuiet',quiet?'1':'0')}catch(err){}paintQuiet();if(quiet)bubble.classList.remove('is-on')};
menu.appendChild(qBtn);

/* ---------- physics (ported from the home deck) ---------- */
var bubbleDY=0,fitT=0,smooth=0,antUntil=0,antDur=340,antX=0,antY=0,lastSpot=-1,fast=0,landAt=-9e3,landV=0;
var sx=innerWidth*.9,sy=innerHeight*.3,tx=sx,ty=sy,vx=0,vy=0,t0=0,bubbleT=0,menuOpen=false;
var tyBase=innerHeight*.3;
function targets(){var s=SPOTS[secs[live]?secs[live].dataset.section:'hero']||SPOTS.hero;tx=innerWidth*s[0];tyBase=innerHeight*s[1];ty=tyBase+follow()}
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
slime.style.transform='translate3d('+(sx-38)+'px,'+(sy-38+bob)+'px,0)';
slime.firstElementChild.style.transform='rotate('+rot.toFixed(2)+'deg) scale('+sqx.toFixed(3)+','+sqy.toFixed(3)+')';
slime.querySelector('.slime__face').style.transform='translate(-50%,-50%) translate('+(vx*0.3).toFixed(2)+'px,'+(vy*0.3+bob*0.22).toFixed(2)+'px)';
var right=sx<innerWidth*0.5;
bubble.style.left=(right?sx+52:sx-52-bubble.offsetWidth)+'px';
bubble.style.top=(sy-24-bubble.offsetHeight/2+bob)+'px';
bubble.style.borderRadius=right?'18px 18px 18px 6px':'18px 18px 6px 18px';
menu.style.left=Math.max(14,Math.min(innerWidth-238,sx-(right?0:214)))+'px';
menu.style.top=(sy>innerHeight*0.5?sy-54-menu.offsetHeight:sy+54)+'px';
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
function say(txt,ms){if(!txt||menuOpen)return;bubble.textContent=txt;bubble.classList.add('is-on');bubbleT=performance.now()+(ms||5200);bubbleDY=0;clearTimeout(fitT);fitT=setTimeout(fit,600)}
window.slimeSay=say;
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

/* section tracking */
function onScroll(){
var mid=innerHeight*0.42,here=-1;
secs.forEach(function(s,i){var r=s.getBoundingClientRect();if(r.top<=mid&&r.bottom>mid)here=i});
if(here<0||here===live)return;
live=here;
mbs.forEach(function(b,k){b.classList.toggle('is-here',k===live)});
var s=secs[live],k=s.dataset.section;
if(k!==said){said=k;if(!quiet)say(s.dataset.say||SAY[k])}
}
addEventListener('scroll',onScroll,{passive:true});
setTimeout(function(){mbs[0].classList.add('is-here');if(!quiet)say(secs[0]&&secs[0].dataset.say||SAY.hero);onScroll()},800);
})();