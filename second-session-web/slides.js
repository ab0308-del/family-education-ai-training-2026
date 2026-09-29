const slides = [...document.querySelectorAll('.slide')];
const counter = document.querySelector('#counter');
const title = document.querySelector('#currentTitle');
const sectionName = document.querySelector('#sectionName');
const progressBar = document.querySelector('#progressBar');
const menu = document.querySelector('#menu');
const menuBtn = document.querySelector('#menuBtn');
const toast = document.querySelector('#toast');
const notesToggle = document.querySelector('#notesToggle');
let index = 0;

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
}

function show(nextIndex, updateHash = true) {
  index = Math.max(0, Math.min(slides.length - 1, nextIndex));
  slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
  counter.textContent = `${index + 1} / ${slides.length}`;
  title.textContent = slides[index].dataset.title;
  sectionName.textContent = slides[index].dataset.section;
  progressBar.style.width = `${((index + 1) / slides.length) * 100}%`;
  [...menu.querySelectorAll('button')].forEach((button, i) => button.classList.toggle('current', i === index));
  if (updateHash) history.replaceState(null, '', `#${index + 1}`);
  slides[index].focus({ preventScroll: true });
}

let lastSection = '';
slides.forEach((slide, i) => {
  slide.tabIndex = -1;
  if (slide.dataset.section !== lastSection) {
    const heading = document.createElement('p');
    heading.className = 'menu-section';
    heading.textContent = slide.dataset.section;
    menu.appendChild(heading);
    lastSection = slide.dataset.section;
  }
  const button = document.createElement('button');
  button.type = 'button';
  button.innerHTML = `<span>${String(i + 1).padStart(2, '0')}</span><b>${slide.dataset.title}</b>`;
  button.addEventListener('click', () => {
    show(i);
    menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
  });
  menu.appendChild(button);
});

document.querySelector('#prev').addEventListener('click', () => show(index - 1));
document.querySelector('#next').addEventListener('click', () => show(index + 1));
menuBtn.addEventListener('click', () => {
  menu.hidden = !menu.hidden;
  menuBtn.setAttribute('aria-expanded', String(!menu.hidden));
});
document.querySelector('#fullscreen').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
});

notesToggle.addEventListener('click', () => {
  const open = document.body.classList.toggle('show-notes');
  notesToggle.setAttribute('aria-pressed', String(open));
});

document.addEventListener('keydown', event => {
  const tag = event.target.tagName;
  if (['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes(tag) && event.key === ' ') return;
  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); show(index + 1); }
  if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); show(index - 1); }
  if (event.key === 'Home') show(0);
  if (event.key === 'End') show(slides.length - 1);
  if (event.key === 'Escape') { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
});

document.addEventListener('click', event => {
  if (!menu.hidden && !menu.contains(event.target) && !menuBtn.contains(event.target)) {
    menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
  }
});

document.querySelectorAll('[data-copy-target]').forEach(button => button.addEventListener('click', async () => {
  const source = document.getElementById(button.dataset.copyTarget);
  if (!source) return;
  const text = source.innerText.trim();
  try {
    await navigator.clipboard.writeText(text);
  } catch (_) {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
  }
  notify('提示詞已複製');
}));

document.querySelectorAll('.countdown').forEach(timer => {
  const total = Number(timer.dataset.timer);
  const display = timer.querySelector('.time-display');
  const toggle = timer.querySelector('.timer-toggle');
  const reset = timer.querySelector('.timer-reset');
  let remaining = total;
  let running = false;
  let interval;
  const render = () => {
    const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
    const seconds = String(remaining % 60).padStart(2, '0');
    display.textContent = `${minutes}:${seconds}`;
  };
  const stop = () => { running = false; window.clearInterval(interval); toggle.textContent = '開始'; };
  toggle.addEventListener('click', () => {
    if (running) { stop(); return; }
    running = true;
    toggle.textContent = '暫停';
    interval = window.setInterval(() => {
      remaining -= 1;
      render();
      if (remaining <= 0) { stop(); notify('休息時間結束'); }
    }, 1000);
  });
  reset.addEventListener('click', () => { stop(); remaining = total; render(); });
  render();
});

window.addEventListener('hashchange', () => {
  const n = Number(location.hash.slice(1));
  if (Number.isFinite(n) && n >= 1 && n <= slides.length) show(n - 1, false);
});

const initial = Math.max(1, Math.min(slides.length, Number(location.hash.slice(1)) || 1));
show(initial - 1, false);
