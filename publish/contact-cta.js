(function(){
var MAIL='alejandro.melian.r@gmail.com';
function go(){try{sessionStorage.setItem('mailCopied','1')}catch(e){}location.href='index.html#contact'}
document.addEventListener('click',function(e){
var a=e.target.closest('.js-hero-contact,.js-top-contact');if(!a)return;e.preventDefault();
if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(MAIL).then(go,go);
else{var t=document.createElement('textarea');t.value=MAIL;document.body.appendChild(t);t.select();try{document.execCommand('copy')}catch(err){}t.remove();go()}
});
})();
