// Easing function: easeInOutQuint
// Smooth easing with quintic curve
export function easeInOutQuint(t) {
  return t < 0.5
    ? 16 * t * t * t * t * t
    : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

// Calculate FOV based on horizontal FOV and aspect ratio
export function calculateVerticalFOV(hFOV, aspectRatio) {
  const vFov = 2 * Math.atan(Math.tan(hFOV * Math.PI / 360) / aspectRatio) * (180 / Math.PI);
  return Math.max(70, vFov);
}

// Calculate staggered animation progress for a specific item
export function calculateStaggeredProgress(progress, itemIndex, totalItems, staggerDelay) {
  const starDelay = (itemIndex / totalItems) * staggerDelay;
  return Math.max(0, Math.min(1, (progress - starDelay) / (1 - staggerDelay)));
}
