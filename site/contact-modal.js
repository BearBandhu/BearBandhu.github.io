/* Contact me button in the sticky project-page bar + modal with email, LinkedIn and a message box. */
(function(){
var MAIL='alejandro.melian.r@gmail.com',LI='https://www.linkedin.com/in/a-melian/';
var css='.cmbtn{cursor:pointer}'
+'.cmod{position:fixed;inset:0;z-index:300;display:none;align-items:center;justify-content:center;padding:20px}'
+'.cmod.is-open{display:flex}'
+'.cmod__veil{position:absolute;inset:0;background:rgba(22,20,27,.45);backdrop-filter:blur(3px)}'
+'.cmod__box{position:relative;width:min(420px,100%);max-height:92vh;overflow:auto;background:var(--paper,#faf7f4);border:1px solid var(--line,rgba(22,20,27,.12));border-radius:20px;padding:22px 22px 24px;box-shadow:0 40px 90px -40px rgba(22,20,27,.6);animation:cmodin .2s ease}'
+'@keyframes cmodin{from{opacity:0;transform:translateY(10px)}}'
+'.cmod__x{position:absolute;top:12px;right:12px;width:30px;height:30px;border:0;border-radius:50%;background:rgba(22,20,27,.07);color:inherit;font-size:14px;line-height:1;cursor:pointer}'
+'.cmod__x:hover{background:rgba(22,20,27,.14)}'
+'.cmod__k{display:block;font-family:var(--f-m,monospace);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3,#7a7580)}'
+'.cmod__t{margin:6px 0 14px;font-family:var(--f-d,inherit);font-size:23px;line-height:1.15;letter-spacing:-.02em}'
+'.cmod__links{display:flex;flex-direction:column;gap:1px;border-top:1px solid var(--line,rgba(22,20,27,.12));margin-bottom:14px}'
+'.cmod__row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid var(--line,rgba(22,20,27,.12));text-decoration:none;color:inherit;font-size:13px;word-break:break-word}'
+'.cmod__row:hover{color:var(--hot,#e97a4e)}'
+'.cmod form{display:flex;flex-direction:column;gap:8px}'
+'.cmod input,.cmod textarea{width:100%;font:inherit;font-size:13px;color:inherit;background:rgba(255,255,255,.6);border:1px solid var(--line,rgba(22,20,27,.14));border-radius:10px;padding:9px 11px;outline:none}'
+'.cmod textarea{min-height:88px;resize:vertical;line-height:1.45}'
+'.cmod input:focus,.cmod textarea:focus{border-color:var(--hot,#e97a4e);background:#fff}'
+'.cmod__send{font:inherit;font-size:13px;font-weight:600;cursor:pointer;border:0;border-radius:10px;padding:10px 14px;color:#fff;background:linear-gradient(120deg,#e97a4e,#8a5cf0)}'
+'.cmod__send:hover{filter:brightness(1.07)}'
+'.cmod__note{margin:0;font-size:11px;line-height:1.4;color:var(--ink-3,#7a7580)}';
var s=document.createElement('style');s.textContent=css;document.head.appendChild(s);

var nav=document.querySelector('.bar .nav')||document.querySelector('.bar__in');
if(nav){var b=document.createElement('button');b.type='button';b.className='btn cmbtn';b.textContent='Contact me';nav.appendChild(b);b.onclick=open;}

var m=document.createElement('div');m.className='cmod';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','Contact');
m.innerHTML='<div class="cmod__veil" data-close></div><div class="cmod__box">'
+'<button class="cmod__x" type="button" data-close aria-label="Close">\u2715</button>'
+'<span class="cmod__k">Contact me</span><p class="cmod__t">Let\'s build something together.</p>'
+'<div class="cmod__links"><a class="cmod__row" href="mailto:'+MAIL+'"><span>'+MAIL+'</span><span>\u2192</span></a>'
+'<a class="cmod__row" href="'+LI+'" target="_blank" rel="noopener"><span>linkedin.com/in/a-melian</span><span>\u2197</span></a>'
+'<a class="cmod__row" href="assets/CV_AlejandroMelian.pdf" download="Alejandro-Melian-CV.pdf"><span>Download CV</span><span>PDF \u2193</span></a></div>'
+'<form><input type="text" name="name" placeholder="Your name" autocomplete="name" required>'
+'<input type="email" name="email" placeholder="Your email" autocomplete="email" required>'
+'<textarea name="message" placeholder="What are you working on?" required></textarea>'
+'<button class="cmod__send" type="submit">Send message</button>'
+'<p class="cmod__note">Opens your mail app with the message ready to send.</p></form></div>';
document.body.appendChild(m);

function open(){m.classList.add('is-open');var f=m.querySelector('input');if(f)f.focus();}
function close(){m.classList.remove('is-open');}
m.addEventListener('click',function(e){if(e.target.hasAttribute('data-close'))close();});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
m.querySelector('form').addEventListener('submit',function(e){
e.preventDefault();var f=e.target,n=f.name.value.trim(),mail=f.email.value.trim(),body=f.message.value.trim();
location.href='mailto:'+MAIL+'?subject='+encodeURIComponent('Portfolio message from '+n)+'&body='+encodeURIComponent(body+'\n\n\u2014 '+n+' ('+mail+')');
});
})();
