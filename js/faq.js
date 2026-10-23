export function initFaqAnimations() {
  const faq = document.querySelector('.faq');
  if (!faq) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const items = [...faq.querySelectorAll('details')];
  const states = new WeakMap();

  items.forEach((details, index) => {
    const summary = details.querySelector('summary');
    const answer = details.querySelector('.faq-answer');
    if (!summary || !answer) return;

    const state = { desiredOpen: details.open, animation: null };
    states.set(details, state);
    details.classList.add('faq-item');
    details.style.setProperty('--faq-stagger', `${index * 65}ms`);

    summary.addEventListener('click', event => {
      event.preventDefault();

      const open = !state.desiredOpen;
      state.desiredOpen = open;
      const startHeight = answer.getBoundingClientRect().height;
      const startOpacity = details.open
        ? Number.parseFloat(getComputedStyle(answer).opacity)
        : 0;
      state.animation?.cancel();
      state.animation = null;

      if (reducedMotion.matches) {
        details.open = open;
        details.classList.remove('faq-closing');
        answer.style.removeProperty('height');
        answer.style.removeProperty('opacity');
        return;
      }

      if (open) {
        details.open = true;
        details.classList.remove('faq-closing');
      } else {
        details.classList.add('faq-closing');
      }
      answer.style.height = `${startHeight}px`;
      answer.style.opacity = String(startOpacity);
      // Commit the starting size before measuring the expanded target.
      void answer.offsetHeight;
      const endHeight = open ? answer.scrollHeight : 0;
      const animation = answer.animate(
        [
          { height: `${startHeight}px`, opacity: startOpacity },
          { height: `${endHeight}px`, opacity: open ? 1 : 0 },
        ],
        { duration: 300, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' },
      );
      state.animation = animation;
      animation.onfinish = () => {
        if (state.animation !== animation) return;
        if (!open) details.open = false;
        details.classList.remove('faq-closing');
        answer.style.removeProperty('height');
        answer.style.removeProperty('opacity');
        state.animation = null;
      };
    });
  });

  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const entranceObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      items.forEach(item => item.classList.add('faq-enter'));
      entranceObserver.disconnect();
    }, { threshold: 0.15 });
    entranceObserver.observe(faq);
  }

  reducedMotion.addEventListener?.('change', () => {
    if (!reducedMotion.matches) return;
    items.forEach(details => {
      const state = states.get(details);
      const answer = details.querySelector('.faq-answer');
      if (!state || !answer) return;
      state.animation?.cancel();
      state.animation = null;
      details.open = state.desiredOpen;
      details.classList.remove('faq-closing');
      answer.style.removeProperty('height');
      answer.style.removeProperty('opacity');
    });
  });
}
