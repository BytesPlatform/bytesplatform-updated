import gsap from 'gsap';

/** Native horizontal gallery, with vertical-wheel input mapped onto the rail. */
export function createCaseGallery(dialog, { onClose, onNext, isBusy, reducedMotion }) {
  const rail = dialog.querySelector('.case-gallery');
  const intro = dialog.querySelector('.case-header');
  // The cover leads the rail; populate() refills the slides after it.
  const hero = rail.querySelector('.case-hero');
  let introMotion = null;
  const events = new AbortController();
  let tween = null;
  let target = 0;
  let slides = [];
  // Image cards play their entrance every time they enter view (see the
  // .case-slide rules); leaving view resets them while they're off screen.
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.classList.toggle('is-in', entry.isIntersecting);
  }, { root: dialog });
  function watchSlides() {
    reveal.disconnect();
    rail.querySelectorAll('.case-slide').forEach(slide => {
      slide.classList.remove('is-in');
      void slide.offsetWidth; // Commit the reset so a re-entry animates again.
      reveal.observe(slide);
    });
  }
  // Scrolling on at the very end fills the "Next project" line; stop and it
  // drains. A full line hands over to the next project (onNext).
  const end = dialog.querySelector('.case-end');
  const NEXT_TRAVEL = 3000; // Wheel pixels past the end that fill the line.
  let nextProgress = 0;
  let lastPush = 0;
  let drainFrame = 0;
  function setNextProgress(value) {
    nextProgress = Math.max(0, Math.min(1, value));
    end.style.setProperty('--next-progress', String(nextProgress));
  }
  function drain() {
    drainFrame = 0;
    if (performance.now() - lastPush > 160) setNextProgress(nextProgress - .03);
    if (nextProgress > 0) drainFrame = requestAnimationFrame(drain);
  }
  function pushNext(delta) {
    setNextProgress(nextProgress + delta / NEXT_TRAVEL);
    lastPush = performance.now();
    if (nextProgress >= 1) {
      cancelAnimationFrame(drainFrame);
      drainFrame = 0;
      onNext();
      return;
    }
    if (!drainFrame) drainFrame = requestAnimationFrame(drain);
  }
  const limit = () => Math.max(0, dialog.scrollWidth - dialog.clientWidth);
  function update() {
    // Each intro element has its own scrubbed fade/movement duration.
    // Its fixed parent prevents native horizontal scrolling moving the CTA.
    introMotion?.time(dialog.scrollLeft / Math.max(1, dialog.clientWidth));
    intro.inert = dialog.scrollLeft > dialog.clientWidth * .92;
  }
  // The end panel shows the next project's name as a scaled-down copy of the
  // title: same line breaks, smaller. nextCaseStudy() then only has to move
  // and grow it into place (see rootCardsScene).
  const nextName = end.querySelector('.case-next-title');
  function sizeNextName() {
    const title = intro.querySelector('h2');
    const width = title.clientWidth;
    if (!width || !end.clientWidth) return;
    const style = getComputedStyle(title);
    const room = end.clientWidth - 2 * parseFloat(getComputedStyle(nextName).left);
    const scale = Math.min(1, room / width);
    end.style.setProperty('--next-width', `${width * scale}px`);
    end.style.setProperty('--next-font', `${parseFloat(style.fontSize) * scale}px`);
    end.style.setProperty('--next-weight', style.fontWeight);
  }
  function buildIntroMotion() {
    sizeNextName();
    introMotion?.kill();
    const width = dialog.clientWidth || window.innerWidth;
    const distance = reducedMotion.matches ? 0 : width;
    const title = intro.querySelector('h2');
    const paragraphs = intro.querySelectorAll('.case-story p');
    const facts = intro.querySelector('.case-facts');
    const launch = intro.querySelector('.case-project-link');
    gsap.set([title, ...paragraphs, facts, launch], { clearProps: 'transform,opacity' });
    introMotion = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
      .to(title, { x: -distance * .26, opacity: 0, duration: .58 }, 0)
      .to(paragraphs, { x: -distance * .065, opacity: 0, duration: .72, stagger: .06 }, 0)
      .to(facts, { x: -distance * .035, opacity: 0, duration: .88 }, 0)
      .to(launch, { opacity: 0, duration: .42 }, 0);
    update();
  }
  function stop() { tween?.kill(); tween = null; target = dialog.scrollLeft; }
  function move(value) {
    const toEnd = value >= limit();
    target = Math.max(0, Math.min(limit(), value));
    tween?.kill();
    tween = gsap.to(dialog, { scrollLeft: target, duration: reducedMotion.matches ? 0 : .45, ease: 'power2.out', onComplete: () => {
      if (toEnd) dialog.scrollLeft = limit();
      tween = null;
      update();
    } });
  }
  function step(direction) {
    const x = dialog.scrollLeft;
    // Centre on each slide's middle: unlike its edges, that stays put while an
    // off-screen card waits scaled down for its entrance.
    const points = slides.map((slide, index) => {
      if (index === 0) return 0;
      const box = slide.getBoundingClientRect();
      return Math.max(0, Math.min(limit(), box.left + box.width / 2 + x - dialog.clientWidth / 2));
    });
    move(direction > 0 ? points.find(point => point > x + 8) ?? limit() : points.reverse().find(point => point < x - 8) ?? 0);
  }
  dialog.addEventListener('wheel', event => {
    if (event.ctrlKey || isBusy() || event.target.closest('.case-palette, [data-hero-nav]')) return;
    event.preventDefault();
    const delta = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? dialog.clientWidth : 1);
    if (dialog.scrollLeft <= 1 && !tween && delta < -18) { onClose(); return; }
    const atEnd = limit() > 0 && (tween ? target : dialog.scrollLeft) >= limit() - 2;
    if (atEnd && (delta > 0 || nextProgress > 0)) { pushNext(delta); return; }
    move((tween ? target : dialog.scrollLeft) + delta);
  }, { passive: false, signal: events.signal });
  dialog.addEventListener('keydown', event => {
    if (isBusy() || event.target.closest('a, input, textarea, select, .case-palette, [data-hero-nav]')) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown', 'ArrowLeft', 'ArrowUp', 'PageUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'Home') move(0);
      else if (event.key === 'End') move(limit());
      else step(['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key) ? 1 : -1);
    }
  }, { signal: events.signal });
  dialog.addEventListener('pointerdown', stop, { signal: events.signal });
  dialog.addEventListener('scroll', update, { passive: true, signal: events.signal });
  window.addEventListener('resize', buildIntroMotion, { signal: events.signal });
  return {
    populate(project, cover, nextProject) {
      stop();
      rail.replaceChildren(hero);
      const seen = new Set([cover.src]);
      // Alternate a pair of portrait screens with a landscape composition.
      const portraits = project.media === 'device' ? [...project.shots] : [];
      const landscapes = (project.media === 'device' ? [...(project.extra || [])] : [...project.shots, ...(project.extra || [])]).filter(shot => shot.src !== cover.src);
      const ordered = [];
      while (landscapes.length || portraits.length) {
        if (portraits.length) ordered.push(...portraits.splice(0, 2).map(shot => ({ ...shot, orientation: 'portrait' })));
        if (landscapes.length) ordered.push({ ...landscapes.shift(), orientation: 'landscape' });
      }
      ordered.forEach(shot => {
        if (seen.has(shot.src)) return;
        seen.add(shot.src);
        const figure = document.createElement('figure');
        figure.className = `case-slide case-slide--${shot.orientation}`;
        const image = document.createElement('img');
        image.src = shot.src;
        image.alt = `${project.name}, ${shot.caption}`;
        image.loading = 'lazy';
        image.decoding = 'async';
        image.draggable = false;
        // Authored grouping gives stable loading sizes; natural dimensions
        // also support portrait assets in future browser projects.
        image.addEventListener('load', () => {
          figure.style.setProperty('--image-ratio', String(image.naturalWidth / image.naturalHeight));
          figure.classList.toggle('case-slide--portrait', image.naturalHeight > image.naturalWidth);
          figure.classList.toggle('case-slide--landscape', image.naturalHeight <= image.naturalWidth);
          update();
        }, { once: true });
        figure.append(image);
        rail.append(figure);
      });
      const link = dialog.querySelector('.case-project-link');
      link.hidden = !project.link;
      if (project.link) link.href = project.link.href;
      else link.removeAttribute('href');
      const services = dialog.querySelector('.case-services');
      services.replaceChildren(...project.discipline.map(service => {
        const item = document.createElement('li'); item.textContent = service; return item;
      }));
      const links = dialog.querySelector('.case-links');
      links.hidden = !project.link;
      if (project.link) {
        const site = links.querySelector('a'); site.href = project.link.href; site.textContent = project.link.label;
      }
      end.querySelector('.case-next-title').textContent = nextProject.name;
      end.querySelector('.case-next-project').setAttribute('aria-label', `Next project: ${nextProject.name}`);
      slides = [...rail.children, dialog.querySelector('.case-end')];
      dialog.scrollLeft = 0;
      setNextProgress(0);
      watchSlides();
      buildIntroMotion();
    },
    reset() { stop(); setNextProgress(0); dialog.scrollLeft = 0; sizeNextName(); update(); },
    refresh: buildIntroMotion,
    dispose() { stop(); cancelAnimationFrame(drainFrame); introMotion?.kill(); reveal.disconnect(); events.abort(); },
  };
}
