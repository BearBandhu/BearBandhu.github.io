/* Language switch — one set of pages, strings swapped at load.
   Dictionaries live in i18n-<lang>.js as window.I18N_DICT[lang].
   Keyed on the exact English innerHTML (inline tags included) or attribute value. */
(function(){
var DICTS=window.I18N_DICT||{},LANGS=['en','es'],KEY='siteLang';
var lang='en';try{lang=localStorage.getItem(KEY)||'en'}catch(e){}
if(LANGS.indexOf(lang)<0)lang='en';

function norm(s){return s.replace(/\s(data-cc-id|data-dm-ref|data-om-[\w-]+)="[^"]*"/g,'').replace(/\s+/g,' ').trim()}

function apply(l){
var d=DICTS[l];if(!d)return;
document.documentElement.lang=l;
if(d.title&&d.title[document.title])document.title=d.title[document.title];
var h={},a=d.attr||{},src=d.html||{},key;
for(key in src)if(src.hasOwnProperty(key))h[norm(key)]=src[key];
var els=document.querySelectorAll('h1,h2,h3,h4,p,li,dt,dd,span,a,button,em,strong,td,th,figcaption');
for(var i=0;i<els.length;i++){
var el=els[i];
if(el.querySelector('div,section,article,dl,ul,ol,nav,header,footer,p,h1,h2,h3,button'))continue;
if(el.innerHTML.indexOf('id=')>-1)continue; /* never rebuild nodes other scripts hold */
var k=norm(el.innerHTML);
if(h[k])el.innerHTML=h[k];
}
var ATTR=['data-say','data-name','alt','aria-label','placeholder','title'];
var all=document.querySelectorAll('[data-say],[data-name],[alt],[aria-label],[placeholder],[title]');
for(var j=0;j<all.length;j++)for(var n=0;n<ATTR.length;n++){
var v=all[j].getAttribute(ATTR[n]);
if(v&&a[v.trim()])all[j].setAttribute(ATTR[n],a[v.trim()]);
}
}

function button(){
var st=document.createElement('style');
st.textContent='.langsw{position:fixed;top:14px;right:14px;z-index:150;display:flex;gap:2px;padding:3px;border-radius:999px;'+
'background:rgba(255,255,255,.72);backdrop-filter:blur(9px);border:1px solid rgba(22,20,27,.12);box-shadow:0 4px 16px rgba(22,20,27,.08)}'+
'.langsw button{border:0;background:none;cursor:pointer;font:600 12px/1 var(--f-s,system-ui);letter-spacing:.06em;'+
'padding:7px 11px;border-radius:999px;color:rgba(22,20,27,.55)}'+
'.langsw button[aria-current="true"]{background:#16141B;color:#FAF7F4}'+
'.bar .langsw{position:static;top:auto;right:auto;box-shadow:none}'+
'@media(max-width:700px){.langsw{top:auto;bottom:14px;left:14px;right:auto}.bar .langsw{bottom:auto;left:auto}}';
document.head.appendChild(st);
var wrap=document.createElement('div');
wrap.className='langsw';
wrap.setAttribute('role','group');
wrap.setAttribute('aria-label',lang==='es'?'Idioma':'Language');
LANGS.forEach(function(l){
var b=document.createElement('button');
b.type='button';b.textContent=l.toUpperCase();
b.setAttribute('aria-current',l===lang?'true':'false');
b.setAttribute('lang',l);
b.onclick=function(){if(l===lang)return;try{localStorage.setItem(KEY,l)}catch(e){}location.reload()};
wrap.appendChild(b);
});
var host=document.querySelector('.bar .nav');
if(host)host.appendChild(wrap);else document.body.appendChild(wrap);
}

if(lang!=='en')apply(lang);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',button);else button();
})();
