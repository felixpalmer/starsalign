import * as THREE from 'three/webgpu';
import {satisfyConstraints} from './Cloth.js';

// Reusable vectors to avoid garbage collection
const _localWind = new THREE.Vector3();
const _normal = new THREE.Vector3();
const _tmpForce = new THREE.Vector3();
const _impulseForce = new THREE.Vector3();

// Cloth simulation function
export function simulateCloth(cloth, flagBackgroundGeometry, edgeIndices, windImpulses, clothParams, now, deltaTime) {
  const particles = cloth.particles;
  const {topEdge, bottomEdge, leftEdge, rightEdge} = edgeIndices;

  // Use actual delta time for frame-rate independent physics
  const dt = Math.min(deltaTime || 0.016, 0.033); // Cap at ~30fps for stability
  const dtSq = dt * dt;

  // Apply turbulent wind force (varies per particle)
  const normals = flagBackgroundGeometry.attributes.normal;
  const positions = flagBackgroundGeometry.attributes.position;

  for (let i = 0; i < particles.length; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);

    // Create turbulent wind that varies across the cloth
    const windStrength = clothParams.WIND_STRENGTH * (Math.cos(now / (7000 / clothParams.WIND_SPEED) + x * 0.1) * 2 + 4) *
      (1 + Math.sin(now / (5000 / clothParams.WIND_SPEED) + y * 0.15) * 0.3);

    // Wind direction varies with position and time (reuse vector)
    _localWind.set(
      Math.sin(now / (2000 / clothParams.WIND_SPEED) + x * 0.5),
      Math.cos(now / (3000 / clothParams.WIND_SPEED) + y * 0.8),
      Math.sin(now / (1500 / clothParams.WIND_SPEED) + x * 0.3 + y * 0.4)
    );
    _localWind.normalize();
    _localWind.multiplyScalar(windStrength);

    // Reuse normal vector
    _normal.fromBufferAttribute(normals, i);
    _tmpForce.copy(_normal).normalize().multiplyScalar(_normal.dot(_localWind));
    particles[i].addForce(_tmpForce);

    // Apply wind impulses from clicks
    for (let j = windImpulses.length - 1; j >= 0; j--) {
      const impulse = windImpulses[j];
      const particlePos = particles[i].position;
      const distance = particlePos.distanceTo(impulse.position);

      if (distance < impulse.radius) {
        // Calculate falloff based on distance
        const falloff = 1 - (distance / impulse.radius);
        _impulseForce.set(0, 0, -1); // Push away from camera
        _impulseForce.multiplyScalar(impulse.strength * falloff * falloff);
        particles[i].addForce(_impulseForce);
      }
    }
  }

  // Apply gravity and integrate (downward in Y)
  const gravity = new THREE.Vector3(0, -clothParams.GRAVITY, 0).multiplyScalar(clothParams.MASS);
  for (let i = 0; i < particles.length; i++) {
    particles[i].addForce(gravity);
    particles[i].integrate(dtSq, clothParams.DAMPING);
  }

  // Satisfy constraints (multiple iterations for stiffness)
  for (let iteration = 0; iteration < clothParams.CONSTRAINT_ITERATIONS; iteration++) {
    for (let i = 0; i < cloth.constraints.length; i++) {
      const constraint = cloth.constraints[i];
      satisfyConstraints(constraint);
    }
  }

  // Apply soft constraint to all edges equally to maintain flag shape
  const edgeForceMultiplier = clothParams.CORNER_FORCE_STRENGTH * 0.01;
  const _diff = new THREE.Vector3(); // Reuse for all edge calculations

  // Top edge
  for (let i = 0; i < topEdge.length; i++) {
    const particle = particles[topEdge[i]];
    _diff.subVectors(particle.original, particle.position);
    particle.position.add(_diff.multiplyScalar(edgeForceMultiplier));
  }

  // Bottom edge
  for (let i = 0; i < bottomEdge.length; i++) {
    const particle = particles[bottomEdge[i]];
    _diff.subVectors(particle.original, particle.position);
    particle.position.add(_diff.multiplyScalar(edgeForceMultiplier));
  }

  // Left edge
  for (let i = 0; i < leftEdge.length; i++) {
    const particle = particles[leftEdge[i]];
    _diff.subVectors(particle.original, particle.position);
    particle.position.add(_diff.multiplyScalar(edgeForceMultiplier));
  }

  // Right edge
  for (let i = 0; i < rightEdge.length; i++) {
    const particle = particles[rightEdge[i]];
    _diff.subVectors(particle.original, particle.position);
    particle.position.add(_diff.multiplyScalar(edgeForceMultiplier));
  }

  // Update geometry
  for (let i = 0; i < particles.length; i++) {
    const v = particles[i].position;
    flagBackgroundGeometry.attributes.position.setXYZ(i, v.x, v.y, v.z);
  }
  flagBackgroundGeometry.attributes.position.needsUpdate = true;
  flagBackgroundGeometry.computeVertexNormals();
}
