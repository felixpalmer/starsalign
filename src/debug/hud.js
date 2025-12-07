// FPS and performance tracking
let fpsFrames = 0;
let fpsLastUpdate = 0;
let startTime = 0;
const isDebugMode = window.location.hash.includes('debug');

export function initializeHUD() {
  startTime = performance.now();
  fpsLastUpdate = startTime;

  // Show HUD if debug mode is enabled
  if (isDebugMode) {
    const debugHud = document.getElementById('debug-hud');
    if (debugHud) debugHud.style.display = 'block';
  }
}

export function updateFPS(now) {
  if (!isDebugMode) return;

  const fpsCounter = document.getElementById('fps-counter');

  // Update FPS counter every 500ms
  fpsFrames++;
  if (now - fpsLastUpdate >= 500) {
    const fps = Math.round((fpsFrames * 1000) / (now - fpsLastUpdate));
    fpsCounter.textContent = `FPS: ${fps}`;
    fpsFrames = 0;
    fpsLastUpdate = now;
  }
}

export function updateTimeCounter(now) {
  if (!isDebugMode) return;

  const timeCounter = document.getElementById('time-counter');
  const elapsedSeconds = Math.floor((now - startTime) / 1000);
  timeCounter.textContent = `Time: ${elapsedSeconds}s`;
}

export function updateBackendInfo(renderer) {
  const backendCounter = document.getElementById('backend-counter');
  const backend = renderer.backend.constructor.name.replace('Backend', '');
  backendCounter.textContent = `Backend: ${backend}`;

  const debugInfo = document.getElementById('debug-info');
  debugInfo.textContent = `Backend: ${backend}\nRenderer: ${renderer.constructor.name}`;
}
