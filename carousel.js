/* Scroll-driven tilted filmstrip rails + info panel + trailer lightbox. */
(function(){
"use strict";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function ytId(raw){if(!raw)return"";const m=raw.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);return m?m[1]:(/^[\w-]{11}$/.test(raw)?raw:"")}

function buildThumb(card){
  const id=ytId(card.dataset.yt||"");
  const face=card.querySelector(".rcard__face");
  if(!face)return;
  if(id){
    const img=document.createElement("img");
    img.className="rcard__img";img.alt=(card.dataset.title||"")+" trailer still";img.decoding="async";
    const chain=["hqdefault"];let step=0;
    img.addEventListener("error",()=>{if(step<chain.length)img.src="https://i.ytimg.com/vi/"+id+"/"+chain[step++]+".jpg"});
    img.src="https://i.ytimg.com/vi/"+id+"/sddefault.jpg";
    face.appendChild(img);
    const badge=document.createElement("span");badge.className="rcard__play";badge.textContent="▶";face.appendChild(badge);
  }
  const d=card.dataset;
  const body=document.createElement("span");
  body.className="rcard__body";
  const more=d.more||"#";
  const ext=/^https?:/.test(more);
  body.innerHTML='<span class="rcard__tag2">'+(d.tag||"")+'</span><span class="rcard__title2">'+(d.title||"")+'</span><span class="rcard__desc2">'+(d.desc||"")+'</span><a class="rcard__more" href="'+more+'"'+(ext?' target="_blank" rel="noopener"':'')+'>'+((d.moreLabel||"See more")+" →")+'</a>';
  face.appendChild(body);
  const t=document.createElement("span");t.className="rcard__mini";t.textContent=d.title||"";face.appendChild(t);
}

/* ---- lightbox ---- */
let lb=null;
function openTrailer(id,title){
  if(!id)return;
  closeTrailer();
  lb=document.createElement("div");
  lb.className="lb";
  lb.innerHTML='<div class="lb__inner"><div class="lb__head"><span class="mono">'+(title||"Trailer")+'</span><button class="lb__x" aria-label="Close">×</button></div><div class="lb__frame"><iframe src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0" title="'+(title||"Trailer")+'" allow="autoplay;encrypted-media;picture-in-picture;fullscreen" allowfullscreen></iframe></div></div>';
  lb.addEventListener("click",e=>{if(e.target===lb||e.target.classList.contains("lb__x"))closeTrailer()});
  document.body.appendChild(lb);
  document.body.classList.add("lb-open");
}
function closeTrailer(){if(lb){lb.remove();lb=null;document.body.classList.remove("lb-open")}}
window.addEventListener("keydown",e=>{if(e.key==="Escape")closeTrailer()});

function initRail(rail){
  const stage=rail.querySelector(".rail__stage");
  const cards=Array.from(rail.querySelectorAll(".rcard"));
  if(!cards.length)return;
  cards.forEach(buildThumb);
  const count=rail.querySelector(".rail__count");
  const info=rail.querySelector(".rail__info");
  const tagOut=rail.querySelector(".rail__tag");
  const titleOut=rail.querySelector(".rail__title");
  const descOut=rail.querySelector(".rail__desc");
  const moreOut=rail.querySelector(".rail__more");
  let lastActive=-1;

  let probe=document.createElement("i");probe.className="rail__probe";stage.appendChild(probe);
  const step=()=>{const w=probe.getBoundingClientRect().width;return w>4?w:340};
  const extra=()=>{const a=stage.querySelector(".rcard--active"),n=stage.querySelector(".rcard:not(.rcard--active)");return a&&n?Math.max(0,a.getBoundingClientRect().width-n.getBoundingClientRect().width):0};

  let target=0,current=0,raf=0;

  function paint(f){
    const s=step();
    const ex=extra();
    const active=Math.round(f);
    cards.forEach((c,i)=>{
      const d=i-f;
      const ad=Math.abs(d);
      const near=clamp(1-ad,0,1);
      c.style.transform="translate3d("+(d*s+(i>active?1:i<active?-1:0)*ex/2)+"px,"+(-near*34)+"px,0) perspective(1400px) rotateY("+(-28+near*26)+"deg) scale("+(1+near*0.1)+")";
      c.style.opacity=ad>3?0:clamp(1.05-Math.max(0,ad-1.2)*0.5,0,1);
      c.style.filter="blur("+(clamp(ad-1.15,0,2)*2.7).toFixed(2)+"px) saturate("+(0.72+near*0.28).toFixed(2)+")";
      c.style.zIndex=String(100-Math.round(ad*10));
      c.classList.toggle("rcard--active",i===active);
      c.setAttribute("aria-hidden",ad>0.5?"true":"false");
      c.tabIndex=i===active?0:-1;
    });
    if(count)count.textContent=String(active+1).padStart(2,"0")+" / "+String(cards.length).padStart(2,"0");
    if(active!==lastActive){
      lastActive=active;
      const s2=cards[active].dataset;
      if(info){
        info.classList.remove("is-in");
        if(tagOut)tagOut.textContent=s2.tag||"";
        if(titleOut)titleOut.textContent=s2.title||"";
        if(descOut)descOut.textContent=s2.desc||"";
        if(moreOut){
          moreOut.textContent=(s2.moreLabel||"See more")+" →";
          moreOut.href=s2.more||"#";
          moreOut.target=/^https?:/.test(s2.more||"")?"_blank":"";
        }
        void info.offsetWidth;
        info.classList.add("is-in");
      }
    }
  }

  function tick(){
    current+=(target-current)*0.14;
    if(Math.abs(target-current)<0.0015){current=target;raf=0;paint(current);return}
    paint(current);
    raf=requestAnimationFrame(tick);
  }
  function setTarget(t){
    target=t;
    if(!raf)raf=requestAnimationFrame(tick);
  }
  function fromScroll(){
    const r=rail.getBoundingClientRect();
    const total=rail.offsetHeight-window.innerHeight;
    const p=total>0?clamp(-r.top/total,0,1):0;
    setTarget(p*(cards.length-1));
  }
  window.addEventListener("scroll",fromScroll,{passive:true});
  window.addEventListener("resize",fromScroll);
  fromScroll();current=target;paint(current);

  function scrollToIndex(i){
    const total=rail.offsetHeight-window.innerHeight;
    window.scrollTo({top:rail.offsetTop+(i/(cards.length-1))*total,behavior:"smooth"});
  }
  cards.forEach((c,i)=>{
    c.addEventListener("click",e=>{
      if(e.target.closest("a"))return;
      if(Math.round(current)!==i){scrollToIndex(i);return}
      const yt=ytId(c.dataset.yt||"");
      if(yt){openTrailer(yt,c.dataset.title);return}
      if(c.dataset.href)location.href=c.dataset.href;
    });
    c.addEventListener("keydown",e=>{if(e.key==="Enter")c.click()});
  });

  let dragging=false,startX=0,startFocus=0;
  stage.addEventListener("pointerdown",e=>{dragging=true;startX=e.clientX;startFocus=current;stage.setPointerCapture(e.pointerId)});
  stage.addEventListener("pointermove",e=>{
    if(!dragging)return;
    const f=clamp(startFocus-(e.clientX-startX)/200,0,cards.length-1);
    const total=rail.offsetHeight-window.innerHeight;
    window.scrollTo({top:rail.offsetTop+(f/(cards.length-1))*total});
  });
  ["pointerup","pointercancel"].forEach(ev=>stage.addEventListener(ev,()=>{dragging=false}));
}

document.querySelectorAll(".rail").forEach(initRail);
})();
