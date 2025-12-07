import * as THREE from 'three/webgpu';
import {CLOTH_CONFIG} from '../config/constants.js';

// Calculate rest distances based on cloth size and segments for each direction
export const restDistanceU = CLOTH_CONFIG.height / CLOTH_CONFIG.ySegs;  // Vertical spacing (U maps to vertical)
export const restDistanceV = CLOTH_CONFIG.width / CLOTH_CONFIG.xSegs;   // Horizontal spacing (V maps to horizontal)

// Create cloth function once - layout flag vertically (top to bottom)
export const clothFunc = function (u, v, target) {
  const x = (v - 0.5) * CLOTH_CONFIG.width;   // V maps to horizontal (x)
  const y = -(u - 0.5) * CLOTH_CONFIG.height; // U maps to vertical (y), negative for top at positive Y
  const z = 0;
  target.set(x, y, z);
};

export function Particle(x, y, z, mass) {
  this.position = new THREE.Vector3();
  this.previous = new THREE.Vector3();
  this.original = new THREE.Vector3();
  this.a = new THREE.Vector3(0, 0, 0);
  this.mass = mass;
  this.invMass = 1 / mass;
  this.tmp = new THREE.Vector3();
  this.tmp2 = new THREE.Vector3();

  clothFunc(x, y, this.position);
  clothFunc(x, y, this.previous);
  clothFunc(x, y, this.original);
}

Particle.prototype.addForce = function (force) {
  this.a.add(this.tmp2.copy(force).multiplyScalar(this.invMass));
};

Particle.prototype.integrate = function (timesq, DAMPING) {
  const DRAG = 1 - DAMPING;
  const newPos = this.tmp.subVectors(this.position, this.previous);
  newPos.multiplyScalar(DRAG).add(this.position);
  newPos.add(this.a.multiplyScalar(timesq));

  this.tmp = this.previous;
  this.previous = this.position;
  this.position = newPos;

  this.a.set(0, 0, 0);
};

const diff = new THREE.Vector3();

export function satisfyConstraints([p1, p2, distance]) {
  diff.subVectors(p2.position, p1.position);
  const currentDist = diff.length();
  if (currentDist === 0) return;
  const correction = diff.multiplyScalar(1 - distance / currentDist);
  const correctionHalf = correction.multiplyScalar(0.5);
  p1.position.add(correctionHalf);
  p2.position.sub(correctionHalf);
}

export function Cloth(w, h, MASS) {
  this.w = w;
  this.h = h;
  const particles = [];
  const constraints = [];

  for (let v = 0; v <= h; v++) {
    for (let u = 0; u <= w; u++) {
      particles.push(new Particle(u / w, v / h, 0, MASS));
    }
  }

  const index = (u, v) => u + v * (w + 1);

  for (let v = 0; v < h; v++) {
    for (let u = 0; u < w; u++) {
      // Vertical constraints (V direction) use restDistanceV
      constraints.push([particles[index(u, v)], particles[index(u, v + 1)], restDistanceV]);
      // Horizontal constraints (U direction) use restDistanceU
      constraints.push([particles[index(u, v)], particles[index(u + 1, v)], restDistanceU]);
    }
  }

  for (let u = w, v = 0; v < h; v++) {
    constraints.push([particles[index(u, v)], particles[index(u, v + 1)], restDistanceV]);
  }

  for (let v = h, u = 0; u < w; u++) {
    constraints.push([particles[index(u, v)], particles[index(u + 1, v)], restDistanceU]);
  }

  this.particles = particles;
  this.constraints = constraints;
  this.index = index;
}

// Helper function to get cloth position and normal by interpolating between particles
export function getClothPositionAtUV(cloth, u, v) {
  const particles = cloth.particles;

  // Clamp u and v to valid range
  u = Math.max(0, Math.min(1, u));
  v = Math.max(0, Math.min(1, v));

  // Find the four surrounding particles
  const x = u * cloth.w;
  const y = v * cloth.h;

  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(x0 + 1, cloth.w);
  const y1 = Math.min(y0 + 1, cloth.h);

  // Get fractional parts for interpolation
  const fx = x - x0;
  const fy = y - y0;

  // Get the four corner particles
  const p00 = particles[cloth.index(x0, y0)].position;
  const p10 = particles[cloth.index(x1, y0)].position;
  const p01 = particles[cloth.index(x0, y1)].position;
  const p11 = particles[cloth.index(x1, y1)].position;

  // Bilinear interpolation
  const top = new THREE.Vector3().lerpVectors(p00, p10, fx);
  const bottom = new THREE.Vector3().lerpVectors(p01, p11, fx);
  const position = new THREE.Vector3().lerpVectors(top, bottom, fy);

  // Calculate normal from the cloth surface
  const dx = p10.clone().sub(p00);
  const dy = p01.clone().sub(p00);
  const normal = new THREE.Vector3().crossVectors(dx, dy);
  normal.normalize();

  return {position, normal};
}

// Store edge particle indices for soft constraints
export function createEdgeIndices(cloth) {
  const topEdge = [];     // Top edge
  const bottomEdge = [];  // Bottom edge
  const leftEdge = [];    // Left edge
  const rightEdge = [];   // Right edge

  // Top edge (all particles)
  for (let i = 0; i <= cloth.w; i++) {
    topEdge.push(cloth.index(i, 0));
  }

  // Bottom edge (all particles)
  for (let i = 0; i <= cloth.w; i++) {
    bottomEdge.push(cloth.index(i, cloth.h));
  }

  // Left edge (excluding corners to avoid double-constraint)
  for (let i = 1; i < cloth.h; i++) {
    leftEdge.push(cloth.index(0, i));
  }

  // Right edge (excluding corners to avoid double-constraint)
  for (let i = 1; i < cloth.h; i++) {
    rightEdge.push(cloth.index(cloth.w, i));
  }

  return {topEdge, bottomEdge, leftEdge, rightEdge};
}
