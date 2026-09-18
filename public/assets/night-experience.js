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

  const video = document.querySelector('.night-video');
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
    ctx.globalAlpha = 1;
  }
  function sync() {
    root.classList.toggle('night-still', !enabled());
    if (!enabled()) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0; ctx?.clearRect(0, 0, w, h);
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
  addEventListener('scroll', () => { target = scrollY; }, { passive: true });
  addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; }
    sync();
  });
  resize(); sync();
})();
