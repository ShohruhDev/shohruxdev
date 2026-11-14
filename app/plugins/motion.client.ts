export default defineNuxtPlugin(nuxt => {
  const { enabled, reduced, choice } = useMotion();
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let saved: string | null = null;
  try {
    saved = localStorage.getItem('bs-motion');
  } catch {}
  let cleanup = () => {};
  let frame = 0;
  const setMode = () => {
    document.documentElement.dataset.motion = enabled.value ? 'on' : 'off';
    if (!enabled.value)
      document.getAnimations().forEach(a => {
        if (
          a.effect instanceof KeyframeEffect &&
          a.effect.target instanceof Element &&
          a.effect.target.hasAttribute('data-motion-reveal')
        )
          a.cancel();
      });
  };
  setMode();
  watch(enabled, () => {
    setMode();
    setup();
  });
  watch(choice, () => {
    try {
      if (choice.value) localStorage.setItem('bs-motion', choice.value);
    } catch {}
    enabled.value = !reduced.value && choice.value !== 'off';
  });
  const onPreference = () => {
    reduced.value = preference.matches;
    enabled.value = !reduced.value && choice.value !== 'off';
  };
  preference.addEventListener('change', onPreference);
  function setup() {
    cleanup();
    if (location.pathname.startsWith('/admin')) return;
    const disposers: (() => void)[] = [];
    if (enabled.value) {
      const observer = new IntersectionObserver(
        entries =>
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            const el = entry.target as HTMLElement;
            el.setAttribute('data-motion-reveal', '');
            const a = el.animate(
              [
                { opacity: 0, transform: 'translateY(36px)', filter: 'blur(5px)' },
                { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }
              ],
              {
                duration: 850,
                delay: Number(el.dataset.delay || 0),
                easing: 'cubic-bezier(.22,1,.36,1)',
                fill: 'none'
              }
            );
            disposers.push(() => a.cancel());
          }),
        { threshold: 0.08 }
      );
      document
        .querySelectorAll('[data-reveal],.page-intro,.service-row,.journal-card,.step,.cta-section')
        .forEach(el => observer.observe(el));
      disposers.push(() => observer.disconnect());
      if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
        document.querySelectorAll<HTMLElement>('.button').forEach(el => {
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.09}px ${(e.clientY - r.top - r.height / 2) * 0.13}px`;
          };
          const reset = () => {
            el.style.translate = '0 0';
          };
          el.addEventListener('pointermove', move);
          el.addEventListener('pointerleave', reset);
          disposers.push(() => {
            el.removeEventListener('pointermove', move);
            el.removeEventListener('pointerleave', reset);
            reset();
          });
        });
      }
    }
    cleanup = () => {
      disposers.forEach(fn => fn());
      cleanup = () => {};
    };
  }
  const progress = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      document.documentElement.style.setProperty(
        '--reading-progress',
        String(max > 0 ? scrollY / max : 0)
      );
    });
  };
  window.addEventListener('scroll', progress, { passive: true });
  window.addEventListener('resize', progress);
  nuxt.hook('page:start', () => cleanup());
  nuxt.hook('page:finish', () => {
    requestAnimationFrame(() => {
      setup();
      progress();
    });
  });
  nuxt.hook('app:mounted', () => {
    choice.value = saved === 'on' || saved === 'off' ? saved : null;
    onPreference();
    setMode();
    setup();
    progress();
  });
  nuxt.vueApp.onUnmount(() => {
    cleanup();
    cancelAnimationFrame(frame);
    preference.removeEventListener('change', onPreference);
    window.removeEventListener('scroll', progress);
    window.removeEventListener('resize', progress);
  });
});
