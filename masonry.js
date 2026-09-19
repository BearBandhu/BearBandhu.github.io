/* fine-row masonry for #pgrid: cards keep natural height, short cards backfill gaps */
(function(){
var grid=document.getElementById('pgrid');if(!grid)return;
var UNIT=8,raf=0,writing=false,frozen=false,pending=false,thaw=0;
var FINE=matchMedia('(hover: hover) and (pointer: fine)').matches;
function items(){return [].filter.call(grid.children,function(el){return !el.hidden&&el.offsetParent!==null})}
function layout(){
raf=0;writing=true;syncSide();
var gap=parseFloat(getComputedStyle(grid).rowGap)||0;
items().forEach(function(el){
var h=el.offsetHeight;
var span=Math.max(1,Math.ceil((h+gap)/(UNIT+gap)));
el.style.gridRowEnd='span '+span;
});
writing=false;
}
/* height of n row tracks incl. the gaps between them */
function rows(n,gap){return n*UNIT+(n-1)*gap}
function syncSide(){
var hero=grid.querySelector('.bcard--intro');if(!hero)return;
var sides=grid.querySelectorAll('.bcard--ctc,.bcard--stats');
var cols=getComputedStyle(grid).gridTemplateColumns.split(' ').length;
if(sides.length!==2||hero.classList.contains('is-wide')||cols<3){grid.style.removeProperty('--side-h');hero.style.removeProperty('min-height');return}
var gap=parseFloat(getComputedStyle(grid).rowGap)||0;
/* free height the hero wants, then snap to an EVEN row span so it divides in two */
hero.style.removeProperty('min-height');
var want=hero.offsetHeight;
var s=Math.max(2,Math.ceil((want+gap)/(UNIT+gap)));
if(s%2)s++;
var half=s/2;
var sideH=rows(half,gap);
grid.style.setProperty('--side-h',sideH+'px');
hero.style.minHeight=rows(s,gap)+'px';
}
function schedule(){if(writing||raf)return;if(frozen){pending=true;return}raf=requestAnimationFrame(layout)}
function unfreeze(){frozen=false;clearTimeout(thaw);if(pending){pending=false;schedule()}}
if(FINE){
grid.addEventListener('pointerover',function(e){if(e.target.closest('.pcard')){frozen=true;clearTimeout(thaw);thaw=setTimeout(unfreeze,1500)}});
grid.addEventListener('pointerout',function(e){if(!e.relatedTarget||!grid.contains(e.relatedTarget))unfreeze()});
grid.addEventListener('pointermove',function(e){if(frozen&&!e.target.closest('.pcard'))unfreeze()});
addEventListener('pointerdown',unfreeze);
addEventListener('blur',unfreeze);
}
window.pgridLayout=schedule;
addEventListener('resize',schedule);
addEventListener('load',schedule);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(schedule);
[].forEach.call(grid.querySelectorAll('img'),function(i){if(!i.complete)i.addEventListener('load',schedule,{once:true})});
if(window.ResizeObserver){var ro=new ResizeObserver(function(){schedule()});[].forEach.call(grid.children,function(el){ro.observe(el)})}
new MutationObserver(schedule).observe(grid,{attributes:true,attributeFilter:['class','hidden'],subtree:true,childList:true});
schedule();setTimeout(schedule,300);
})();
