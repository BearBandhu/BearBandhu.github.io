(function(){
var L=document.documentElement.getAttribute('data-lens');
function pick(v){try{sessionStorage.setItem('lens',v)}catch(e){}var u=new URL(location.href);u.searchParams.set('view',v);u.hash='';location.replace(u.toString())}
document.addEventListener('click',function(e){var b=e.target.closest('[data-pick]');if(!b)return;e.preventDefault();var v=b.dataset.pick;if(v===L&&!document.documentElement.classList.contains('lens-open'))return;pick(v)});
[].forEach.call(document.querySelectorAll('.lensbar__b'),function(b){b.setAttribute('aria-pressed',b.dataset.pick===L?'true':'false')});
if(L==='game'){[].forEach.call(document.querySelectorAll('.pcard[data-lens-show]:not([data-lens-show~="game"])'),function(c){c.remove()})}
if(L==='product'){[].forEach.call(document.querySelectorAll('.pcard'),function(c){var t=' '+(c.dataset.tags||'')+' ';if(t.indexOf(' prototype ')>-1||t.indexOf(' jam ')>-1)c.remove()});[].forEach.call(document.querySelectorAll('.pcard[data-lens-show]:not([data-lens-show~="product"])'),function(c){c.remove()})}
var t={product:'Alejandro Melian — Product Design Portfolio',game:'Alejandro Melian — Game Design Portfolio',all:'Alejandro Melian — Product & Game Design Portfolio'};if(t[L])document.title=t[L];
})();
