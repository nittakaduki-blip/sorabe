(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const saving = () => !!connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '');
  let paused = false;
  const enabled = () => !paused && !reduced.matches && !saving();
  const headings = [...document.querySelectorAll('main section:not(#top) h2, #experience h3')];
  const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('ja', { granularity: 'grapheme' }) : null;
  const split = text => segmenter ? [...segmenter.segment(text)].map(item => item.segment) : [...text];
  const headingObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('headline-visible');
      headingObserver.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -4% 0px' }) : null;
  // Both section h2s and the large narrative h3s animate. Preserve existing spans and brs.
  headings.forEach(heading => {
    if (!enabled() || !headingObserver) return;
    const label = heading.innerText.replace(/\s+/g, ' ').trim();
    let index = 0;
    function wrap(element) {
      [...element.childNodes].forEach(node => {
        if (node.nodeType === 3) {
          const fragment = document.createDocumentFragment();
          split(node.textContent).forEach(character => {
            const letter = document.createElement('span');
            letter.className = 'headline-letter' + (/\s/.test(character) ? ' headline-space' : '');
            letter.textContent = character;
            letter.setAttribute('aria-hidden', 'true');
            letter.style.setProperty('--letter-delay', `${Math.min(index++ * 38, 760)}ms`);
            fragment.append(letter);
          });
          node.replaceWith(fragment);
        } else if (node.nodeType === 1 && node.nodeName !== 'BR') wrap(node);
      });
    }
    wrap(heading);
    heading.setAttribute('aria-label', label);
    heading.classList.add('headline-ready');
    headingObserver.observe(heading);
  });

  const video = document.querySelector('#scroll-sky') ? null : document.querySelector('.night-video');
  const hero = document.querySelector('#top');
  const control = document.querySelector('[data-night-pause]');
  let heroVisible = true, playRevision = 0;
  function syncVideo() {
    if (!video) return;
    const revision = ++playRevision;
    if (!enabled() || !heroVisible || document.hidden) {
      video.pause();
      if (reduced.matches || saving()) video.classList.remove('is-playing');
      return;
    }
    if (!video.src) { video.src = video.dataset.src; video.load(); }
    video.muted = true;
    video.play().then(() => {
      if (revision === playRevision && enabled() && heroVisible && !document.hidden) video.classList.add('is-playing');
      else video.pause();
    }).catch(() => video.classList.remove('is-playing'));
  }
  video?.addEventListener('error', () => video.classList.remove('is-playing'));
  if ('IntersectionObserver' in window && hero) new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting; syncVideo();
  }).observe(hero);

  const canvas = document.querySelector('#night-dust');
  const ctx = canvas?.getContext('2d', { alpha: true });
  const sky = document.querySelector('#scroll-sky img');
  let meteor = null, nextMeteor = 6000;
  function moveSky() {
    if (!sky) return;
    const travel = Math.max(0, sky.getBoundingClientRect().height - innerHeight);
    const progress = Math.min(1, Math.max(0, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)));
    sky.style.setProperty('--sky-offset', `${-travel * progress}px`);
  }
  let w = 0, h = 0, stars = [], frame = 0, lastFrame = 0;
  let target = scrollY, position = target, velocity = 0;
  function resize() {
    if (!ctx) return;
    w = innerWidth; h = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, w < 640 ? 1.25 : 1.5);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: w < 640 ? 28 : 60 }, (_, i) => ({
      x: ((i * .61803398875 + .1) % 1) * w,
      y: ((i * .41421356237 + .2) % 1) * h,
      depth: .04 + (i % 6) * .022, r: .55 + (i % 4) * .32, phase: i * 2.17,
    }));
    moveSky();
  }
  function draw(time) {
    if (!ctx || !enabled() || document.hidden) { frame = 0; return; }
    frame = requestAnimationFrame(draw);
    if (time - lastFrame < 33.3) return;
    lastFrame = time;
    const delta = (target - position) * .09;
    position += delta; velocity += (delta - velocity) * .12;
    ctx.clearRect(0, 0, w, h);
    const t = time / 1000;
    stars.forEach(star => {
      const x = star.x + Math.sin(t * .15 + star.phase) * 9 + Math.min(velocity, 45) * Math.sin(star.phase) * .14;
      const y = ((star.y - position * star.depth + Math.cos(t * .1 + star.phase) * 8) % h + h) % h;
      ctx.globalAlpha = .24 + (Math.sin(t * .38 + star.phase) + 1) * .18;
      ctx.fillStyle = '#e7edf4';
      ctx.beginPath(); ctx.arc(x, y, star.r, 0, Math.PI * 2); ctx.fill();
    });
    if (!meteor && time > nextMeteor) {
      meteor = { start: time, x: w * (.45 + Math.random() * .45), y: h * (.08 + Math.random() * .3) };
      nextMeteor = time + 14000 + Math.random() * 16000;
    }
    if (meteor) {
      const age = (time - meteor.start) / 1250;
      if (age >= 1) meteor = null;
      else {
        const distance = Math.min(w * .42, 420), x = meteor.x - age * distance, y = meteor.y + age * distance * .55;
        const tail = Math.min(w * .15, 135), gradient = ctx.createLinearGradient(x, y, x + tail, y - tail * .55);
        gradient.addColorStop(0, '#f4f7ff'); gradient.addColorStop(1, '#dce7ff00');
        ctx.globalAlpha = Math.sin(Math.PI * age) * .65;
        ctx.strokeStyle = gradient; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + tail, y - tail * .55); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
  function sync() {
    root.classList.toggle('night-still', !enabled());
    if (!enabled()) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0; ctx?.clearRect(0, 0, w, h);
      meteor = null;
      headings.forEach(heading => heading.classList.add('headline-visible'));
    } else if (!frame && !document.hidden && ctx) frame = requestAnimationFrame(draw);
    if (control) {
      control.hidden = reduced.matches || saving();
      control.textContent = paused ? '演出を再開' : '演出を停止';
      control.setAttribute('aria-pressed', String(paused));
    }
    syncVideo();
  }
  control?.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', sync);
  connection?.addEventListener('change', sync);
  let skyFrame = 0;
  addEventListener('scroll', () => { target = scrollY; if (!skyFrame) skyFrame = requestAnimationFrame(() => { moveSky(); skyFrame = 0; }); }, { passive: true });
  sky?.addEventListener('load', moveSky);
  if ('ResizeObserver' in window && sky) new ResizeObserver(moveSky).observe(document.body);
  addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; }
    sync();
  });
  resize(); sync();
})();
