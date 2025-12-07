import * as THREE from 'three/webgpu';
import {STAR_RADIUS} from '../config/constants.js';

// The 12 vertices of an icosahedron with poles at (±1, 0, 0)
// Using exact coordinates from the provided definition
export function createIcosahedronVertices() {
  const sqrt5 = Math.sqrt(5);
  const radius = 1.29 * STAR_RADIUS;

  const icosahedronVerticesRaw = [
    // a1: North pole at (+1, 0, 0)
    new THREE.Vector3(1, 0, 0),

    // Northern hemisphere ring (a2-a6)
    // a2
    new THREE.Vector3(1 / sqrt5, 2 / sqrt5, 0),
    // a3
    new THREE.Vector3(1 / sqrt5, (5 - sqrt5) / 10, Math.sqrt((5 + sqrt5) / 10)),
    // a4
    new THREE.Vector3(1 / sqrt5, (-5 - sqrt5) / 10, Math.sqrt((5 - sqrt5) / 10)),
    // a5
    new THREE.Vector3(1 / sqrt5, (-5 - sqrt5) / 10, -Math.sqrt((5 - sqrt5) / 10)),
    // a6
    new THREE.Vector3(1 / sqrt5, (5 - sqrt5) / 10, -Math.sqrt((5 + sqrt5) / 10)),

    // a7: South pole at (-1, 0, 0)
    new THREE.Vector3(-1, 0, 0),

    // Southern hemisphere ring (a8-a12)
    // a8
    new THREE.Vector3(-1 / sqrt5, -2 / sqrt5, 0),
    // a9
    new THREE.Vector3(-1 / sqrt5, (-5 + sqrt5) / 10, -Math.sqrt((5 + sqrt5) / 10)),
    // a10
    new THREE.Vector3(-1 / sqrt5, (5 + sqrt5) / 10, -Math.sqrt((5 - sqrt5) / 10)),
    // a11
    new THREE.Vector3(-1 / sqrt5, (5 + sqrt5) / 10, Math.sqrt((5 - sqrt5) / 10)),
    // a12
    new THREE.Vector3(-1 / sqrt5, (-5 + sqrt5) / 10, Math.sqrt((5 + sqrt5) / 10)),
  ];

  return icosahedronVerticesRaw.map(v => v.normalize().multiplyScalar(radius));
}
