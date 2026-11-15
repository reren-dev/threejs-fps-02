export function createInput(domElement, onLockChange) {
  const state = {
    keys: new Set(),
    mouse: { x: 0, y: 0, dx: 0, dy: 0 },
    firing: false,
    altFiring: false,
    locked: false,
  };

  const mouseDelta = { x: 0, y: 0 };
  const buttons = {
    has(btn) {
      if (btn === 0) return state.firing;
      if (btn === 2) return state.altFiring;
      return false;
    }
  };

  let accumulatedDx = 0;
  let accumulatedDy = 0;

  window.addEventListener('keydown', (e) => {
    state.keys.add(e.code);
    if (e.code === 'KeyB' || e.code === 'KeyM' || e.code === 'KeyE' || e.code === 'KeyG') {
      // handled by game systems
    }
  });

  window.addEventListener('keyup', (e) => {
    state.keys.delete(e.code);
  });

  domElement.addEventListener('mousedown', (e) => {
    if (!state.locked) return;
    if (e.button === 0) state.firing = true;
    if (e.button === 2) state.altFiring = true;
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) state.firing = false;
    if (e.button === 2) state.altFiring = false;
  });

  document.addEventListener('pointerlockchange', () => {
    const locked = document.pointerLockElement === domElement;
    state.locked = locked;
    if (!locked) {
      state.firing = false;
      state.altFiring = false;
      state.keys.clear();
      mouseDelta.x = 0;
      mouseDelta.y = 0;
    }
    if (onLockChange) onLockChange(locked);
  });

  domElement.addEventListener('mousemove', (e) => {
    if (!state.locked) return;
    const dx = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    const dy = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
    mouseDelta.x += dx;
    mouseDelta.y += dy;
    accumulatedDx += dx;
    accumulatedDy += dy;
  });

  domElement.addEventListener('contextmenu', (e) => e.preventDefault());

  return {
    state,
    keys: state.keys,
    get isLocked() { return state.locked; },
    mouseDelta,
    buttons,
    requestLock() {
      domElement.requestPointerLock();
    },
    takeLook() {
      const dx = accumulatedDx;
      const dy = accumulatedDy;
      accumulatedDx = 0;
      accumulatedDy = 0;
      return { x: dx, y: dy };
    },
  };
}
