(() => {
  'use strict';
  const root = document.documentElement;
  const hero = document.querySelector('#top');
  const video = document.querySelector('.hero-video');
  const control = document.querySelector('[data-motion-control]');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const constrained = () => connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '');
  let paused = false, heroVisible = true, frame = 0, lastFrame = 0;
  const enabled = () => !paused && !preference.matches && !constrained();

  // Wrap explicit lines, not individual Japanese characters, preserving natural wrapping.
  const headings = [...document.querySelectorAll('main section:not(#top) h2')];
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('type-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .15, rootMargin: '0px 0px -5% 0px' }) : null;
  headings.forEach(heading => {
    if (!observer || !enabled()) return;
    const lines = [[]];
    [...heading.childNodes].forEach(node => {
      if (node.nodeName === 'BR') lines.push([]);
      else lines[lines.length - 1].push(node);
    });
    const fragment = document.createDocumentFragment();
    lines.forEach((nodes, index) => {
      const line = document.createElement('span');
      line.className = 'type-line';
      line.style.setProperty('--line-delay', `${index * 180}ms`);
      nodes.forEach(node => line.append(node));
      fragment.append(line);
    });
    heading.replaceChildren(fragment);
    heading.classList.add('type-ready');
    observer.observe(heading);
  });

  // Loading is opt-in at runtime: reduced-motion and data-saving users fetch no video.
  let playAttempt = 0;
  function syncVideo() {
    if (!video) return;
    const attempt = ++playAttempt;
    if (enabled() && heroVisible && !document.hidden) {
      if (!video.src) {
        video.src = video.dataset.src;
        video.load();
      }
      video.play().then(() => {
        if (attempt === playAttempt && enabled() && heroVisible && !document.hidden) video.classList.add('is-playing');
        else video.pause();
      }).catch(() => video.classList.remove('is-playing'));
    } else {
      video.pause();
      if (preference.matches || constrained()) video.classList.remove('is-playing');
    }
  }
  video?.addEventListener('error', () => video.classList.remove('is-playing'));
  if ('IntersectionObserver' in window && hero) new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    syncVideo();
  }, { threshold: 0 }).observe(hero);

  const canvas = document.querySelector('#stardust');
  const ctx = canvas?.getContext('2d', { alpha: true });
  let width = 0, height = 0, particles = [], scroll = window.scrollY, targetScroll = scroll;
  function resize() {
    if (!ctx) return;
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Seeded positions are stable across resizes. No textures, WebGL, or dependencies.
    particles = Array.from({ length: width < 640 ? 22 : 48 }, (_, i) => ({
      x: ((i * .61803398875) % 1) * width,
      y: ((i * .41421356237 + .17) % 1) * height,
      r: .5 + (i % 4) * .28, phase: i * 2.4, depth: .025 + (i % 5) * .014,
    }));
  }
  function draw(time) {
    if (!enabled() || document.hidden || !ctx) { frame = 0; return; }
    frame = requestAnimationFrame(draw);
    if (time - lastFrame < 33.3) return; // 30fps ceiling; small mobile particle budget.
    lastFrame = time;
    scroll += (targetScroll - scroll) * .075;
    ctx.clearRect(0, 0, width, height);
    const t = time / 1000;
    particles.forEach(p => {
      const x = p.x + Math.sin(t * .16 + p.phase) * 10;
      const y = ((p.y + Math.cos(t * .12 + p.phase) * 9 - scroll * p.depth) % height + height) % height;
      ctx.globalAlpha = .18 + (Math.sin(t * .35 + p.phase) + 1) * .16;
      ctx.fillStyle = '#e8dcc5';
      ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  function sync() {
    root.classList.toggle('motion-paused', !enabled());
    if (!enabled()) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0; ctx?.clearRect(0, 0, width, height);
      headings.forEach(heading => heading.classList.add('type-visible'));
    } else if (!frame && !document.hidden && ctx) frame = requestAnimationFrame(draw);
    if (control) {
      control.hidden = preference.matches || !!constrained();
      control.textContent = paused ? '演出を再開' : '演出を停止';
      control.setAttribute('aria-pressed', String(paused));
    }
    syncVideo();
  }
  control?.addEventListener('click', () => { paused = !paused; sync(); });
  preference.addEventListener('change', sync);
  connection?.addEventListener('change', sync);
  addEventListener('scroll', () => { targetScroll = window.scrollY; }, { passive: true });
  addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; }
    sync();
  });
  resize(); sync();
})();
