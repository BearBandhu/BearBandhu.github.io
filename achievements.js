/* achievement tracking — drives customisation unlocks in slime-lab.js */
(function(){
var LIST=[
{id:'boot',n:'First Steps',how:'Move past the hero screen.'},
{id:'guide',n:'Ask the Guide',how:'Click the slime to open its menu.'},
{id:'keys',n:'Keyboard Player',how:'Change screens with the arrow keys.'},
{id:'scout',n:'Scout the Line',how:'Focus all six shipped games in the rail.'},
{id:'screening',n:'Screening Room',how:'Watch one game trailer.'},
{id:'binge',n:'Full Reel',how:'Open all six game trailers.'},
{id:'hands',n:'Hands On',how:'Open one playable prototype.'},
{id:'deep',n:'Deep Cut',how:'Open three different prototypes.'},
{id:'reader',n:'Case Reader',how:'Open a product design write-up.'},
{id:'outbound',n:'Store Visit',how:'Follow a Steam or itch.io link.'},
{id:'hire',n:'Make Contact',how:'Click the email address.'},
{id:'tour',n:'Grand Tour',how:'Visit every screen in the deck.'},
{id:'patient',n:'Long Look',how:'Spend three minutes on the site.'},
{id:'pet',n:'Slime Whisperer',how:'Pet the companion 15 times on this screen.'}
];
var KEY='slime-achv',subs=[];
var st={done:{},trailers:{},cards:{},screens:{},protos:{},secs:0,pets:0};
try{var s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.done)st=Object.assign(st,s)}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
function keys(o){return Object.keys(o||{}).length}
function meta(id){for(var i=0;i<LIST.length;i++)if(LIST[i].id===id)return LIST[i];return null}
var API={list:LIST,
has:function(id){return !!st.done[id]},
count:function(){return keys(st.done)},
total:LIST.length,
onchange:function(fn){subs.push(fn)},
reset:function(){st={done:{},trailers:{},cards:{},screens:{},protos:{},secs:0,pets:0};save();subs.forEach(function(f){f(null)})},
unlock:unlock};
window.SlimeAchv=API;

function unlock(id){
if(st.done[id]||!meta(id))return;
st.done[id]=1;save();
subs.forEach(function(f){f(id)});
toast(id);
}

/* ---------- toast ---------- */
var tHost=null,tTimer=0;
function toast(id){
var m=meta(id);if(!m)return;
if(!tHost){tHost=document.createElement('div');tHost.className='achv-toast';document.body.appendChild(tHost)}
var rw=API.rewardsFor?API.rewardsFor(id):'';
tHost.innerHTML='<span class="achv-toast__k">Achievement unlocked</span><strong>'+m.n+'</strong>'+(rw?'<span class="achv-toast__r">Unlocked '+rw+'</span>':'');
tHost.classList.add('is-on');document.body.classList.add('has-toast');
clearTimeout(tTimer);tTimer=setTimeout(function(){tHost.classList.remove('is-on');document.body.classList.remove('has-toast')},4200);
}

/* ---------- watchers ---------- */
function ready(){
var deck=document.getElementById('deck');if(!deck)return;
var screens=[].slice.call(document.querySelectorAll('.screen')),
workCards=[].slice.call(document.querySelectorAll('[data-rail="work"] .gcard')),
lb=document.getElementById('lb'),menu=document.getElementById('menu'),demo=document.getElementById('demo');

function seeScreen(el){
var i=screens.indexOf(el);if(i<0)return;
st.screens[i]=1;
if(i>0)unlock('boot');
if(keys(st.screens)>=screens.length-1)unlock('tour');
save();
}
new MutationObserver(function(ms){
ms.forEach(function(m){
var t=m.target;
if(t.classList.contains('screen')&&t.classList.contains('is-live'))seeScreen(t);
if(t.classList.contains('gcard')&&t.classList.contains('is-on')){
var k=workCards.indexOf(t);
if(k>-1){st.cards[k]=1;save();if(keys(st.cards)>=workCards.length)unlock('scout')}}
})}).observe(deck,{subtree:true,attributes:true,attributeFilter:['class']});
screens.forEach(function(s){if(s.classList.contains('is-live'))seeScreen(s)});

if(lb)new MutationObserver(function(){
if(!lb.classList.contains('is-on'))return;
unlock('screening');
var f=lb.querySelector('iframe'),m=f&&f.src.match(/embed\/([\w-]+)/);
if(m){st.trailers[m[1]]=1;save();if(keys(st.trailers)>=6)unlock('binge')}
}).observe(lb,{attributes:true,attributeFilter:['class'],subtree:true});

if(menu)new MutationObserver(function(){if(menu.classList.contains('is-on'))unlock('guide')})
.observe(menu,{attributes:true,attributeFilter:['class']});

addEventListener('keydown',function(e){
if(e.key==='ArrowUp'||e.key==='ArrowDown'||e.key==='PageUp'||e.key==='PageDown')unlock('keys')});

document.addEventListener('click',function(e){
var a=e.target.closest?e.target.closest('a'):null,
card=e.target.closest?e.target.closest('.gcard[data-href]'):null,
href=(a&&a.getAttribute('href'))||(card&&card.getAttribute('data-href'))||'';
if(!href)return;
if(/^mailto:/i.test(href))unlock('hire');
if(/^prototype-|^proto-/.test(href)){st.protos[href]=1;save();unlock('hands');if(keys(st.protos)>=3)unlock('deep')}
if(/^case-|^product-design/.test(href))unlock('reader');
if(/steampowered\.com|itch\.io/.test(href))unlock('outbound');
},true);

if(demo)demo.addEventListener('click',function(){
demo.classList.remove('is-pet');void demo.offsetWidth;demo.classList.add('is-pet');
st.pets=(st.pets||0)+1;save();if(st.pets>=15)unlock('pet')});

setInterval(function(){
if(document.hidden||st.done.patient)return;
st.secs=(st.secs||0)+1;
if(st.secs>=180)unlock('patient');else if(st.secs%10===0)save();
},1000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
