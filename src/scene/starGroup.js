import * as THREE from 'three/webgpu';
import {createIcosahedronVertices} from '../geometry/icosahedron.js';
import {StarMesh} from '../mesh/star.js';
import {FLAG_RADIUS, FLAG_Z, CLOTH_CONFIG, STAR_RADIUS} from '../config/constants.js';

// Helper function to determine up vector based on face position
// Poles are now at (±1, 0, 0) on X-axis
function getUpVector(faceCenter) {
  const x = faceCenter.x;

  // Normalize to unit sphere to check position
  const normalized = faceCenter.clone().normalize();

  // North pole (x ≈ 1) at (+1, 0, 0)
  if (normalized.x > 0.99) {
    return new THREE.Vector3(0, -1, 0);
  }
  // South pole (x ≈ -1) at (-1, 0, 0)
  else if (normalized.x < -0.99) {
    return new THREE.Vector3(0, 1, 0);
  }
  // Eastern hemisphere (x > 0)
  else if (x > 0) {
    return new THREE.Vector3(-1, 0, 0);
  }
  // Western hemisphere (x < 0)
  else {
    return new THREE.Vector3(1, 0, 0);
  }
}

export function createStarGroup() {
  const icosahedronVertices = createIcosahedronVertices();

  const starGroup = new THREE.Group();
  const starData = [];

  // Create random stagger order for animation
  const staggerOrder = Array.from({length: icosahedronVertices.length}, (_, i) => i);
  // Fisher-Yates shuffle
  for (let i = staggerOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [staggerOrder[i], staggerOrder[j]] = [staggerOrder[j], staggerOrder[i]];
  }

  // For each icosahedron vertex (which is a dodecahedron face center and normal)
  for (let i = 0; i < icosahedronVertices.length; i++) {
    const faceCenter = icosahedronVertices[i];
    const normal = faceCenter.clone().normalize();

    const star = new StarMesh(STAR_RADIUS);

    // Position star at face center
    star.position.copy(faceCenter);

    // Orient star to face outward using lookAt
    star.lookAt(faceCenter.clone().add(normal));

    // Get appropriate up vector for this face and apply rotation
    const upVector = getUpVector(faceCenter);
    star.up.copy(upVector);

    // Reapply lookAt with the new up vector
    star.lookAt(faceCenter.clone().add(normal));

    starGroup.add(star);

    // Store dodecahedron position and rotation
    const dodecahedronPos = faceCenter.clone();

    starData.push({
      star: star,
      dodecahedronPos: dodecahedronPos,
      dodecahedronRot: star.quaternion.clone(),
      staggerIndex: staggerOrder[i],
    });
  }

  // Calculate flag positions for the first 12 stars (arranged in a circle)
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12 - Math.PI / 2; // Start at top

    const flagX = FLAG_RADIUS * Math.cos(angle);
    const flagY = FLAG_RADIUS * Math.sin(angle);

    // Calculate UV position (u maps to vertical, v maps to horizontal)
    const u = -flagY / CLOTH_CONFIG.height + 0.5;
    const v = flagX / CLOTH_CONFIG.width + 0.5;

    starData[i].flagPos = new THREE.Vector3(flagX, flagY, FLAG_Z);
    starData[i].flagUV = {u, v};

    // Flag rotation (all stars upright with one point up)
    const flagQuat = new THREE.Quaternion();
    flagQuat.setFromEuler(new THREE.Euler(0, 0, 0));
    starData[i].flagRot = flagQuat;
  }

  return {starGroup, starData};
}
