(function(){
var P=window.SLIME_PALETTES,BODY=P.body,FACE=P.face,EYES=P.eyes;
/* option -> achievement that unlocks it; unlisted = free from the start (the default look) */
var REQ={
body:{moss:'boot',tide:'guide',lilac:'keys',teal:'scout',ember:'screening',frost:'binge',citrus:'hands',grape:'deep',blush:'reader',cocoa:'outbound',coral:'hire'},
face:{leaf:'boot',sky:'guide',violet:'keys',teal:'scout',apricot:'screening',lime:'hands',rose:'reader',clay:'outbound',butter:'patient',slate:'tour',ivory:'pet'},
eyes:{round:'boot',oval:'guide',wide:'scout',spark:'screening',angry:'binge',tall:'hands',cross:'deep',sleepy:'patient',dizzy:'tour',wink:'pet',bead:'hire'}
};
var LABEL={body:'body',face:'face',eyes:'eyes'};
var SA=window.SlimeAchv||{has:function(){return true},list:[],count:function(){return 0},total:0,onchange:function(){}};
var DEF={body:'ink',face:'cream',eyes:'rect'},KEY='slime-look';
var state=Object.assign({},DEF);
try{var s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.body&&s.face&&s.eyes)state=s}catch(e){}

function name(set,id){var a=(set==='body'?BODY:set==='face'?FACE:EYES).filter(function(x){return x.id===id})[0];return a?a.n:id}
function locked(set,id){var a=REQ[set][id];return a?!SA.has(a):false}
function how(a){for(var i=0;i<SA.list.length;i++)if(SA.list[i].id===a)return SA.list[i];return null}
SA.rewardsFor=function(a){
var out=[];
Object.keys(REQ).forEach(function(set){Object.keys(REQ[set]).forEach(function(id){
if(REQ[set][id]===a)out.push(name(set,id)+' '+LABEL[set])})});
return out.join(', ')};

function apply(){
if(locked('body',state.body))state.body=DEF.body;
if(locked('face',state.face))state.face=DEF.face;
if(locked('eyes',state.eyes))state.eyes=DEF.eyes;
var b=(BODY.filter(function(x){return x.id===state.body})[0]||BODY[0]).v,
f=(FACE.filter(function(x){return x.id===state.face})[0]||FACE[0]).v,
r=document.documentElement.style;
r.setProperty('--sl-hi',b.hi);r.setProperty('--sl-mid',b.mid);r.setProperty('--sl-deep',b.deep);r.setProperty('--sl-edge',b.edge);
r.setProperty('--sl-face',f);
r.setProperty('--sl-eye',(state.face==='cream'||state.face==='ivory'||state.face==='butter')?'60,48,40':'14,52,24');
document.documentElement.setAttribute('data-eyes',state.eyes);
[].forEach.call(document.querySelectorAll('.opt'),function(o){
var set=o.dataset.set,id=o.dataset.val,lk=locked(set,id),m=lk?how(REQ[set][id]):null;
o.setAttribute('aria-pressed',String(id===state[set]));
o.classList.toggle('opt--lock',lk);
o.title=lk?'Locked · '+(m?m.n+' — '+m.how:'')  :name(set,id)+' '+LABEL[set];
});
try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}
}
var SAY_OK=['% it is.','How do I look in % ?','% suits me.','Trying on %.'];
var hint=document.getElementById('labHint');
function pick(set,val){
if(locked(set,val)){
var m=how(REQ[set][val]);
if(hint)hint.innerHTML='<b>'+name(set,val)+' '+LABEL[set]+' is locked</b> — '+(m?m.how+' ('+m.n+')':'');
if(window.slimeSay)window.slimeSay(m?'To wear '+name(set,val).toLowerCase()+' '+LABEL[set]+': '+m.how.charAt(0).toLowerCase()+m.how.slice(1)+' That earns “'+m.n+'”.':'Still locked.');
return}
state[set]=val;apply();
if(hint)hint.textContent=name(set,val)+' '+LABEL[set]+' applied.';
if(window.slimeSay)window.slimeSay(SAY_OK[Math.floor(Math.random()*SAY_OK.length)].replace('%',name(set,val).toLowerCase()+' '+LABEL[set]),3400);
}
function mk(host,set,items,build){
items.forEach(function(it){
var b=document.createElement('button');b.type='button';b.className='opt';b.dataset.set=set;b.dataset.val=it.id;
build(b,it);b.onclick=function(){pick(set,b.dataset.val)};host.appendChild(b)})}

mk(document.getElementById('setBody'),'body',BODY,function(b,it){
b.style.background='radial-gradient(circle at 34% 28%,rgb('+it.v.hi+') 2%,rgb('+it.v.mid+') 30%,rgb('+it.v.deep+') 66%,rgb('+it.v.edge+'))'});
mk(document.getElementById('setFace'),'face',FACE,function(b,it){b.style.background='rgb('+it.v+')'});
mk(document.getElementById('setEyes'),'eyes',EYES,function(b,it){
b.className='opt opt--eye';b.dataset.shape=it.id;b.innerHTML='<i></i><i></i>'});

/* ---------- achievements panel ---------- */
var panel=document.createElement('div');panel.className='achv';panel.id='achv';
panel.innerHTML='<div class="achv__box"><div class="achv__hd"><div><span class="mono">Companion unlocks</span><h3>Achievements</h3></div><button class="achv__x" type="button" aria-label="Close">✕</button></div><div class="achv__list"></div></div>';
document.body.appendChild(panel);
var list=panel.querySelector('.achv__list'),countEl=document.getElementById('labCount');
panel.querySelector('.achv__x').onclick=function(){panel.classList.remove('is-on')};
panel.addEventListener('click',function(e){if(e.target===panel)panel.classList.remove('is-on')});
function renderPanel(){
list.innerHTML=SA.list.map(function(a){
var got=SA.has(a.id);
return '<div class="achv__row'+(got?' is-got':'')+'"><span class="achv__mk">'+(got?'✓':'')+'</span><div><strong>'+a.n+'</strong><span class="achv__how">'+a.how+'</span><span class="achv__rw">Unlocks '+SA.rewardsFor(a.id)+'</span></div></div>'}).join('');
if(countEl)countEl.textContent=SA.count()+'/'+SA.total;
}
var open=document.getElementById('labAchv');
if(open)open.onclick=function(e){e.stopPropagation();panel.classList.add('is-on');renderPanel()};

document.getElementById('labReset').onclick=function(){state=Object.assign({},DEF);apply();if(hint)hint.textContent='Back to the default look.'};
SA.onchange(function(){apply();renderPanel()});
apply();renderPanel();
})();
