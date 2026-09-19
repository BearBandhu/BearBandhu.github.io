(function(){
var grid=document.getElementById('pgrid');if(!grid)return;
var ES=document.documentElement.lang==='es';
var cards=[].slice.call(grid.querySelectorAll('.pcard')),
bcards=[].slice.call(grid.querySelectorAll('.bcard')),
chips=[].slice.call(document.querySelectorAll('.fchip[data-tag]')),
allBtn=document.querySelector('.fchip--all'),
count=document.getElementById('fcount'),
empty=document.getElementById('pempty'),
on={};

function tagsOf(c){return (c.dataset.tags||'').split(' ').filter(Boolean)}
function active(){return Object.keys(on).filter(function(k){return on[k]})}

function apply(){
var sel=active(),shown=0,shownB=0;
cards.concat(bcards).forEach(function(c){
if(bcards.indexOf(c)>-1){var keepB=!sel.length||sel.indexOf('about')>-1;if(keepB)shownB++;c.hidden=!keepB;c.classList.toggle('is-off',!keepB);return}
var ts=tagsOf(c),
keep=!sel.length||sel.some(function(s){return ts.indexOf(s)>-1});
if(keep)shown++;
[].forEach.call(c.querySelectorAll('.ptag'),function(t){t.classList.toggle('is-match',sel.indexOf(t.dataset.tag)>-1)});
if(keep){c.hidden=false;requestAnimationFrame(function(){c.classList.remove('is-off')})}
else if(!c.classList.contains('is-off')){c.classList.add('is-off');setTimeout(function(){if(c.classList.contains('is-off'))c.hidden=true},280)}
else c.hidden=true;
});
chips.forEach(function(b){b.setAttribute('aria-pressed',on[b.dataset.tag]?'true':'false')});
allBtn.setAttribute('aria-pressed',sel.length?'false':'true');
var onlyAbout=sel.length===1&&sel[0]==='about';
count.textContent=onlyAbout?(ES?'Sobre mí':'About me'):ES?(sel.length?shown+' de '+cards.length+' visibles':cards.length+' proyectos'):(sel.length?shown+' of '+cards.length+' shown':cards.length+' projects');
empty.hidden=shown>0||shownB>0;
paintMore();
}

var more=document.getElementById('fmore'),moreN=document.getElementById('fmoreN'),skills=document.getElementById('fskills'),
hidTags=[].slice.call(skills.querySelectorAll('.fchip[data-tag]')).map(function(b){return b.dataset.tag});
function paintMore(){var n=hidTags.filter(function(t){return on[t]}).length;
moreN.hidden=!n||skills.hidden===false;moreN.textContent=n;
more.setAttribute('aria-label',(skills.hidden?'Show':'Hide')+' more skill filters'+(n?' ('+n+' active)':''))}
more.addEventListener('click',function(){var open=skills.hidden;skills.hidden=!open;more.setAttribute('aria-expanded',open?'true':'false');paintMore()});

chips.forEach(function(b){b.addEventListener('click',function(){on[b.dataset.tag]=!on[b.dataset.tag];apply()})});
allBtn.addEventListener('click',function(){on={};apply()});
apply();

/* trailer lightbox */
var lb=document.getElementById('lb'),lbf=document.getElementById('lbf');
function close(){lb.classList.remove('is-on');lbf.innerHTML=''}
function open(id){lbf.innerHTML='<iframe allow="autoplay; encrypted-media" allowfullscreen frameborder="0" src="https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0"></iframe>';lb.classList.add('is-on')}
document.getElementById('lbx').addEventListener('click',close);
lb.addEventListener('click',function(e){if(e.target===lb)close()});
addEventListener('keydown',function(e){if(e.key==='Escape')close()});

grid.addEventListener('click',function(e){
var p=e.target.closest('.pcard__play');
if(p){e.preventDefault();return open(p.closest('.pcard').dataset.yt)}
if(e.target.closest('a'))return;
var c=e.target.closest('.pcard');
if(c&&c.dataset.href)location.href=c.dataset.href;
});
})();
