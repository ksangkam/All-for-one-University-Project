const BUTTON_SELECTOR = 'button:not(.menu-btn), a.btn';

// Increase stiffness for a tighter pull. Increase damping for fewer, shorter rebounds.
const POSITION_STIFFNESS = 190;
const POSITION_DAMPING = 22;
const SCALE_STIFFNESS = 280;
const SCALE_DAMPING = 21;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function initMagneticButtons(root = document) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const states = new WeakMap();

  function attach(button) {
    if (states.has(button)) return;
    const state = {
      x: 0, y: 0, vx: 0, vy: 0,
      targetX: 0, targetY: 0,
      sx: 1, sy: 1, svx: 0, svy: 0,
      targetSX: 1, targetSY: 1,
      pointerActive: false,
      lastTime: 0,
      frame: 0,
    };
    states.set(button, state);
    button.classList.add('magnetic-button');

    const settlePointer = () => {
      state.pointerActive = false;
      state.targetX = state.targetY = 0;
      state.targetSX = state.targetSY = 1;
      requestFrame();
    };

    function pointerMove(event) {
      if (reduceMotion.matches || (event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
      const rect = button.getBoundingClientRect();
      const nx = clamp(((event.clientX - rect.left) / rect.width - .5) * 2, -1, 1);
      const ny = clamp(((event.clientY - rect.top) / rect.height - .5) * 2, -1, 1);
      state.pointerActive = true;
      state.targetX = nx * 7;
      state.targetY = ny * 5;
      // Expand along the cursor direction and gently compress across it.
      state.targetSX = 1 + Math.abs(nx) * .045 - Math.abs(ny) * .012;
      state.targetSY = 1 + Math.abs(ny) * .04 - Math.abs(nx) * .012;
      requestFrame();
    }

    function requestFrame() {
      if (!state.frame) state.frame = requestAnimationFrame(tick);
    }

    function tick(now) {
      state.frame = 0;
      if (reduceMotion.matches) {
        state.x = state.y = state.vx = state.vy = 0;
        state.sx = state.sy = 1;
        state.svx = state.svy = 0;
        state.targetX = state.targetY = 0;
        state.targetSX = state.targetSY = 1;
        state.pointerActive = false;
        button.style.removeProperty('--mag-x');
        button.style.removeProperty('--mag-y');
        button.style.removeProperty('--mag-sx');
        button.style.removeProperty('--mag-sy');
        state.lastTime = 0;
        return;
      } else {
        const dt = Math.min((now - (state.lastTime || now)) / 1000, .032);
        state.lastTime = now;
        state.vx += ((state.targetX - state.x) * POSITION_STIFFNESS - state.vx * POSITION_DAMPING) * dt;
        state.vy += ((state.targetY - state.y) * POSITION_STIFFNESS - state.vy * POSITION_DAMPING) * dt;
        state.x += state.vx * dt;
        state.y += state.vy * dt;
        state.svx += ((state.targetSX - state.sx) * SCALE_STIFFNESS - state.svx * SCALE_DAMPING) * dt;
        state.svy += ((state.targetSY - state.sy) * SCALE_STIFFNESS - state.svy * SCALE_DAMPING) * dt;
        state.sx += state.svx * dt;
        state.sy += state.svy * dt;
      }

      button.style.setProperty('--mag-x', `${state.x.toFixed(2)}px`);
      button.style.setProperty('--mag-y', `${state.y.toFixed(2)}px`);
      button.style.setProperty('--mag-sx', state.sx.toFixed(4));
      button.style.setProperty('--mag-sy', state.sy.toFixed(4));

      const resting = Math.abs(state.x - state.targetX) + Math.abs(state.y - state.targetY)
          + Math.abs(state.vx) + Math.abs(state.vy) < .025
        && Math.abs(state.sx - state.targetSX) + Math.abs(state.sy - state.targetSY)
          + Math.abs(state.svx) + Math.abs(state.svy) < .002;
      if (resting) {
        state.x = state.targetX; state.y = state.targetY;
        state.sx = state.targetSX; state.sy = state.targetSY;
        state.vx = state.vy = state.svx = state.svy = 0;
        button.style.setProperty('--mag-x', `${state.x.toFixed(2)}px`);
        button.style.setProperty('--mag-y', `${state.y.toFixed(2)}px`);
        button.style.setProperty('--mag-sx', state.sx.toFixed(4));
        button.style.setProperty('--mag-sy', state.sy.toFixed(4));
        if (!state.pointerActive) {
          button.style.removeProperty('--mag-x');
          button.style.removeProperty('--mag-y');
          button.style.removeProperty('--mag-sx');
          button.style.removeProperty('--mag-sy');
        }
        state.lastTime = 0;
      } else requestFrame();
    }

    button.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') state.pointerActive = true;
    });
    button.addEventListener('pointermove', pointerMove);
    button.addEventListener('pointerleave', settlePointer);
    button.addEventListener('click', () => {
      if (reduceMotion.matches || button.matches(':disabled')) return;
      // Start compressed, then let the same damped spring overshoot and settle.
      state.sx = .93;
      state.sy = 1.07;
      state.svx = state.svy = 0;
      requestFrame();
    });
  }

  function scan(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.matches(BUTTON_SELECTOR)) attach(node);
    node.querySelectorAll(BUTTON_SELECTOR).forEach(attach);
  }

  scan(root.documentElement || root);
  const observer = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(scan)));
  observer.observe(root.body || root, { childList: true, subtree: true });
  reduceMotion.addEventListener?.('change', () => {
    if (reduceMotion.matches) root.querySelectorAll('.magnetic-button').forEach(button => {
      button.style.removeProperty('--mag-x');
      button.style.removeProperty('--mag-y');
      button.style.removeProperty('--mag-sx');
      button.style.removeProperty('--mag-sy');
    });
  });
}

export default initMagneticButtons;
