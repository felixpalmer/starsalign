// Cloth configuration (flag hangs vertically)
export const CLOTH_CONFIG = {
  width: 30,   // Horizontal width
  height: 54,  // Vertical height
  xSegs: 15,   // Horizontal segments
  ySegs: 20    // Vertical segments
};

// Flag layout spec. We do not respect the 2:3 proportion in order to fill the screen on mobile
// Instead the width of the cloth is used as the dimension for the layout
export const FLAG_RADIUS = CLOTH_CONFIG.width * (1 / 3);
export const STAR_RADIUS = CLOTH_CONFIG.width * (1 / 18);

// Spring physics constants
export const SPRING_CONSTANTS = {
  PUSH_STRENGTH: 0.01,
  SPRING_STRENGTH: 0.01,
  SPRING_DAMPING: 0.9,
  sphereRestPosition: {x: 0, y: 0, z: 25}
};

// Animation constants
export const ANIMATION_DURATION = 2;
export const DAMPING_FACTOR = 0.13;

// Physics constants
export const TIMESTEP = 18 / 1000;
export const CLOTH_UPDATE_INTERVAL = 30; // Run cloth sim every 30ms to reduce power draw

// Cloth simulation parameters
export const CLOTH_PARAMS = {
  DAMPING: 0.09,
  MASS: 0.13,
  GRAVITY: 0.0,
  CONSTRAINT_ITERATIONS: 1,
  WIND_STRENGTH: 0.3,
  WIND_SPEED: 2.7,
  CORNER_FORCE_STRENGTH: 13.5,
};

// Dodecahedron constants
export const DODECAHEDRON_RADIUS = 2.2;
export const STAR_ROTATION = Math.PI / 10;

// Flag constants
export const FLAG_Z = 0.1;
