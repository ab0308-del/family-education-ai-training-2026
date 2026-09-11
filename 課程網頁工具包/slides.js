const slides=[...document.querySelectorAll('.slide')];let index=0;
const counter=document.querySelector('#counter'),title=document.querySelector('#currentTitle'),menu=document.querySelector('#menu');
function show(n){index=(n+slides.length)%slides.length;slides.forEach((s,i)=>s.classList.toggle('active',i===index));counter.textContent=`${index+1} / ${slides.length}`;title.textContent=slides[index].dataset.title;history.replaceState(null,'',`#${index+1}`)}
slides.forEach((s,i)=>{const b=document.createElement('button');b.textContent=`${String(i+1).padStart(2,'0')}  ${s.dataset.title}`;b.onclick=()=>{show(i);menu.hidden=true};menu.appendChild(b)});
document.querySelector('#prev').onclick=()=>show(index-1);document.querySelector('#next').onclick=()=>show(index+1);document.querySelector('#menuBtn').onclick=()=>menu.hidden=!menu.hidden;document.querySelector('#fullscreen').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();
addEventListener('keydown',e=>{if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();show(index+1)}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();show(index-1)}if(e.key==='Home')show(0);if(e.key==='End')show(slides.length-1);if(e.key==='Escape')menu.hidden=true});
document.querySelectorAll('[data-copy-target]').forEach(button=>button.addEventListener('click',async()=>{
  const source=document.getElementById(button.dataset.copyTarget);if(!source)return;
  const text=source.innerText.trim();
  try{await navigator.clipboard.writeText(text)}catch(_){const helper=document.createElement('textarea');helper.value=text;helper.style.position='fixed';helper.style.opacity='0';document.body.appendChild(helper);helper.select();document.execCommand('copy');helper.remove()}
  const original=button.textContent;button.textContent='已複製！';button.classList.add('copied');setTimeout(()=>{button.textContent=original;button.classList.remove('copied')},1800);
}));
show(Math.max(0,(parseInt(location.hash.slice(1))||1)-1));
